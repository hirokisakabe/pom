import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";

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

    // outline 指定時は背景図形の line を上書きする。
    // 未指定時は variant のデフォルト (outlined variant は colorValue / 1.5pt) を維持。
    const outlineLine = node.outline
      ? {
          color: node.outline.color,
          width:
            node.outline.size !== undefined
              ? pxToPt(node.outline.size)
              : undefined,
        }
      : isFilled
        ? undefined
        : { color: colorValue, width: 1.5 };

    const glowMarker = node.glow
      ? ctx.buildContext.glowEffects.register(node.glow)
      : undefined;

    const shapeType = isCircle ? "ellipse" : "roundRect";
    const shapeOptions: Record<string, unknown> = {
      x: pxToIn(node.bgX ?? node.x),
      y: pxToIn(node.bgY ?? node.y),
      w: pxToIn(node.bgW ?? node.w),
      h: pxToIn(node.bgH ?? node.h),
      fill: isFilled ? { color: colorValue } : { type: "none" as const },
      line: outlineLine,
      rectRadius: isCircle ? undefined : 0.1,
      rotate: node.rotate,
      objectName: glowMarker,
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
