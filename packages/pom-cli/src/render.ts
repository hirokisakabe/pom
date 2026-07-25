import fs from "fs";
import path from "path";
import { buildPptx } from "@hirokisakabe/pom";
import { convertPptxToPng, convertPptxToSvg } from "pptx-glimpse";
import { EXTRA_FONT_MAPPING, resolveBundledFontsDir } from "./glimpse.ts";
import { loadInput } from "./input.ts";

export type RenderFormat = "png" | "svg";
export type TextOutput = "path" | "text";

export interface RenderContext {
  slideWidth: number;
  slideHeight: number;
  masterPptxData?: Uint8Array;
}

export interface RenderedSlide {
  slideNumber: number;
  data: string | Uint8Array;
}

function makeLog(verbose: boolean) {
  if (!verbose) return (_msg: string) => {};
  return (msg: string) => process.stderr.write(`[pom] ${msg}\n`);
}

export async function renderPresentation(
  xml: string,
  context: RenderContext,
  options: {
    format: RenderFormat;
    slides?: number[];
    textOutput?: TextOutput;
    verbose?: boolean;
  },
): Promise<RenderedSlide[]> {
  const log = makeLog(options.verbose ?? false);
  const t1 = Date.now();
  const { pptx } = await buildPptx(
    xml,
    { w: context.slideWidth, h: context.slideHeight },
    {
      textMeasurement: "fallback",
      ...(context.masterPptxData ? { masterPptx: context.masterPptxData } : {}),
      strict: true,
    },
  );
  log(`Building PPTX... done (${Date.now() - t1}ms)`);

  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }

  const convertOptions = {
    width: context.slideWidth,
    fontDirs: [resolveBundledFontsDir()],
    fontMapping: EXTRA_FONT_MAPPING,
    skipSystemFonts: true,
    ...(options.slides ? { slides: options.slides } : {}),
  };

  const t2 = Date.now();
  let outputs: RenderedSlide[];
  if (options.format === "svg") {
    const { slides } = await convertPptxToSvg(buffer, {
      ...convertOptions,
      ...(options.textOutput ? { textOutput: options.textOutput } : {}),
    });
    outputs = slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      data: slide.svg,
    }));
  } else {
    const { slides } = await convertPptxToPng(buffer, convertOptions);
    outputs = slides.map((slide) => ({
      slideNumber: slide.slideNumber,
      data: slide.png,
    }));
  }
  log(
    `Rendering ${options.format.toUpperCase()}... done (${Date.now() - t2}ms)`,
  );

  if (outputs.length === 0) {
    throw new Error("No slides were rendered");
  }
  return outputs;
}

export async function runRender(
  inputFile: string,
  outputDir: string,
  options: {
    format?: RenderFormat;
    slides?: number[];
    textOutput?: TextOutput;
    verbose?: boolean;
  } = {},
): Promise<void> {
  const verbose = options.verbose ?? false;
  const format = options.format ?? "png";
  const log = makeLog(verbose);
  const totalStart = Date.now();

  const absInput = path.resolve(inputFile);
  const absOutputDir = path.resolve(outputDir);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  log(`Reading file: ${absInput}`);
  const { xml, slideWidth, slideHeight, masterPptxData } = loadInput(
    absInput,
    log,
  );

  const outputs = await renderPresentation(
    xml,
    {
      slideWidth,
      slideHeight,
      ...(masterPptxData ? { masterPptxData } : {}),
    },
    {
      format,
      ...(options.slides ? { slides: options.slides } : {}),
      ...(options.textOutput ? { textOutput: options.textOutput } : {}),
      verbose,
    },
  );

  if (options.slides) {
    const rendered = new Set(outputs.map((o) => o.slideNumber));
    const missing = options.slides.filter((n) => !rendered.has(n));
    if (missing.length > 0) {
      console.warn(
        `Warning: slide ${missing.join(", ")} not found in the presentation`,
      );
    }
  }

  fs.mkdirSync(absOutputDir, { recursive: true });
  const padWidth = Math.max(
    2,
    ...outputs.map((o) => String(o.slideNumber).length),
  );
  for (const { slideNumber, data } of outputs) {
    const file = path.join(
      absOutputDir,
      `slide-${String(slideNumber).padStart(padWidth, "0")}.${format}`,
    );
    fs.writeFileSync(file, data);
    console.log(`Saved: ${file}`);
  }

  log(`Total: ${Date.now() - totalStart}ms`);
}
