import type { POMNode, PositionedNode } from "../types.ts";
import type { BuildContext } from "../buildContext.ts";
import type { LayoutResultMap } from "../calcYogaLayout/types.ts";
import { getNodeDef } from "../registry/index.ts";

/**
 * POMNode ツリーを絶対座標付きの PositionedNode ツリーに変換する
 * @param pom 入力 POMNode
 * @param ctx BuildContext
 * @param map LayoutResultMap（POMNode → 計算済みレイアウト結果のマッピング）
 * @param parentX 親ノードの絶対X座標
 * @param parentY 親ノードの絶対Y座標
 * @returns PositionedNode ツリー
 */
export async function toPositioned(
  pom: POMNode,
  ctx: BuildContext,
  map: LayoutResultMap,
  parentX = 0,
  parentY = 0,
): Promise<PositionedNode> {
  const layout = map.get(pom);
  if (!layout) {
    throw new Error("Layout result not found in map for POMNode");
  }
  const absoluteX = parentX + layout.left;
  const absoluteY = parentY + layout.top;

  const def = getNodeDef(pom.type);

  // ノード固有のカスタム変換がある場合はそれを使用
  if (def.toPositioned) {
    return def.toPositioned(pom, absoluteX, absoluteY, layout, ctx, map);
  }

  // category ベースのデフォルト処理
  switch (def.category) {
    case "leaf":
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      } as PositionedNode;

    case "multi-child": {
      const containerNode = pom as Extract<
        POMNode,
        { type: "vstack" | "hstack" }
      >;
      return {
        ...containerNode,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        children: await Promise.all(
          containerNode.children.map((child) =>
            toPositioned(child, ctx, map, absoluteX, absoluteY),
          ),
        ),
      };
    }

    case "absolute-child":
      // absolute-child (layer) は必ずカスタム toPositioned を持つべき
      throw new Error(
        `Node type "${pom.type}" with category "absolute-child" must have a custom toPositioned`,
      );
  }
}
