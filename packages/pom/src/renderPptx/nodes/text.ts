import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const handle = ctx.buildContext.pptxAuthoring.register(node);
  if (node.id && ctx.idNodeMap.get(node.id) === node) {
    ctx.connectorTargetMap.set(node.id, {
      handle,
      bounds: { x: node.x, y: node.y, w: node.w, h: node.h },
    });
  }
}
