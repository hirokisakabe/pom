import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { DiagnosticsError } from "@hirokisakabe/pom";
import JSZip from "jszip";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const watchState = vi.hoisted(() => ({
  callback: null as (() => void) | null,
}));

vi.mock("./watch.ts", () => ({
  watchInputFile: (_absPath: string, onChange: () => void) => {
    watchState.callback = onChange;
    return { close: vi.fn() };
  },
}));

import {
  atomicWriteFile,
  createPreviewServer,
  readPreviewDocument,
  savePreviewDocument,
} from "./preview.ts";

const INITIAL_XML = "<VStack><Text>initial</Text></VStack>";
let tempDir: string;
let inputFile: string;
let server: http.Server | null;
let baseUrl: string;

beforeEach(async () => {
  tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "pom-preview-"));
  inputFile = path.join(tempDir, "slides.pom.xml");
  await fs.promises.writeFile(inputFile, INITIAL_XML);
  server = null;
  watchState.callback = null;
});

afterEach(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) =>
      server?.close((error) => (error ? reject(error) : resolve())),
    );
  }
  await fs.promises.rm(tempDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

async function startServer(
  generatePreview = vi.fn().mockResolvedValue({ svgs: [] }),
  onDocumentEvent?: ReturnType<typeof vi.fn>,
  exportOptions: {
    generatePptx?: ReturnType<typeof vi.fn>;
    renderImages?: ReturnType<typeof vi.fn>;
  } = {},
) {
  server = createPreviewServer(inputFile, {
    clientScript: "globalThis.__POM_PREVIEW_CLIENT__ = true;",
    generatePreview,
    onDocumentEvent,
    ...exportOptions,
  });
  await new Promise<void>((resolve) => server?.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("No server address");
  baseUrl = `http://127.0.0.1:${address.port}`;
  return generatePreview;
}

describe("preview document save", () => {
  it("同一directoryの一時fileをrenameしてatomicに更新する", async () => {
    const rename = vi.spyOn(fs.promises, "rename");
    await atomicWriteFile(inputFile, "<Text>atomic</Text>");

    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>atomic</Text>",
    );
    expect(rename).toHaveBeenCalledTimes(1);
    const [temporaryPath, targetPath] = rename.mock.calls[0] ?? [];
    expect(path.dirname(String(temporaryPath))).toBe(tempDir);
    expect(targetPath).toBe(inputFile);
  });

  it("外部変更後のSaveを拒否し、対象fileを上書きしない", async () => {
    const revision = readPreviewDocument(inputFile).revision;
    await fs.promises.writeFile(inputFile, "<Text>external</Text>");

    await expect(
      savePreviewDocument(inputFile, "<Text>browser</Text>", revision),
    ).rejects.toThrow("changed outside pom preview");
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>external</Text>",
    );
  });

  it("一時file作成中の外部変更もrename前の再検査で拒否する", async () => {
    const revision = readPreviewDocument(inputFile).revision;
    const originalReadFile = fs.promises.readFile.bind(fs.promises);
    let targetReads = 0;
    vi.spyOn(fs.promises, "readFile").mockImplementation(async (...args) => {
      if (String(args[0]) === inputFile && ++targetReads === 2) {
        await fs.promises.writeFile(inputFile, "<Text>external late</Text>");
      }
      return originalReadFile(...args);
    });

    await expect(
      savePreviewDocument(inputFile, "<Text>browser</Text>", revision),
    ).rejects.toThrow("changed outside pom preview");
    expect(await originalReadFile(inputFile, "utf8")).toBe(
      "<Text>external late</Text>",
    );
  });
});

describe("preview server", () => {
  it("PomEditor client assetをlocal endpointから配信する", async () => {
    await startServer();
    const html = await fetch(baseUrl).then((response) => response.text());
    const asset = await fetch(`${baseUrl}/_assets/preview.js`).then(
      (response) => response.text(),
    );

    expect(html).toContain('<script src="/_assets/preview.js"');
    expect(html).not.toMatch(/https?:\/\/.*(?:jsdelivr|unpkg|cdnjs)/);
    expect(asset).toContain("__POM_PREVIEW_CLIENT__");
  });

  it("localhost以外のHostとcross-origin requestを拒否する", async () => {
    await startServer();
    const invalidHostStatus = await new Promise<number | undefined>(
      (resolve, reject) => {
        const request = http.get(
          `${baseUrl}/_api/document`,
          { headers: { Host: "example.com" } },
          (response) => {
            response.resume();
            response.on("end", () => resolve(response.statusCode));
          },
        );
        request.on("error", reject);
      },
    );
    const invalidOrigin = await fetch(`${baseUrl}/_api/document`, {
      headers: { Origin: "https://example.com" },
    });

    expect(invalidHostStatus).toBe(403);
    expect(invalidOrigin.status).toBe(403);
  });

  it("編集中の未保存XMLをpreview APIへ渡す", async () => {
    const generatePreview = await startServer();
    const xml = "<Text>unsaved</Text>";
    const response = await fetch(`${baseUrl}/_api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml }),
    });

    expect(response.status).toBe(200);
    expect(generatePreview).toHaveBeenCalledWith(xml);
  });

  it("編集中の未保存XMLからPPTXを生成して返す", async () => {
    const generatePptx = vi.fn().mockResolvedValue(new Uint8Array([80, 75]));
    await startServer(undefined, undefined, { generatePptx });
    const xml = "<Text>unsaved PPTX</Text>";
    const response = await fetch(`${baseUrl}/_api/export/pptx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(
      "presentationml.presentation",
    );
    expect(generatePptx).toHaveBeenCalledWith(xml);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(
      new Uint8Array([80, 75]),
    );
  });

  it("PNG / SVGと現在 / 全スライド指定を画像render APIへ渡す", async () => {
    const renderImages = vi
      .fn()
      .mockResolvedValueOnce([
        { slideNumber: 2, data: new Uint8Array([1, 2, 3]) },
      ])
      .mockResolvedValueOnce([
        { slideNumber: 1, data: "<svg>one</svg>" },
        { slideNumber: 2, data: "<svg>two</svg>" },
      ]);
    await startServer(undefined, undefined, { renderImages });
    const xml = "<Text>unsaved images</Text>";

    const currentResponse = await fetch(`${baseUrl}/_api/export/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml, format: "png", slides: [2] }),
    });
    const allResponse = await fetch(`${baseUrl}/_api/export/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml, format: "svg" }),
    });

    expect(renderImages).toHaveBeenNthCalledWith(1, xml, {
      format: "png",
      slides: [2],
    });
    expect(renderImages).toHaveBeenNthCalledWith(2, xml, { format: "svg" });
    expect(currentResponse.headers.get("content-type")).toBe("image/png");
    expect(
      decodeURIComponent(currentResponse.headers.get("x-pom-filename") ?? ""),
    ).toBe("slides-slide-02.png");
    expect(new Uint8Array(await currentResponse.arrayBuffer())).toEqual(
      new Uint8Array([1, 2, 3]),
    );

    expect(allResponse.headers.get("content-type")).toBe("application/zip");
    expect(
      decodeURIComponent(allResponse.headers.get("x-pom-filename") ?? ""),
    ).toBe("slides-svg-images.zip");
    const zip = await JSZip.loadAsync(await allResponse.arrayBuffer());
    expect(Object.keys(zip.files).sort()).toEqual([
      "slides-slide-01.svg",
      "slides-slide-02.svg",
    ]);
    await expect(
      zip.file("slides-slide-02.svg")?.async("string"),
    ).resolves.toBe("<svg>two</svg>");
  });

  it("PPTX / 画像生成失敗時はdiagnosticsを422で返す", async () => {
    const failure = new DiagnosticsError([
      { code: "NODE_OVERLAP", message: "overlap" },
    ]);
    const generatePptx = vi.fn().mockRejectedValue(failure);
    const renderImages = vi.fn().mockRejectedValue(failure);
    await startServer(undefined, undefined, {
      generatePptx,
      renderImages,
    });
    const request = (pathname: string, body: object) =>
      fetch(`${baseUrl}${pathname}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

    const pptxResponse = await request("/_api/export/pptx", {
      xml: "<Text />",
    });
    const imageResponse = await request("/_api/export/images", {
      xml: "<Text />",
      format: "png",
    });

    expect(pptxResponse.status).toBe(422);
    expect(imageResponse.status).toBe(422);
    await expect(pptxResponse.json()).resolves.toMatchObject({
      errors: [{ type: "NODE_OVERLAP", message: "overlap" }],
    });
    await expect(imageResponse.json()).resolves.toMatchObject({
      errors: [{ type: "NODE_OVERLAP", message: "overlap" }],
    });
  });

  it(".pom.md入力でも変換済みXMLからPPTX / 画像を出力できる", async () => {
    inputFile = path.join(tempDir, "markdown.pom.md");
    await fs.promises.writeFile(inputFile, "# Markdown slide");
    const generatePptx = vi.fn().mockResolvedValue(new Uint8Array([80, 75]));
    const renderImages = vi
      .fn()
      .mockResolvedValue([{ slideNumber: 1, data: "<svg />" }]);
    await startServer(undefined, undefined, {
      generatePptx,
      renderImages,
    });
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) =>
        response.json() as Promise<{ xml: string; editable: boolean }>,
    );

    const pptxResponse = await fetch(`${baseUrl}/_api/export/pptx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml: document.xml }),
    });
    const imageResponse = await fetch(`${baseUrl}/_api/export/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml: document.xml, format: "svg" }),
    });

    expect(document.editable).toBe(false);
    expect(pptxResponse.status).toBe(200);
    expect(imageResponse.status).toBe(200);
    expect(generatePptx).toHaveBeenCalledWith(document.xml);
    expect(renderImages).toHaveBeenCalledWith(document.xml, { format: "svg" });
  });

  it("request body上限超過を413で返す", async () => {
    await startServer();
    const response = await fetch(`${baseUrl}/_api/preview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml: "x".repeat(10 * 1024 * 1024) }),
    });

    expect(response.status).toBe(413);
  });

  it("空のslides指定を400で拒否する", async () => {
    await startServer();
    const response = await fetch(`${baseUrl}/_api/export/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml: "<Text />", format: "png", slides: [] }),
    });

    expect(response.status).toBe(400);
  });

  it.each([
    ["xmlなし", { format: "png" }],
    ["未知のformat", { xml: "<Text />", format: "gif" }],
    ["0のslide", { xml: "<Text />", format: "png", slides: [0] }],
    ["負数のslide", { xml: "<Text />", format: "png", slides: [-1] }],
    ["小数のslide", { xml: "<Text />", format: "png", slides: [1.5] }],
    ["文字列のslide", { xml: "<Text />", format: "png", slides: ["1"] }],
  ])("不正な画像出力request (%s) を400で拒否する", async (_name, body) => {
    const renderImages = vi.fn();
    await startServer(undefined, undefined, { renderImages });
    const response = await fetch(`${baseUrl}/_api/export/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(response.status).toBe(400);
    expect(renderImages).not.toHaveBeenCalled();
  });

  it("Save後のwatch通知を抑止し、後続のexternal changeだけを配信する", async () => {
    const onDocumentEvent = vi.fn();
    const generatePreview = await startServer(undefined, onDocumentEvent);
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) => response.json() as Promise<{ revision: string }>,
    );
    const xml = "<Text>saved from browser</Text>";
    const response = await fetch(`${baseUrl}/_api/document`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xml, revision: document.revision }),
    });

    expect(response.status).toBe(200);
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(xml);
    watchState.callback?.();
    await fs.promises.writeFile(inputFile, "<Text>external after save</Text>");
    watchState.callback?.();
    expect(onDocumentEvent).toHaveBeenCalledTimes(2);
    expect(onDocumentEvent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ xml }),
    );
    expect(onDocumentEvent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ xml: "<Text>external after save</Text>" }),
    );
    expect(generatePreview).not.toHaveBeenCalled();
  });

  it("外部変更後のSave APIは409 conflictを返す", async () => {
    await startServer();
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) => response.json() as Promise<{ revision: string }>,
    );
    await fs.promises.writeFile(inputFile, "<Text>external</Text>");
    const response = await fetch(`${baseUrl}/_api/document`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        xml: "<Text>browser</Text>",
        revision: document.revision,
      }),
    });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ code: "conflict" });
    expect(await fs.promises.readFile(inputFile, "utf8")).toBe(
      "<Text>external</Text>",
    );
  });

  it("同じrevisionからの同時Saveは一方だけを受け付ける", async () => {
    await startServer();
    const document = await fetch(`${baseUrl}/_api/document`).then(
      (response) => response.json() as Promise<{ revision: string }>,
    );
    const save = (xml: string) =>
      fetch(`${baseUrl}/_api/document`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ xml, revision: document.revision }),
      });

    const responses = await Promise.all([
      save("<Text>first</Text>"),
      save("<Text>second</Text>"),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([
      200, 409,
    ]);
    expect(["<Text>first</Text>", "<Text>second</Text>"]).toContain(
      await fs.promises.readFile(inputFile, "utf8"),
    );
  });
});
