import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { addStraightLine } from "../utils/straightLine.ts";

type ArrowPositionedNode = Extract<PositionedNode, { type: "arrow" }>;

export function renderArrowNode(
  node: ArrowPositionedNode,
  ctx: RenderContext,
): void {
  const fromBounds = ctx.idPositionMap.get(node.from);
  const toBounds = ctx.idPositionMap.get(node.to);

  if (!fromBounds) {
    ctx.buildContext.diagnostics.add(
      "ARROW_REF_NOT_FOUND",
      `Arrow: "from" ID "${node.from}" not found`,
    );
    return;
  }
  if (!toBounds) {
    ctx.buildContext.diagnostics.add(
      "ARROW_REF_NOT_FOUND",
      `Arrow: "to" ID "${node.to}" not found`,
    );
    return;
  }

  // 参照ノードの中心同士を結ぶ
  addStraightLine(
    ctx,
    {
      x1: fromBounds.x + fromBounds.w / 2,
      y1: fromBounds.y + fromBounds.h / 2,
      x2: toBounds.x + toBounds.w / 2,
      y2: toBounds.y + toBounds.h / 2,
    },
    node,
  );
}
