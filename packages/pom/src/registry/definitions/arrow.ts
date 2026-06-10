import type { POMNode } from "../../types.ts";
import type { NodeDefinition } from "../types.ts";
import { renderArrowNode } from "../../renderPptx/nodes/arrow.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const arrowNodeDef: NodeDefinition = {
  ...getNodeMetadata("arrow"),
  applyYogaStyle(_node, yn) {
    // arrow ノードは ID 参照で位置を決定するため、Yoga レイアウトではサイズ 0 として扱う
    yn.setWidth(0);
    yn.setHeight(0);
  },
  toPositioned(pom, absoluteX, absoluteY) {
    const n = pom as Extract<POMNode, { type: "arrow" }>;
    return {
      ...n,
      x: absoluteX,
      y: absoluteY,
      w: 0,
      h: 0,
    };
  },
  render(node, ctx) {
    renderArrowNode(node as Extract<typeof node, { type: "arrow" }>, ctx);
  },
};
