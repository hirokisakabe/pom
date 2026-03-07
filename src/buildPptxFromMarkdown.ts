import { buildPptx } from "./buildPptx.ts";
import type { TextMeasurementMode } from "./buildPptx.ts";
import { parseMarkdown } from "./parseMarkdown/parseMarkdown.ts";
import type { SlideMasterOptions } from "./types.ts";

export async function buildPptxFromMarkdown(
  md: string,
  slideSize: { w: number; h: number },
  options?: {
    master?: SlideMasterOptions;
    textMeasurement?: TextMeasurementMode;
  },
) {
  const xml = parseMarkdown(md);
  return buildPptx(xml, slideSize, options);
}
