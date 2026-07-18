import type { POMNode } from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { YogaNodeMap } from "../calcYogaLayout/types.ts";
import { calcYogaLayout } from "../calcYogaLayout/calcYogaLayout.ts";
import { freeYogaTree } from "../shared/freeYogaTree.ts";
import { reduceTableRowHeight } from "./strategies/reduceTableRowHeight.ts";
import { reduceFontSize } from "./strategies/reduceFontSize.ts";
import { reduceGapAndPadding } from "./strategies/reduceGapAndPadding.ts";
import { uniformScale } from "./strategies/uniformScale.ts";
import type { AutoFitStrategyResult } from "./strategyResult.ts";

/** オーバーフロー判定の許容マージン（0.5%） */
const OVERFLOW_TOLERANCE = 1.005;

type Strategy = (node: POMNode, targetRatio: number) => AutoFitStrategyResult;

const strategies: Strategy[] = [
  reduceTableRowHeight,
  reduceFontSize,
  reduceGapAndPadding,
  uniformScale,
];

/** オーバーフロー測定結果 */
interface OverflowResult {
  contentHeight: number;
  isOverflowing: boolean;
  /** スライド高さ / コンテンツ高さ（オーバーフロー時 < 1） */
  targetRatio: number;
  map: YogaNodeMap;
  furthestNode?: ContentHeightResult["furthestNode"];
}

interface ContentHeightResult {
  contentHeight: number;
  furthestNode?: {
    type: POMNode["type"];
    top: number;
    height: number;
    bottom: number;
  };
}

/**
 * レイアウト計算を実行し、コンテンツのオーバーフロー状態を測定する。
 */
async function measureOverflow(
  node: POMNode,
  slideSize: { w: number; h: number },
  ctx: BuildContext,
): Promise<OverflowResult> {
  const map = await calcYogaLayout(node, slideSize, ctx);
  const { contentHeight, furthestNode } = calcContentHeight(map, node);
  const isOverflowing = contentHeight > slideSize.h * OVERFLOW_TOLERANCE;
  const targetRatio = isOverflowing ? slideSize.h / contentHeight : 1;
  return { contentHeight, isOverflowing, targetRatio, map, furthestNode };
}

/**
 * Yoga レイアウトと Layer の絶対座標からコンテンツの占有高さを算出する。
 *
 * 描画時と同じ規則で各ノードの (y + h) を再帰的に計算し、ルートの
 * padding.bottom を加算する。Layer では absolute child の y、Line では
 * y1/y2 を使うため、Yoga の通常フローによる過大計測を避けられる。
 * h="max" や flexGrow の影響を受けず、正確なコンテンツ高さを返す。
 */
function calcContentHeight(
  map: YogaNodeMap,
  node: POMNode,
): ContentHeightResult {
  const rootYoga = map.get(node);
  if (!rootYoga) {
    throw new Error("YogaNode not found in map for root node");
  }

  const rootLayout = rootYoga.getComputedLayout();
  const furthestNode = findFurthestChild(map, node, rootLayout.top);
  if (!furthestNode) {
    return { contentHeight: rootYoga.getComputedHeight() };
  }

  const paddingBottom = rootYoga.getComputedPadding(2); // EDGE_BOTTOM = 2
  return {
    contentHeight: furthestNode.bottom + paddingBottom,
    furthestNode,
  };
}

function findFurthestChild(
  map: YogaNodeMap,
  parent: POMNode,
  parentY: number,
): ContentHeightResult["furthestNode"] {
  if (!("children" in parent) || !Array.isArray(parent.children)) {
    return undefined;
  }

  let furthest: ContentHeightResult["furthestNode"];
  for (const child of parent.children as POMNode[]) {
    const candidate = measureNodeBounds(map, child, parent, parentY);
    if (candidate && (!furthest || candidate.bottom > furthest.bottom)) {
      furthest = candidate;
    }
  }
  return furthest;
}

function measureNodeBounds(
  map: YogaNodeMap,
  node: POMNode,
  parent: POMNode,
  parentY: number,
): ContentHeightResult["furthestNode"] {
  if (parent.type === "layer" && node.type === "line") {
    const layerOffsetY = parentY + getLayerChildY(node);
    const top = layerOffsetY + Math.min(node.y1, node.y2);
    const height = Math.abs(node.y2 - node.y1);
    return { type: node.type, top, height, bottom: top + height };
  }

  const yogaNode = map.get(node);
  if (!yogaNode) {
    throw new Error(`YogaNode not found in map for ${node.type} node`);
  }
  const layout = yogaNode.getComputedLayout();
  const top =
    parent.type === "layer"
      ? parentY + getLayerChildY(node)
      : parentY + layout.top;

  let furthest: ContentHeightResult["furthestNode"];
  // Layer の Yoga height は absolute children の通常フロー合計なので、
  // 明示サイズがある場合だけコンテナ自身の描画境界として採用する。
  if (node.type !== "layer" || node.h !== undefined) {
    furthest = {
      type: node.type,
      top,
      height: layout.height,
      bottom: top + layout.height,
    };
  }

  const descendant = findFurthestChild(map, node, top);
  if (descendant && (!furthest || descendant.bottom > furthest.bottom)) {
    furthest = descendant;
  }
  return furthest;
}

function getLayerChildY(node: POMNode): number {
  return (node as POMNode & { y?: number }).y ?? 0;
}

/**
 * スライドのオーバーフローを検出し、段階的に調整してスライド内に収める。
 *
 * 調整の優先順:
 * 1. テーブル行高さ縮小
 * 2. フォントサイズ縮小
 * 3. gap/padding 縮小
 * 4. 全体スケーリング（フォールバック）
 */
export async function autoFitSlide(
  node: POMNode,
  slideSize: { w: number; h: number },
  ctx: BuildContext,
): Promise<YogaNodeMap> {
  // Phase 1: 戦略を順次適用してオーバーフローを解消
  for (const strategy of strategies) {
    const result = await measureOverflow(node, slideSize, ctx);
    freeYogaTree(result.map);

    if (!result.isOverflowing) {
      break;
    }

    const strategyResult = strategy(node, result.targetRatio);
    if (!strategyResult.changed) {
      continue;
    }
  }

  // Phase 2: 最終レイアウト計算とオーバーフロー検証
  return finalizeLayout(node, slideSize, ctx);
}

/**
 * 最終レイアウトを計算し、オーバーフローが残っていれば警告を出力する。
 */
async function finalizeLayout(
  node: POMNode,
  slideSize: { w: number; h: number },
  ctx: BuildContext,
): Promise<YogaNodeMap> {
  const result = await measureOverflow(node, slideSize, ctx);
  if (result.isOverflowing) {
    const detail = result.furthestNode
      ? ` Furthest node: ${result.furthestNode.type} at y=${Math.round(result.furthestNode.top)}px with height=${Math.round(result.furthestNode.height)}px (bottom=${Math.round(result.furthestNode.bottom)}px).`
      : "";
    ctx.diagnostics.add(
      "AUTOFIT_OVERFLOW",
      `autoFit: content height (${Math.round(result.contentHeight)}px) exceeds slide height (${slideSize.h}px) after all adjustments.${detail}`,
    );
  }
  freeYogaTree(result.map);

  return calcYogaLayout(node, slideSize, ctx);
}
