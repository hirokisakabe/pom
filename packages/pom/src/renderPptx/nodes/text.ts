import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { createTextOptions } from "../textOptions.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const textOptions = createTextOptions(node);
  const marker = ctx.buildContext.glimpseTextBoxes.register(node);

  ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
    x: textOptions.x,
    y: textOptions.y,
    w: textOptions.w,
    h: textOptions.h,
    fill: { color: "FFFFFF", transparency: 100 },
    line: { color: "FFFFFF", transparency: 100 },
    objectName: marker,
  });
}
