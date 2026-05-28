import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";
import { resolveArrowType } from "./line.ts";

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

  const x1 = fromBounds.x + fromBounds.w / 2;
  const y1 = fromBounds.y + fromBounds.h / 2;
  const x2 = toBounds.x + toBounds.w / 2;
  const y2 = toBounds.y + toBounds.h / 2;

  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const lineW = Math.abs(x2 - x1);
  const lineH = Math.abs(y2 - y1);
  const flipH = x2 < x1;
  const flipV = y2 < y1;

  const { color, lineWidth, dashType, beginArrow, endArrow } = node;

  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(minX),
    y: pxToIn(minY),
    w: pxToIn(lineW),
    h: pxToIn(lineH),
    flipH,
    flipV,
    line: {
      color: color ?? "000000",
      width: lineWidth !== undefined ? pxToPt(lineWidth) : 1,
      dashType,
      beginArrowType: resolveArrowType(beginArrow),
      endArrowType: resolveArrowType(endArrow),
    },
  });
}
