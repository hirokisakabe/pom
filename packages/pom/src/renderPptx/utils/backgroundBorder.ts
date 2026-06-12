import type { PositionedNode } from "../../types.ts";
import { getImageData } from "../../shared/measureImage.ts";
import { registerBackgroundGradient } from "../gradientFills.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, rectPxToIn } from "../units.ts";
import {
  convertShadow,
  convertBorderLine,
  hasVisibleBorder,
  resolveBackgroundFill,
  resolveRectRadius,
} from "./visualStyle.ts";

/**
 * ノードの背景色・背景画像・ボーダー・影を描画する
 * 全ノードタイプで最初に呼び出される共通処理
 *
 * 描画順序: 背景色 → 背景画像 → ボーダー
 */
export function renderBackgroundAndBorder(
  node: PositionedNode,
  ctx: RenderContext,
): void {
  const {
    backgroundColor,
    backgroundGradient,
    backgroundImage,
    border,
    borderRadius,
    shadow,
  } = node;

  // backgroundGradient はマーカー色の solidFill として描画し、
  // 出力時の後処理で gradFill に置換される (gradientFills.ts 参照)。
  // opacity はマーカー側ではなく gradFill のカラーストップの alpha で表現する
  const gradientMarker = backgroundGradient
    ? registerBackgroundGradient(
        backgroundGradient,
        node.opacity,
        ctx.buildContext.gradientFills,
      )
    : undefined;

  const hasBackground = Boolean(backgroundColor) || Boolean(gradientMarker);
  const hasBackgroundImage = Boolean(backgroundImage);
  const hasBorder = hasVisibleBorder(border);
  const hasShadow = Boolean(shadow);

  if (!hasBackground && !hasBackgroundImage && !hasBorder && !hasShadow) {
    return;
  }

  // borderRadius がある場合は roundRect を使用し、rectRadius を計算
  const shapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;

  const rectRadius = resolveRectRadius(borderRadius, node.w, node.h);

  // backgroundImage がない場合は従来通り1回の addShape で処理
  if (!hasBackgroundImage) {
    const fill = hasBackground
      ? resolveBackgroundFill(backgroundColor, node.opacity, gradientMarker)
      : { type: "none" as const };

    const line = hasBorder
      ? convertBorderLine(border, "000000")
      : { type: "none" as const };

    ctx.slide.addShape(shapeType, {
      ...rectPxToIn(node),
      fill,
      line,
      rectRadius,
      shadow: convertShadow(shadow),
    });
    return;
  }

  // backgroundImage がある場合は分割描画: 背景色 → 背景画像 → ボーダー

  // 1. 背景色
  if (hasBackground) {
    ctx.slide.addShape(shapeType, {
      ...rectPxToIn(node),
      fill: resolveBackgroundFill(
        backgroundColor,
        node.opacity,
        gradientMarker,
      ),
      line: { type: "none" as const },
      rectRadius,
    });
  }

  // 2. 背景画像
  if (backgroundImage) {
    const sizing = backgroundImage.sizing ?? "cover";
    const imageOptions: Record<string, unknown> = {
      ...rectPxToIn(node),
      sizing: {
        type: sizing,
        w: pxToIn(node.w),
        h: pxToIn(node.h),
      },
    };

    const cachedData = getImageData(
      backgroundImage.src,
      ctx.buildContext.imageDataCache,
    );
    if (cachedData) {
      ctx.slide.addImage({ ...imageOptions, data: cachedData });
    } else {
      ctx.slide.addImage({ ...imageOptions, path: backgroundImage.src });
    }
  }

  // 3. ボーダー
  if (hasBorder || hasShadow) {
    ctx.slide.addShape(shapeType, {
      ...rectPxToIn(node),
      fill: { type: "none" as const },
      line: hasBorder
        ? convertBorderLine(border, "000000")
        : { type: "none" as const },
      rectRadius,
      shadow: convertShadow(shadow),
    });
  }
}
