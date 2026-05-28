import fs from "fs";
import path from "path";
import { buildPptx } from "@hirokisakabe/pom";
import { parseMd } from "@hirokisakabe/pom-md";

export async function runBuild(
  inputFile: string,
  outputFile: string,
): Promise<void> {
  const absInput = path.resolve(inputFile);
  const absOutput = path.resolve(outputFile);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  const content = fs.readFileSync(absInput, "utf-8");
  const ext = path.extname(absInput);

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
        path.dirname(absInput),
        result.meta.masterPptx,
      );
      try {
        masterPptxData = new Uint8Array(fs.readFileSync(masterPath));
      } catch {
        // masterPptx が見つからない場合は続行
      }
    }
  } else {
    xml = content;
  }

  const { pptx } = await buildPptx(
    xml,
    { w: slideWidth, h: slideHeight },
    masterPptxData ? { masterPptx: masterPptxData } : undefined,
  );

  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }

  fs.writeFileSync(absOutput, buffer);
  console.log(`PPTX saved: ${absOutput}`);
}
