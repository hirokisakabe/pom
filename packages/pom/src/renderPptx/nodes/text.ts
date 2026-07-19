import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { createTextNodeInput } from "../glimpseAdapter.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  ctx.authoring.addTextBox(
    createTextNodeInput(node, ctx.authoring.useLayoutTextMargins),
  );
}
