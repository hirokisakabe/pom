import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";

/**
 * ノードの背景色とボーダーを描画する
 * 全ノードタイプで最初に呼び出される共通処理
 */
export function renderBackgroundAndBorder(
  node: PositionedNode,
  ctx: RenderContext,
): void {
  const { backgroundColor, border, borderRadius } = node;
  const hasBackground = Boolean(backgroundColor);
  const hasBorder = Boolean(
    border &&
      (border.color !== undefined ||
        border.width !== undefined ||
        border.dashType !== undefined),
  );

  if (!hasBackground && !hasBorder) {
    return;
  }

  const fill = hasBackground
    ? { color: backgroundColor }
    : { type: "none" as const };

  const line = hasBorder
    ? {
        color: border?.color ?? "000000",
        width: border?.width !== undefined ? pxToPt(border.width) : undefined,
        dashType: border?.dashType,
      }
    : { type: "none" as const };

  // borderRadius がある場合は roundRect を使用し、rectRadius を計算
  const shapeType = borderRadius
    ? ctx.pptx.ShapeType.roundRect
    : ctx.pptx.ShapeType.rect;

  // px を 0-1 の正規化値に変換
  const rectRadius = borderRadius
    ? Math.min((borderRadius / Math.min(node.w, node.h)) * 2, 1)
    : undefined;

  const shapeOptions = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    fill,
    line,
    rectRadius,
  };

  ctx.slide.addShape(shapeType, shapeOptions);
}
