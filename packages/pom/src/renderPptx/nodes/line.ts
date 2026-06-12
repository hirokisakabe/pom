import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { addStraightLine } from "../utils/straightLine.ts";

type LinePositionedNode = Extract<PositionedNode, { type: "line" }>;

export function renderLineNode(
  node: LinePositionedNode,
  ctx: RenderContext,
): void {
  const { x1, y1, x2, y2 } = node;
  addStraightLine(ctx, { x1, y1, x2, y2 }, node);
}
