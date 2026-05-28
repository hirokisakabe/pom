import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { buildPptx } from "@hirokisakabe/pom";
import { parseMd } from "@hirokisakabe/pom-md";
import { convertPptxToSvg } from "pptx-glimpse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXTRA_FONT_MAPPING: Record<string, string> = {
  "游ゴシック Light": "Noto Sans CJK JP",
  "Yu Gothic Light": "Noto Sans CJK JP",
};

type SvgResult =
  | { type: "success"; svgs: string[]; slideWidth: number }
  | { type: "error"; message: string }
  | { type: "empty" };

interface WorkerInput {
  inputFile: string;
}

async function run(inputFile: string): Promise<SvgResult> {
  const content = fs.readFileSync(inputFile, "utf-8");
  const ext = path.extname(inputFile);

  let xml: string;
  let slideWidth = 1280;
  let slideHeight = 720;
  let masterPptxData: Uint8Array | undefined;

  if (ext === ".md") {
    const result = parseMd(content);
    xml = result.xml;
    slideWidth = result.meta.size.w;
    slideHeight = result.meta.size.h;

    if (result.meta.masterPptx) {
      const masterPath = path.resolve(
        path.dirname(inputFile),
        result.meta.masterPptx,
      );
      try {
        masterPptxData = new Uint8Array(fs.readFileSync(masterPath));
      } catch (e: unknown) {
        if (e instanceof Error && "code" in e && e.code === "ENOENT") {
          process.stderr.write(
            `Warning: masterPptx not found: ${masterPath}\n`,
          );
        } else {
          throw e;
        }
      }
    }
  } else {
    xml = content;
  }

  if (!xml.trim()) {
    return { type: "empty" };
  }

  const { pptx } = await buildPptx(
    xml,
    { w: slideWidth, h: slideHeight },
    {
      textMeasurement: "fallback",
      ...(masterPptxData ? { masterPptx: masterPptxData } : {}),
    },
  );

  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }

  // バンドルフォントディレクトリ（pom-vscode の fonts/ へのシンボリックリンク）
  const fontsDir = path.resolve(__dirname, "../fonts");
  const fontDirs = fs.existsSync(fontsDir) ? [fontsDir] : [];

  const slides = await convertPptxToSvg(buffer, {
    width: slideWidth,
    fontDirs,
    fontMapping: EXTRA_FONT_MAPPING,
  });
  const svgs = slides.map((s: { svg: string }) => s.svg);

  return { type: "success", svgs, slideWidth };
}

const chunks: Buffer[] = [];
process.stdin.on("data", (chunk: Buffer) => chunks.push(chunk));
process.stdin.on("end", () => {
  let input: WorkerInput;
  try {
    input = JSON.parse(Buffer.concat(chunks).toString()) as WorkerInput;
  } catch {
    const result: SvgResult = {
      type: "error",
      message: "Invalid worker input",
    };
    process.stdout.write(JSON.stringify(result));
    return;
  }
  run(input.inputFile)
    .then((result) => {
      process.stdout.write(JSON.stringify(result));
    })
    .catch((err: unknown) => {
      const result: SvgResult = {
        type: "error",
        message: err instanceof Error ? err.message : String(err),
      };
      process.stdout.write(JSON.stringify(result));
    });
});
