import fs from "fs";
import path from "path";
import { buildPptx, DiagnosticsError } from "@hirokisakabe/pom";
import { parseMd } from "@hirokisakabe/pom-md";

function makeLog(verbose: boolean) {
  if (!verbose) return (_msg: string) => {};
  return (msg: string) => process.stderr.write(`[pom] ${msg}\n`);
}

export async function runBuild(
  inputFile: string,
  outputFile: string,
  options: { verbose?: boolean; silent?: boolean } = {},
): Promise<void> {
  const verbose = options.verbose ?? false;
  const log = makeLog(verbose);
  const totalStart = Date.now();

  const absInput = path.resolve(inputFile);
  const absOutput = path.resolve(outputFile);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  log(`Reading file: ${absInput}`);
  const content = fs.readFileSync(absInput, "utf-8");
  const ext = path.extname(absInput);

  let xml: string;
  let slideWidth = 1280;
  let slideHeight = 720;
  let masterPptxData: Uint8Array | undefined;

  if (ext === ".md") {
    const t = Date.now();
    const result = parseMd(content);
    xml = result.xml;
    slideWidth = result.meta.size.w;
    slideHeight = result.meta.size.h;
    log(`Parsing Markdown... done (${Date.now() - t}ms)`);

    if (result.meta.masterPptx) {
      const masterPath = path.resolve(
        path.dirname(absInput),
        result.meta.masterPptx,
      );
      try {
        masterPptxData = new Uint8Array(fs.readFileSync(masterPath));
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "ENOENT") {
          console.warn(`Warning: masterPptx not found: ${masterPath}`);
        } else {
          throw e;
        }
      }
    }
  } else {
    xml = content;
  }

  const t1 = Date.now();
  const { pptx } = await buildPptx(
    xml,
    { w: slideWidth, h: slideHeight },
    {
      ...(masterPptxData ? { masterPptx: masterPptxData } : {}),
      strict: true,
    },
  );
  log(`Building PPTX... done (${Date.now() - t1}ms)`);

  const t2 = Date.now();
  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }
  fs.writeFileSync(absOutput, buffer);
  log(`Writing output... done (${Date.now() - t2}ms)`);

  const total = Date.now() - totalStart;
  log(`Total: ${total}ms`);
  if (!options.silent) {
    console.log(`PPTX saved: ${absOutput}`);
  }
}

export async function runBuildWatch(
  inputFile: string,
  outputFile: string,
  options: { verbose?: boolean } = {},
): Promise<void> {
  const absInput = path.resolve(inputFile);
  const absOutput = path.resolve(outputFile);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  const watchLog = (msg: string) => process.stderr.write(`[pom] ${msg}\n`);

  watchLog(`Watching: ${path.basename(absInput)}`);

  async function doBuild(): Promise<void> {
    const start = Date.now();
    try {
      await runBuild(inputFile, outputFile, { ...options, silent: true });
      watchLog(`Built: ${path.basename(absOutput)} (${Date.now() - start}ms)`);
    } catch (err: unknown) {
      if (err instanceof DiagnosticsError) {
        const count = err.diagnostics.length;
        process.stderr.write(
          `[pom] Build failed (${count} ${count === 1 ? "error" : "errors"})\n`,
        );
        for (const d of err.diagnostics) {
          process.stderr.write(`[pom]   [${d.code}] ${d.message}\n`);
        }
      } else {
        process.stderr.write(
          `[pom] Error: ${err instanceof Error ? err.message : String(err)}\n`,
        );
      }
    }
  }

  await doBuild();

  let debounceTimer: NodeJS.Timeout | null = null;
  fs.watch(absInput, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      watchLog("File changed, rebuilding...");
      void doBuild();
    }, 100);
  });
}
