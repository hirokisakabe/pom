import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  ctx.buildContext.pptxAuthoring.register(node);
}
