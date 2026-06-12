import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn } from "../units.ts";

type IconPositionedNode = Extract<PositionedNode, { type: "icon" }>;

export function renderIconNode(
  node: IconPositionedNode,
  ctx: RenderContext,
): void {
  // variant 指定時は背景図形を描画
  if (node.variant) {
    const isCircle = node.variant.startsWith("circle");
    const isFilled = node.variant.endsWith("-filled");
    const bgColor = node.bgColor ?? "#E0E0E0";
    const colorValue = bgColor.replace(/^#/, "");

    const shapeType = isCircle ? "ellipse" : "roundRect";
    const shapeOptions: Record<string, unknown> = {
      x: pxToIn(node.bgX ?? node.x),
      y: pxToIn(node.bgY ?? node.y),
      w: pxToIn(node.bgW ?? node.w),
      h: pxToIn(node.bgH ?? node.h),
      fill: isFilled ? { color: colorValue } : { type: "none" as const },
      line: isFilled ? undefined : { color: colorValue, width: 1.5 },
      rectRadius: isCircle ? undefined : 0.1,
      rotate: node.rotate,
    };

    ctx.slide.addShape(shapeType, shapeOptions);
  }

  ctx.slide.addImage({
    data: node.iconImageData,
    x: pxToIn(node.iconX ?? node.x),
    y: pxToIn(node.iconY ?? node.y),
    w: pxToIn(node.iconW ?? node.w),
    h: pxToIn(node.iconH ?? node.h),
    rotate: node.rotate,
  });
}
