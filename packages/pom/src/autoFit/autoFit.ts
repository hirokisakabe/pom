import type { POMNode, PositionedNode } from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { YogaNodeMap } from "../calcYogaLayout/types.ts";
import { extractLayoutResults } from "../calcYogaLayout/types.ts";
import { calcYogaLayout } from "../calcYogaLayout/calcYogaLayout.ts";
import { freeYogaTree } from "../shared/freeYogaTree.ts";
import { toPositioned } from "../toPositioned/toPositioned.ts";
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
  const { contentHeight, furthestNode } = await calcContentHeight(
    map,
    node,
    ctx,
  );
  const isOverflowing = contentHeight > slideSize.h * OVERFLOW_TOLERANCE;
  const targetRatio = isOverflowing ? slideSize.h / contentHeight : 1;
  return { contentHeight, isOverflowing, targetRatio, map, furthestNode };
}

/**
 * positioned tree からコンテンツの占有高さを算出する。
 *
 * 描画時と同じ座標へ変換した葉ノードの (y + h) の最大値を計算し、
 * ルートの padding.bottom を加算する。これにより Layer がネストしていても
 * absolute child の y や Line の y1/y2 を含む実際の描画境界を使用できる。
 * h="max" や flexGrow の影響を受けず、正確なコンテンツ高さを返す。
 */
async function calcContentHeight(
  map: YogaNodeMap,
  node: POMNode,
  ctx: BuildContext,
): Promise<ContentHeightResult> {
  const rootYoga = map.get(node);
  if (!rootYoga) {
    throw new Error("YogaNode not found in map for root node");
  }

  const positioned = await toPositioned(node, ctx, extractLayoutResults(map));
  const furthestNode = findFurthestLeaf(positioned);
  if (!furthestNode) {
    return { contentHeight: rootYoga.getComputedHeight() };
  }

  const paddingBottom = rootYoga.getComputedPadding(2); // EDGE_BOTTOM = 2
  return {
    contentHeight: furthestNode.bottom + paddingBottom,
    furthestNode,
  };
}

function findFurthestLeaf(
  node: PositionedNode,
): ContentHeightResult["furthestNode"] {
  if ("children" in node) {
    const children = node.children as PositionedNode[];
    let furthest: ContentHeightResult["furthestNode"];
    for (const child of children) {
      const candidate = findFurthestLeaf(child);
      if (candidate && (!furthest || candidate.bottom > furthest.bottom)) {
        furthest = candidate;
      }
    }
    return furthest;
  }

  return {
    type: node.type,
    top: node.y,
    height: node.h,
    bottom: node.y + node.h,
  };
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
