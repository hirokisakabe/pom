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

    // 背景図形の line のデフォルト: outlined variant は colorValue / 1.5pt、
    // filled variant は undefined (枠線なし)。
    const variantDefaultLine = isFilled
      ? undefined
      : { color: colorValue, width: 1.5 };
    // outline 指定時は variant のデフォルト line とフィールド単位でマージする。
    // outline 側で省略された属性は variant default の値を引き継ぐので、例えば
    // outlined variant に `outline.color` だけ指定すると、太さは 1.5pt のまま
    // 色だけ outline で上書きされる。
    const outlineLine = node.outline
      ? {
          color:
            node.outline.color ?? variantDefaultLine?.color ?? "FFFFFF",
          width:
            node.outline.size !== undefined
              ? pxToPt(node.outline.size)
              : variantDefaultLine?.width ?? 1,
        }
      : variantDefaultLine;

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
