import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { createTextOptions } from "../textOptions.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const textOptions = createTextOptions(node);
  ctx.slide.addText(node.text ?? "", textOptions);
}
