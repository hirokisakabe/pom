import { autoFitSlide } from "./autoFit/autoFit.ts";
import { createBuildContext } from "./buildContext.ts";
import { calcYogaLayout } from "./calcYogaLayout/calcYogaLayout.ts";
import type { TextMeasurementMode } from "./calcYogaLayout/measureText.ts";
import type { FontInput } from "./calcYogaLayout/fontLoader.ts";
import type { YogaNodeMap } from "./calcYogaLayout/types.ts";
import { extractLayoutResults } from "./calcYogaLayout/types.ts";
import type { Diagnostic } from "./diagnostics.ts";
import { DiagnosticsError } from "./diagnostics.ts";
import { parseMasterPptx } from "./parseMasterPptx.ts";
import { parseXml } from "./parseXml/parseXml.ts";
import { renderPptx } from "./renderPptx/renderPptx.ts";
import type { WritablePptx } from "./renderPptx/writablePptx.ts";
import { freeYogaTree } from "./shared/freeYogaTree.ts";
import { prefetchImageSize } from "./shared/measureImage.ts";
import { toPositioned } from "./toPositioned/toPositioned.ts";
import { PositionedNode, SlideMasterOptions } from "./types.ts";
import { validatePositioned } from "./validatePositioned/validatePositioned.ts";

export type { FontInput, TextMeasurementMode };

export interface BuildPptxResult {
  pptx: WritablePptx;
  diagnostics: Diagnostic[];
}

export async function buildPptx(
  xml: string,
  slideSize: { w: number; h: number },
  options?: {
    master?: SlideMasterOptions;
    masterPptx?: ArrayBuffer | Uint8Array;
    textMeasurement?: TextMeasurementMode;
    fonts?: FontInput[];
    autoFit?: boolean;
    strict?: boolean;
  },
): Promise<BuildPptxResult> {
  const ctx = createBuildContext(
    options?.textMeasurement ?? "auto",
    options?.fonts,
  );

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

  const masterImageSources = [
    ...new Set(
      [
        master?.background && "image" in master.background
          ? master.background.image
          : undefined,
        ...(master?.objects
          ?.filter((object) => object.type === "image")
          .map((object) => object.src) ?? []),
      ].filter((source): source is string =>
        Boolean(
          source?.startsWith("https://") || source?.startsWith("http://"),
        ),
      ),
    ),
  ];
  await Promise.all(
    masterImageSources.map((source) =>
      prefetchImageSize(
        source,
        ctx.imageSizeCache,
        ctx.imageDataCache,
        ctx.diagnostics,
      ),
    ),
  );

  const pptx = renderPptx(positionedPages, slideSize, ctx, master);

  const diagnostics = ctx.diagnostics.items;

  if (options?.strict && diagnostics.length > 0) {
    throw new DiagnosticsError(diagnostics);
  }

  return { pptx, diagnostics };
}
