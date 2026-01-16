import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { createTextOptions } from "../textOptions";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const textOptions = createTextOptions(node);
  ctx.slide.addText(node.text ?? "", textOptions);
}
