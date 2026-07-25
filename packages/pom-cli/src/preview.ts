import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildPptx, DiagnosticsError } from "@hirokisakabe/pom";
import JSZip from "jszip";
import { convertPptxToSvg } from "pptx-glimpse";
import { EXTRA_FONT_MAPPING, resolveBundledFontsDir } from "./glimpse.ts";
import { loadInput, loadInputContent, type LoadedInput } from "./input.ts";
import {
  renderPresentation,
  type RenderedSlide,
  type RenderFormat,
} from "./render.ts";
import { watchInputFile } from "./watch.ts";

const DEFAULT_PORT = 3000;
const MAX_REQUEST_BYTES = 10 * 1024 * 1024;

interface PreviewDocument {
  xml: string;
  revision: string;
  filename: string;
  editable: boolean;
}

interface PreviewSuccess {
  svgs: string[];
}

interface PreviewFailure {
  errors: Array<{
    type: string;
    message: string;
    line?: number;
    column?: number;
  }>;
}

type PreviewResult = PreviewSuccess | PreviewFailure;

interface ImageExportOptions {
  format: RenderFormat;
  slides?: number[];
}

class SaveConflictError extends Error {
  constructor() {
    super("The file changed outside pom preview. Reload before saving.");
    this.name = "SaveConflictError";
  }
}

class RequestTooLargeError extends Error {}

function makeLog(verbose: boolean) {
  if (!verbose) return (_msg: string) => {};
  return (msg: string) => process.stderr.write(`[pom] ${msg}\n`);
}

function openBrowser(url: string): void {
  let cmd: string;
  let args: string[];
  if (process.platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (process.platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", "", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }
  const child = spawn(cmd, args, { stdio: "ignore", detached: true });
  child.on("error", () => {
    console.log(`Could not open browser automatically. Open ${url} manually.`);
  });
  child.unref();
}

function revisionOf(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

export function readPreviewDocument(absInput: string): PreviewDocument {
  const content = fs.readFileSync(absInput, "utf8");
  const loaded = loadInputContent(absInput, content);
  return {
    xml: loaded.xml,
    revision: revisionOf(content),
    filename: path.basename(absInput),
    editable: absInput.endsWith(".pom.xml"),
  };
}

export async function atomicWriteFile(
  target: string,
  content: string,
  expectedRevision?: string,
): Promise<void> {
  const temp = path.join(
    path.dirname(target),
    `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`,
  );
  const mode = (await fs.promises.stat(target)).mode;
  try {
    const handle = await fs.promises.open(temp, "wx", mode);
    try {
      await handle.writeFile(content, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    if (expectedRevision !== undefined) {
      const current = await fs.promises.readFile(target, "utf8");
      if (revisionOf(current) !== expectedRevision) {
        throw new SaveConflictError();
      }
    }
    await fs.promises.rename(temp, target);
  } catch (error) {
    await fs.promises.unlink(temp).catch(() => {});
    throw error;
  }
}

export async function savePreviewDocument(
  absInput: string,
  xml: string,
  expectedRevision: string,
): Promise<string> {
  if (!absInput.endsWith(".pom.xml")) {
    throw new Error(
      "Only .pom.xml files can be saved from the preview editor.",
    );
  }
  const current = await fs.promises.readFile(absInput, "utf8");
  if (revisionOf(current) !== expectedRevision) throw new SaveConflictError();
  await atomicWriteFile(absInput, xml, expectedRevision);
  return revisionOf(xml);
}

async function generateSvgs(
  xml: string,
  context: Pick<LoadedInput, "slideWidth" | "slideHeight" | "masterPptxData">,
  verbose = false,
): Promise<PreviewSuccess> {
  if (!xml.trim()) return { svgs: [] };
  const log = makeLog(verbose);
  const t1 = Date.now();
  const { pptx } = await buildPptx(
    xml,
    { w: context.slideWidth, h: context.slideHeight },
    {
      textMeasurement: "fallback",
      ...(context.masterPptxData ? { masterPptx: context.masterPptxData } : {}),
    },
  );
  log(`Building PPTX... done (${Date.now() - t1}ms)`);
  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }
  const t2 = Date.now();
  const { slides } = await convertPptxToSvg(buffer, {
    width: context.slideWidth,
    fontDirs: [resolveBundledFontsDir()],
    fontMapping: EXTRA_FONT_MAPPING,
    skipSystemFonts: true,
    textOutput: "text",
  });
  log(`Converting to SVG... done (${Date.now() - t2}ms)`);
  return { svgs: slides.map((slide) => slide.svg) };
}

async function generatePptx(
  xml: string,
  context: Pick<LoadedInput, "slideWidth" | "slideHeight" | "masterPptxData">,
): Promise<Uint8Array> {
  const { pptx } = await buildPptx(
    xml,
    { w: context.slideWidth, h: context.slideHeight },
    {
      ...(context.masterPptxData ? { masterPptx: context.masterPptxData } : {}),
      strict: true,
    },
  );
  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }
  return buffer;
}

function previewFailure(error: unknown): PreviewFailure {
  if (error instanceof DiagnosticsError) {
    return {
      errors: error.diagnostics.map((diagnostic) => ({
        type: diagnostic.code,
        message: diagnostic.message,
      })),
    };
  }
  return {
    errors: [
      {
        type: "unknown",
        message: error instanceof Error ? error.message : String(error),
      },
    ],
  };
}

function buildPreviewHtml(filename: string): string {
  const title = `pom — ${filename}`
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>*{box-sizing:border-box}html,body,#root{height:100%;margin:0}body{font-family:Inter,ui-sans-serif,system-ui,sans-serif}body>div[role=alert]{padding:24px;color:#b91c1c}</style>
</head>
<body>
  <div id="root">Loading editor...</div>
  <script src="/_assets/preview.js" defer></script>
</body>
</html>`;
}

async function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    let tooLarge = false;
    req.setEncoding("utf8");
    req.on("data", (chunk: string) => {
      if (tooLarge) return;
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_REQUEST_BYTES) {
        tooLarge = true;
        body = "";
        reject(new RequestTooLargeError("Request body is too large"));
        return;
      }
      body += chunk;
    });
    req.on("end", () => {
      if (tooLarge) return;
      try {
        resolve(JSON.parse(body) as unknown);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
    req.on("error", reject);
  });
}

function readStringField(value: unknown, field: "xml" | "revision"): string {
  if (
    typeof value !== "object" ||
    value === null ||
    typeof (value as Record<string, unknown>)[field] !== "string"
  ) {
    throw new Error(`Expected a string ${field} field`);
  }
  return (value as Record<string, string>)[field];
}

function readImageExportOptions(value: unknown): ImageExportOptions {
  if (typeof value !== "object" || value === null) {
    throw new Error("Expected an image export request");
  }
  const request = value as Record<string, unknown>;
  if (request.format !== "png" && request.format !== "svg") {
    throw new Error('Expected format to be "png" or "svg"');
  }
  if (
    request.slides !== undefined &&
    (!Array.isArray(request.slides) ||
      request.slides.length === 0 ||
      !request.slides.every(
        (slide) => Number.isInteger(slide) && Number(slide) > 0,
      ))
  ) {
    throw new Error("Expected slides to contain positive integers");
  }
  return {
    format: request.format,
    ...(request.slides
      ? { slides: request.slides.map((slide) => Number(slide)) }
      : {}),
  };
}

function sendJson(
  res: http.ServerResponse,
  status: number,
  value: unknown,
): void {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(value));
}

function outputBaseName(absInput: string): string {
  return path.basename(absInput).replace(/\.pom\.(?:xml|md)$/u, "");
}

function encodeRfc5987(value: string): string {
  return encodeURIComponent(value).replace(
    /['()*]/gu,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function sendAttachment(
  res: http.ServerResponse,
  data: string | Uint8Array,
  mediaType: string,
  filename: string,
): void {
  const buffer = Buffer.from(data);
  res.writeHead(200, {
    "Content-Type": mediaType,
    "Content-Disposition": `attachment; filename="download"; filename*=UTF-8''${encodeRfc5987(
      filename,
    )}`,
    "Content-Length": buffer.byteLength,
    "Cache-Control": "no-store",
    "X-Pom-Filename": encodeURIComponent(filename),
  });
  res.end(buffer);
}

export interface PreviewServerOptions {
  verbose?: boolean;
  clientScript?: string;
  generatePreview?: (xml: string) => Promise<PreviewResult>;
  generatePptx?: (xml: string) => Promise<Uint8Array>;
  renderImages?: (
    xml: string,
    options: ImageExportOptions,
  ) => Promise<RenderedSlide[]>;
  onDocumentEvent?: (document: PreviewDocument) => void;
}

export function createPreviewServer(
  absInput: string,
  options: PreviewServerOptions = {},
): http.Server {
  const verbose = options.verbose ?? false;
  const eventClients = new Set<http.ServerResponse>();
  const ignoredWatchRevisions = new Map<string, NodeJS.Timeout>();
  let saveQueue = Promise.resolve();
  const clientScriptPath = fileURLToPath(
    new URL("./assets/preview.js", import.meta.url),
  );

  function sendDocumentEvent(document: PreviewDocument): void {
    options.onDocumentEvent?.(document);
    const data = JSON.stringify(document);
    for (const client of eventClients) {
      client.write(`event: document\ndata: ${data}\n\n`);
    }
  }

  function ignoreNextWatch(revision: string): void {
    const existing = ignoredWatchRevisions.get(revision);
    if (existing) clearTimeout(existing);
    const timer = setTimeout(() => {
      ignoredWatchRevisions.delete(revision);
    }, 1000);
    ignoredWatchRevisions.set(revision, timer);
  }

  function stopIgnoringWatch(revision: string): void {
    const timer = ignoredWatchRevisions.get(revision);
    if (timer) clearTimeout(timer);
    ignoredWatchRevisions.delete(revision);
  }

  function serializeSave<T>(save: () => Promise<T>): Promise<T> {
    const result = saveQueue.then(save, save);
    saveQueue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  const watcher = watchInputFile(absInput, () => {
    try {
      const document = readPreviewDocument(absInput);
      if (ignoredWatchRevisions.has(document.revision)) {
        stopIgnoringWatch(document.revision);
        return;
      }
      sendDocumentEvent(document);
    } catch (error) {
      const data = JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      });
      for (const client of eventClients) {
        client.write(`event: document\ndata: ${data}\n\n`);
      }
    }
  });

  async function handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
  ): Promise<void> {
    try {
      const host = req.headers.host;
      if (!host) throw new Error("Missing Host header");
      const hostname = host.startsWith("[")
        ? host.slice(1, host.indexOf("]"))
        : host.split(":", 1)[0];
      if (hostname !== "localhost" && hostname !== "127.0.0.1") {
        sendJson(res, 403, { message: "Invalid Host header" });
        return;
      }
      const origin = req.headers.origin;
      if (origin && origin !== `http://${host}`) {
        sendJson(res, 403, { message: "Invalid Origin header" });
        return;
      }
      const url = new URL(req.url ?? "/", "http://localhost");
      if (req.method === "GET" && url.pathname === "/") {
        res.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy":
            "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'none'",
        });
        res.end(buildPreviewHtml(path.basename(absInput)));
        return;
      }
      if (req.method === "GET" && url.pathname === "/_assets/preview.js") {
        const script =
          options.clientScript ?? fs.readFileSync(clientScriptPath, "utf8");
        res.writeHead(200, {
          "Content-Type": "text/javascript; charset=utf-8",
          "Cache-Control": "no-cache",
        });
        res.end(script);
        return;
      }
      if (req.method === "GET" && url.pathname === "/_api/document") {
        sendJson(res, 200, readPreviewDocument(absInput));
        return;
      }
      if (req.method === "POST" && url.pathname === "/_api/preview") {
        const body = await readJsonBody(req);
        const xml = readStringField(body, "xml");
        try {
          const result = options.generatePreview
            ? await options.generatePreview(xml)
            : await generateSvgs(xml, loadInput(absInput), verbose);
          sendJson(res, 200, result);
        } catch (error) {
          sendJson(res, 422, previewFailure(error));
        }
        return;
      }
      if (req.method === "POST" && url.pathname === "/_api/export/pptx") {
        const body = await readJsonBody(req);
        const xml = readStringField(body, "xml");
        try {
          const buffer = options.generatePptx
            ? await options.generatePptx(xml)
            : await generatePptx(xml, loadInput(absInput));
          sendAttachment(
            res,
            buffer,
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            `${outputBaseName(absInput)}.pptx`,
          );
        } catch (error) {
          sendJson(res, 422, previewFailure(error));
        }
        return;
      }
      if (req.method === "POST" && url.pathname === "/_api/export/images") {
        const body = await readJsonBody(req);
        const xml = readStringField(body, "xml");
        const imageOptions = readImageExportOptions(body);
        try {
          let outputs: RenderedSlide[];
          if (options.renderImages) {
            outputs = await options.renderImages(xml, imageOptions);
          } else {
            const context = loadInput(absInput);
            outputs = await renderPresentation(
              xml,
              {
                slideWidth: context.slideWidth,
                slideHeight: context.slideHeight,
                ...(context.masterPptxData
                  ? { masterPptxData: context.masterPptxData }
                  : {}),
              },
              {
                ...imageOptions,
                ...(imageOptions.format === "svg"
                  ? { textOutput: "text" as const }
                  : {}),
                verbose,
              },
            );
          }
          const padWidth = Math.max(
            2,
            ...outputs.map((output) => String(output.slideNumber).length),
          );
          const files = outputs.map((output) => ({
            filename: `${outputBaseName(absInput)}-slide-${String(
              output.slideNumber,
            ).padStart(padWidth, "0")}.${imageOptions.format}`,
            data: output.data,
          }));
          if (imageOptions.slides !== undefined && files.length === 1) {
            const file = files[0];
            sendAttachment(
              res,
              file.data,
              imageOptions.format === "png" ? "image/png" : "image/svg+xml",
              file.filename,
            );
          } else {
            const zip = new JSZip();
            for (const file of files) {
              zip.file(file.filename, file.data);
            }
            sendAttachment(
              res,
              await zip.generateAsync({ type: "uint8array" }),
              "application/zip",
              `${outputBaseName(absInput)}-${imageOptions.format}-images.zip`,
            );
          }
        } catch (error) {
          sendJson(res, 422, previewFailure(error));
        }
        return;
      }
      if (req.method === "PUT" && url.pathname === "/_api/document") {
        const body = await readJsonBody(req);
        const xml = readStringField(body, "xml");
        const revision = readStringField(body, "revision");
        try {
          const nextRevision = revisionOf(xml);
          ignoreNextWatch(nextRevision);
          await serializeSave(() =>
            savePreviewDocument(absInput, xml, revision),
          );
          sendJson(res, 200, { revision: nextRevision });
          sendDocumentEvent(readPreviewDocument(absInput));
        } catch (error) {
          stopIgnoringWatch(revisionOf(xml));
          if (error instanceof SaveConflictError) {
            sendJson(res, 409, { code: "conflict", message: error.message });
          } else {
            throw error;
          }
        }
        return;
      }
      if (req.method === "GET" && url.pathname === "/_events") {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(": connected\n\n");
        eventClients.add(res);
        req.on("close", () => eventClients.delete(res));
        return;
      }
      sendJson(res, 404, { message: "Not found" });
    } catch (error) {
      sendJson(res, error instanceof RequestTooLargeError ? 413 : 400, {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  const server = http.createServer((req, res) => {
    void handleRequest(req, res);
  });
  server.on("close", () => {
    watcher.close();
    for (const timer of ignoredWatchRevisions.values()) clearTimeout(timer);
    ignoredWatchRevisions.clear();
    for (const client of eventClients) client.end();
    eventClients.clear();
  });
  return server;
}

export function runPreview(
  inputFile: string,
  port: number = DEFAULT_PORT,
  options: { verbose?: boolean; open?: boolean } = {},
): void {
  const absInput = path.resolve(inputFile);
  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }
  const server = createPreviewServer(absInput, { verbose: options.verbose });
  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Is another pom preview running?`,
      );
    } else {
      console.error(`Server error: ${error.message}`);
    }
    process.exit(1);
  });
  server.listen(port, "127.0.0.1", () => {
    const url = `http://localhost:${port}`;
    console.log(`Preview server: ${url}`);
    console.log(`Watching: ${absInput}`);
    console.log("Press Ctrl+C to stop");
    if (options.open ?? true) openBrowser(url);
  });
}
