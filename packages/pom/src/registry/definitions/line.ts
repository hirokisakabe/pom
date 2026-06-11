import type { POMNode } from "../../types.ts";
import type { NodeDefinition } from "../types.ts";
import { renderLineNode } from "../../renderPptx/nodes/line.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const lineNodeDef: NodeDefinition = {
  ...getNodeMetadata("line"),
  applyYogaStyle(_node, yn) {
    // line ノードは絶対座標を使用するため、Yoga レイアウトではサイズ 0 として扱う
    yn.setWidth(0);
    yn.setHeight(0);
  },
  toPositioned(pom, _absoluteX, _absoluteY, _layout) {
    const n = pom as Extract<POMNode, { type: "line" }>;
    // line ノードは絶対座標（x1, y1, x2, y2）を持つため、
    // yogaNode の座標ではなく自身の座標からバウンディングボックスを計算
    return {
      ...n,
      x: Math.min(n.x1, n.x2),
      y: Math.min(n.y1, n.y2),
      w: Math.abs(n.x2 - n.x1),
      h: Math.abs(n.y2 - n.y1),
    };
  },
  render(node, ctx) {
    renderLineNode(node as Extract<typeof node, { type: "line" }>, ctx);
  },
};
