import { autoFitSlide } from "./autoFit/autoFit.ts";
import { createBuildContext } from "./buildContext.ts";
import { calcYogaLayout } from "./calcYogaLayout/calcYogaLayout.ts";
import type { TextMeasurementMode } from "./calcYogaLayout/measureText.ts";
import type { YogaNodeMap } from "./calcYogaLayout/types.ts";
import { extractLayoutResults } from "./calcYogaLayout/types.ts";
import type { Diagnostic } from "./diagnostics.ts";
import { DiagnosticsError } from "./diagnostics.ts";
import { parseMasterPptx } from "./parseMasterPptx.ts";
import { parseXml } from "./parseXml/parseXml.ts";
import { patchPptxWriteForGlimpseTextBoxes } from "./renderPptx/glimpseTextBoxes.ts";
import { renderPptx } from "./renderPptx/renderPptx.ts";
import { freeYogaTree } from "./shared/freeYogaTree.ts";
import { toPositioned } from "./toPositioned/toPositioned.ts";
import { PositionedNode, SlideMasterOptions } from "./types.ts";
import { validatePositioned } from "./validatePositioned/validatePositioned.ts";

export type { TextMeasurementMode };

export interface BuildPptxResult {
  pptx: import("pptxgenjs").default;
  diagnostics: Diagnostic[];
}

export async function buildPptx(
  xml: string,
  slideSize: { w: number; h: number },
  options?: {
    master?: SlideMasterOptions;
    masterPptx?: ArrayBuffer | Uint8Array;
    textMeasurement?: TextMeasurementMode;
    autoFit?: boolean;
    strict?: boolean;
  },
): Promise<BuildPptxResult> {
  const ctx = createBuildContext(options?.textMeasurement ?? "auto");

  const nodes = parseXml(xml);
  const positionedPages: PositionedNode[] = [];

  for (const [slideIndex, node] of nodes.entries()) {
    let map: YogaNodeMap | undefined;
    try {
      if (options?.autoFit !== false) {
        map = await autoFitSlide(node, slideSize, ctx);
      } else {
        map = await calcYogaLayout(node, slideSize, ctx);
      }
      const layoutMap = extractLayoutResults(map);
      const positioned = await toPositioned(node, ctx, layoutMap);
      validatePositioned(positioned, slideSize, ctx, slideIndex);
      positionedPages.push(positioned);
    } finally {
      if (map) freeYogaTree(map);
    }
  }

  // masterPptx から背景を抽出し、master オプションにマージ
  let master = options?.master;
  if (options?.masterPptx) {
    try {
      const bg = await parseMasterPptx(options.masterPptx);
      if (bg) {
        if (master) {
          // 明示的に background が指定されていない場合のみ、masterPptx の背景を使用
          if (!master.background) {
            master = { ...master, background: bg };
          }
        } else {
          master = { background: bg };
        }
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Unknown error parsing masterPptx";
      ctx.diagnostics.add("MASTER_PPTX_PARSE_FAILED", message);
    }
  }

  const pptx = await renderPptx(positionedPages, slideSize, ctx, master);

  // glimpse writer で生成した Text / Shape / Picture XML で marker shape を置換する
  patchPptxWriteForGlimpseTextBoxes(pptx, ctx.glimpseTextBoxes);

  const diagnostics = ctx.diagnostics.items;

  if (options?.strict && diagnostics.length > 0) {
    throw new DiagnosticsError(diagnostics);
  }

  return { pptx, diagnostics };
}
