import fs from "fs";
import path from "path";
import { parseMd } from "@hirokisakabe/pom-md";

export interface LoadedInput {
  xml: string;
  slideWidth: number;
  slideHeight: number;
  masterPptxData?: Uint8Array;
}

export function loadInput(
  absInput: string,
  log: (msg: string) => void = () => {},
): LoadedInput {
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

  return { xml, slideWidth, slideHeight, masterPptxData };
}
