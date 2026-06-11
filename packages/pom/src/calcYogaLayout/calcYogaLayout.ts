import type { POMNode, AlignItems } from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { YogaNodeMap } from "./types.ts";
import { Node as YogaNode } from "yoga-layout";
import { loadYoga } from "yoga-layout/load";
import { prefetchImageSize } from "../shared/measureImage.ts";
import { freeYogaTree } from "../shared/freeYogaTree.ts";
import { getNodeDef } from "../registry/index.ts";

/**
 * POMNode ツリーを Yoga でレイアウト計算する
 * POMNode と YogaNode の対応を YogaNodeMap として返す
 *
 * @param root 入力 POMNode ツリーのルート
 * @param slideSize スライド全体のサイズ（px）
 * @param ctx BuildContext
 * @returns YogaNodeMap（POMNode → YogaNode のマッピング）
 */
export async function calcYogaLayout(
  root: POMNode,
  slideSize: { w: number; h: number },
  ctx: BuildContext,
): Promise<YogaNodeMap> {
  const Yoga = await getYoga();

  // 事前に全画像のサイズを取得（HTTPS対応のため）
  await prefetchAllImageSizes(root, ctx);

  const map: YogaNodeMap = new Map();

  try {
    const rootYoga = Yoga.Node.create();
    map.set(root, rootYoga);

    await buildPomWithYogaTree(root, rootYoga, ctx, map);

    // スライド全体サイズを指定
    rootYoga.setWidth(slideSize.w);
    rootYoga.setHeight(slideSize.h);

    rootYoga.calculateLayout(slideSize.w, slideSize.h, Yoga.DIRECTION_LTR);
  } catch (e) {
    // 途中で失敗した場合、作成済みの YogaNode を解放してから再 throw
    freeYogaTree(map);
    throw e;
  }

  return map;
}

/**
 * POMNode ツリー内のすべての画像のサイズを事前取得する
 */
async function prefetchAllImageSizes(
  node: POMNode,
  ctx: BuildContext,
): Promise<void> {
  const imageSources = collectImageSources(node);
  await Promise.all(
    imageSources.map((src) =>
      prefetchImageSize(
        src,
        ctx.imageSizeCache,
        ctx.imageDataCache,
        ctx.diagnostics,
      ),
    ),
  );
}

/**
 * POMNode ツリー内のすべての画像のsrcを収集する
 */
function collectImageSources(node: POMNode): string[] {
  const sources: string[] = [];

  function traverse(n: POMNode) {
    // backgroundImage の src を収集（全ノード共通）
    if (n.backgroundImage) {
      sources.push(n.backgroundImage.src);
    }

    const def = getNodeDef(n.type);

    // ノード固有の画像ソース収集
    if (def.collectImageSources) {
      sources.push(...def.collectImageSources(n));
    }

    // 子要素の再帰
    if (def.category === "multi-child" || def.category === "absolute-child") {
      const containerNode = n as Extract<
        POMNode,
        { type: "vstack" | "hstack" | "layer" }
      >;
      for (const child of containerNode.children) {
        traverse(child);
      }
    }
  }

  traverse(node);
  return sources;
}

/**
 * Yogaシングルトン
 */
let yogaP: Promise<Yoga> | null = null;
type Yoga = Awaited<ReturnType<typeof loadYoga>>;
async function getYoga(): Promise<Yoga> {
  if (yogaP === null) yogaP = loadYoga();
  return yogaP;
}

/**
 * ノードが交差軸方向（幅）で確定サイズを持つかを判定する
 * - 明示的な w がある場合は確定
 * - alignSelf で stretch 以外が指定されている場合は不確定
 * - 親の alignItems で stretch（デフォルト）以外が指定されている場合は不確定
 */
function nodeHasDefiniteWidth(node: POMNode, parentNode?: POMNode): boolean {
  // 明示的な幅がある
  if (node.w !== undefined) return true;

  // alignSelf で stretch 以外が明示されている場合は不確定
  if (
    node.alignSelf !== undefined &&
    node.alignSelf !== "stretch" &&
    node.alignSelf !== "auto"
  ) {
    return false;
  }

  // 親がいない場合（ルートノード）は確定
  if (!parentNode) return true;

  // 親の alignItems を取得（VStack/HStack のみ持つ）
  let parentAlignItems: AlignItems | undefined;
  if (parentNode.type === "vstack") {
    parentAlignItems = parentNode.alignItems;
  } else if (parentNode.type === "hstack") {
    parentAlignItems = parentNode.alignItems;
  }

  // VStack（column 方向）の子の場合、交差軸は水平方向
  // alignItems が stretch（デフォルト）なら子は親幅に伸長される
  if (parentNode.type === "vstack" || parentNode.type === "layer") {
    return parentAlignItems === undefined || parentAlignItems === "stretch";
  }

  // HStack の子の場合、幅は主軸方向で flex により決まるため確定とみなす
  if (parentNode.type === "hstack") {
    return true;
  }

  return true;
}

/**
 * POMNode ツリーを再帰的に走査し、YogaNode ツリーを構築する
 */
async function buildPomWithYogaTree(
  node: POMNode,
  parentYoga: YogaNode,
  ctx: BuildContext,
  map: YogaNodeMap,
  parentNode?: POMNode,
  grandparentNode?: POMNode,
) {
  const yoga = await getYoga();

  const yn = yoga.Node.create();
  map.set(node, yn); // 対応する YogaNode をマップに登録

  await applyStyleToYogaNode(node, yn, ctx);

  // HStack/VStack の子要素に flexShrink=1 をデフォルト設定（CSS Flexbox と同じ挙動）
  // 主軸方向で %サイズ + gap がある場合の overflow を防ぐ
  // アイコンは固定サイズのコンテンツなので shrink させない
  if (parentNode?.type === "hstack" || parentNode?.type === "vstack") {
    yn.setFlexShrink(node.type === "icon" ? 0 : 1);
  }

  // HStack の子要素で幅が指定されていない場合、grow の比率で余白を配分
  // (grow 未指定は 1 として扱い均等分割)
  // テーブルは setMeasureFunc でカラム幅合計を返すため除外
  // アイコンは固定サイズのコンテンツなので除外
  if (
    parentNode?.type === "hstack" &&
    node.w === undefined &&
    node.type !== "table" &&
    node.type !== "icon"
  ) {
    yn.setFlexGrow(node.grow ?? 1);
    // HStack が確定幅を持つ場合のみ flexBasis=0 で均等分割
    // HStack が auto-sized（親の alignItems が center/start/end 等）の場合、
    // flexBasis=0 だと子要素の自然な幅が失われてレイアウトが崩れるため、
    // flexBasis=auto（デフォルト）のまま維持する
    if (nodeHasDefiniteWidth(parentNode, grandparentNode)) {
      yn.setFlexBasis(0);
    }
  }

  parentYoga.insertChild(yn, parentYoga.getChildCount());

  const def = getNodeDef(node.type);

  switch (def.category) {
    case "multi-child":
    case "absolute-child": {
      const containerNode = node as Extract<
        POMNode,
        { type: "vstack" | "hstack" | "layer" }
      >;
      for (const child of containerNode.children) {
        await buildPomWithYogaTree(child, yn, ctx, map, node, parentNode);
      }
      break;
    }
    case "leaf":
      // 子要素なし
      break;
  }
}

/**
 * node のスタイルを YogaNode に適用する
 */
async function applyStyleToYogaNode(
  node: POMNode,
  yn: YogaNode,
  ctx: BuildContext,
) {
  const yoga = await getYoga();

  // デフォルト: 縦並び
  yn.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);

  // width
  if (node.w !== undefined) {
    if (typeof node.w === "number") {
      yn.setWidth(node.w);
    } else if (node.w === "max") {
      yn.setFlexGrow(1);
    } else if (node.w.endsWith("%")) {
      const percent = parseFloat(node.w);
      yn.setWidthPercent(percent);
    }
  }

  // height
  if (node.h !== undefined) {
    if (typeof node.h === "number") {
      yn.setHeight(node.h);
    } else if (node.h === "max") {
      yn.setFlexGrow(1);
    } else if (node.h.endsWith("%")) {
      const percent = parseFloat(node.h);
      yn.setHeightPercent(percent);
    }
  }

  // flex-grow（w="max" / h="max" の setFlexGrow(1) より優先）
  if (node.grow !== undefined) {
    yn.setFlexGrow(node.grow);
  }

  // min/max constraints
  if (node.minW !== undefined) {
    yn.setMinWidth(node.minW);
  }
  if (node.maxW !== undefined) {
    yn.setMaxWidth(node.maxW);
  }
  if (node.minH !== undefined) {
    yn.setMinHeight(node.minH);
  }
  if (node.maxH !== undefined) {
    yn.setMaxHeight(node.maxH);
  }

  // padding
  if (node.padding !== undefined) {
    if (typeof node.padding === "number") {
      yn.setPadding(yoga.EDGE_TOP, node.padding);
      yn.setPadding(yoga.EDGE_RIGHT, node.padding);
      yn.setPadding(yoga.EDGE_BOTTOM, node.padding);
      yn.setPadding(yoga.EDGE_LEFT, node.padding);
    } else {
      if (node.padding.top !== undefined) {
        yn.setPadding(yoga.EDGE_TOP, node.padding.top);
      }
      if (node.padding.right !== undefined) {
        yn.setPadding(yoga.EDGE_RIGHT, node.padding.right);
      }
      if (node.padding.bottom !== undefined) {
        yn.setPadding(yoga.EDGE_BOTTOM, node.padding.bottom);
      }
      if (node.padding.left !== undefined) {
        yn.setPadding(yoga.EDGE_LEFT, node.padding.left);
      }
    }
  }

  // margin
  if (node.margin !== undefined) {
    if (typeof node.margin === "number") {
      yn.setMargin(yoga.EDGE_TOP, node.margin);
      yn.setMargin(yoga.EDGE_RIGHT, node.margin);
      yn.setMargin(yoga.EDGE_BOTTOM, node.margin);
      yn.setMargin(yoga.EDGE_LEFT, node.margin);
    } else {
      if (node.margin.top !== undefined) {
        yn.setMargin(yoga.EDGE_TOP, node.margin.top);
      }
      if (node.margin.right !== undefined) {
        yn.setMargin(yoga.EDGE_RIGHT, node.margin.right);
      }
      if (node.margin.bottom !== undefined) {
        yn.setMargin(yoga.EDGE_BOTTOM, node.margin.bottom);
      }
      if (node.margin.left !== undefined) {
        yn.setMargin(yoga.EDGE_LEFT, node.margin.left);
      }
    }
  }

  // position
  if (node.position === "absolute") {
    yn.setPositionType(yoga.POSITION_TYPE_ABSOLUTE);
  }
  if (node.top !== undefined) {
    yn.setPosition(yoga.EDGE_TOP, node.top);
  }
  if (node.right !== undefined) {
    yn.setPosition(yoga.EDGE_RIGHT, node.right);
  }
  if (node.bottom !== undefined) {
    yn.setPosition(yoga.EDGE_BOTTOM, node.bottom);
  }
  if (node.left !== undefined) {
    yn.setPosition(yoga.EDGE_LEFT, node.left);
  }

  // alignSelf
  if (node.alignSelf !== undefined) {
    switch (node.alignSelf) {
      case "auto":
        yn.setAlignSelf(yoga.ALIGN_AUTO);
        break;
      case "start":
        yn.setAlignSelf(yoga.ALIGN_FLEX_START);
        break;
      case "center":
        yn.setAlignSelf(yoga.ALIGN_CENTER);
        break;
      case "end":
        yn.setAlignSelf(yoga.ALIGN_FLEX_END);
        break;
      case "stretch":
        yn.setAlignSelf(yoga.ALIGN_STRETCH);
        break;
    }
  }

  // ノード固有のスタイル適用（measureFunc 等）
  const def = getNodeDef(node.type);
  if (def.applyYogaStyle) {
    await def.applyYogaStyle(node, yn, yoga, ctx);
  }
}
