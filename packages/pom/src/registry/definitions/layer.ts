import { type POMNode, type PositionedLayerChild } from "../../types.ts";
import type { NodeDefinition } from "../types.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const layerNodeDef: NodeDefinition = {
  ...getNodeMetadata("layer"),
  // applyYogaStyle: layer は子を絶対配置するコンテナ。サイズは明示的に指定されることを期待
  async toPositioned(pom, absoluteX, absoluteY, layout, ctx, map, recurse) {
    const n = pom as Extract<POMNode, { type: "layer" }>;
    // layer の子要素は layer 内の相対座標（child.x, child.y）を持つ
    // layer の絶対座標に加算してスライド上の絶対座標に変換
    return {
      ...n,
      x: absoluteX,
      y: absoluteY,
      w: layout.width,
      h: layout.height,
      children: await Promise.all(
        n.children.map(async (child): Promise<PositionedLayerChild> => {
          const childX = child.x ?? 0;
          const childY = child.y ?? 0;

          // line ノードは特別な処理が必要
          // x1, y1, x2, y2 は layer 内の相対座標として扱い、layer の座標を加算
          if (child.type === "line") {
            const lineAbsoluteX = absoluteX + childX;
            const lineAbsoluteY = absoluteY + childY;
            const adjustedX1 = child.x1 + lineAbsoluteX;
            const adjustedY1 = child.y1 + lineAbsoluteY;
            const adjustedX2 = child.x2 + lineAbsoluteX;
            const adjustedY2 = child.y2 + lineAbsoluteY;

            return {
              ...child,
              x1: adjustedX1,
              y1: adjustedY1,
              x2: adjustedX2,
              y2: adjustedY2,
              x: Math.min(adjustedX1, adjustedX2),
              y: Math.min(adjustedY1, adjustedY2),
              w: Math.abs(adjustedX2 - adjustedX1),
              h: Math.abs(adjustedY2 - adjustedY1),
            };
          }

          // arrow ノードは ID 参照で位置を決定するため、座標は 0 で置く
          if (child.type === "arrow") {
            return {
              ...child,
              x: absoluteX,
              y: absoluteY,
              w: 0,
              h: 0,
            };
          }

          // その他のノードは通常の処理
          const childLayout = map.get(child);
          if (!childLayout) {
            throw new Error("Layout result not found in map for layer child");
          }
          const adjustedParentX = absoluteX + childX - childLayout.left;
          const adjustedParentY = absoluteY + childY - childLayout.top;

          return await recurse(
            child,
            ctx,
            map,
            adjustedParentX,
            adjustedParentY,
          );
        }),
      ),
    };
  },
  // render: category ベースの子要素再帰で対応
};
