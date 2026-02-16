import type { PositionedNode, ShadowStyle } from "../../types.ts";
import { getImageData } from "../../calcYogaLayout/measureImage.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";
import { toGradientFillProps } from "./gradientFill.ts";

function convertShadow(shadow: ShadowStyle) {
  return {
    type: shadow.type,
    opacity: shadow.opacity,
    blur: shadow.blur,
    angle: shadow.angle,
    offset: shadow.offset,
    color: shadow.color,
  };
}

/**
 * ノードの背景色・背景グラデーション・背景画像・ボーダー・影を描画する
 * 全ノードタイプで最初に呼び出される共通処理
 *
 * 描画順序: 背景色/グラデーション → 背景画像 → ボーダー
 */
export function renderBackgroundAndBorder(
  node: PositionedNode,
  ctx: RenderContext,
): void {
  const { backgroundColor, backgroundImage, border, borderRadius } = node;
  const backgroundGradient =
    "backgroundGradient" in node ? node.backgroundGradient : undefined;
  const shadow =
    "shadow" in node ? (node as { shadow?: ShadowStyle }).shadow : undefined;
  const hasBackground = Boolean(backgroundColor) || Boolean(backgroundGradient);
  const hasBackgroundImage = Boolean(backgroundImage);
  const hasBorder = Boolean(
    border &&
      (border.color !== undefined ||
        border.width !== undefined ||
        border.dashType !== undefined),
  );
  const hasShadow = Boolean(shadow);

  if (!hasBackground && !hasBackgroundImage && !hasBorder && !hasShadow) {
    return;
  }

  // borderRadius がある場合は roundRect を使用し、rectRadius を計算
  const shapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;

  // px を 0-1 の正規化値に変換
  const rectRadius = borderRadius
    ? Math.min((borderRadius / Math.min(node.w, node.h)) * 2, 1)
    : undefined;

  // backgroundImage がない場合は従来通り1回の addShape で処理
  if (!hasBackgroundImage) {
    let fill: Record<string, unknown>;
    if (backgroundGradient) {
      fill = toGradientFillProps(backgroundGradient);
    } else if (hasBackground) {
      fill = {
        color: backgroundColor,
        transparency:
          node.opacity !== undefined ? (1 - node.opacity) * 100 : undefined,
      };
    } else {
      fill = { type: "none" as const };
    }

    const line = hasBorder
      ? {
          color: border?.color ?? "000000",
          width: border?.width !== undefined ? pxToPt(border.width) : undefined,
          dashType: border?.dashType,
        }
      : { type: "none" as const };

    ctx.slide.addShape(shapeType, {
      x: pxToIn(node.x),
      y: pxToIn(node.y),
      w: pxToIn(node.w),
      h: pxToIn(node.h),
      fill,
      line,
      rectRadius,
      shadow: shadow ? convertShadow(shadow) : undefined,
    });
    return;
  }

  // backgroundImage がある場合は分割描画: 背景色/グラデーション → 背景画像 → ボーダー

  // 1. 背景色/グラデーション
  if (hasBackground) {
    let fill: Record<string, unknown>;
    if (backgroundGradient) {
      fill = toGradientFillProps(backgroundGradient);
    } else {
      fill = {
        color: backgroundColor,
        transparency:
          node.opacity !== undefined ? (1 - node.opacity) * 100 : undefined,
      };
    }
    ctx.slide.addShape(shapeType, {
      x: pxToIn(node.x),
      y: pxToIn(node.y),
      w: pxToIn(node.w),
      h: pxToIn(node.h),
      fill,
      line: { type: "none" as const },
      rectRadius,
    });
  }

  // 2. 背景画像
  if (backgroundImage) {
    const sizing = backgroundImage.sizing ?? "cover";
    const imageOptions: Record<string, unknown> = {
      x: pxToIn(node.x),
      y: pxToIn(node.y),
      w: pxToIn(node.w),
      h: pxToIn(node.h),
      sizing: {
        type: sizing,
        w: pxToIn(node.w),
        h: pxToIn(node.h),
      },
    };

    const cachedData = getImageData(backgroundImage.src);
    if (cachedData) {
      ctx.slide.addImage({ ...imageOptions, data: cachedData });
    } else {
      ctx.slide.addImage({ ...imageOptions, path: backgroundImage.src });
    }
  }

  // 3. ボーダー
  if (hasBorder || hasShadow) {
    ctx.slide.addShape(shapeType, {
      x: pxToIn(node.x),
      y: pxToIn(node.y),
      w: pxToIn(node.w),
      h: pxToIn(node.h),
      fill: { type: "none" as const },
      line: hasBorder
        ? {
            color: border?.color ?? "000000",
            width:
              border?.width !== undefined ? pxToPt(border.width) : undefined,
            dashType: border?.dashType,
          }
        : { type: "none" as const },
      rectRadius,
      shadow: shadow ? convertShadow(shadow) : undefined,
    });
  }
}
