import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

export type CircleOptions = {
  cx: number; // 中心X (px)
  cy: number; // 中心Y (px)
  radius: number; // 半径 (px)
  fillColor: string;
  lineColor?: string;
  lineWidth?: number;
};

export type LineOptions = {
  x1: number; // 始点X (px)
  y1: number; // 始点Y (px)
  x2: number; // 終点X (px)
  y2: number; // 終点Y (px)
  color: string;
  width: number; // px
  endArrowType?: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle";
};

/**
 * 円を描画する
 */
export function drawCircle(ctx: RenderContext, options: CircleOptions): void {
  const { cx, cy, radius, fillColor, lineColor, lineWidth } = options;

  ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
    x: pxToIn(cx - radius),
    y: pxToIn(cy - radius),
    w: pxToIn(radius * 2),
    h: pxToIn(radius * 2),
    fill: { color: fillColor },
    line: lineColor
      ? { color: lineColor, width: lineWidth ? pxToPt(lineWidth) : undefined }
      : { type: "none" as const },
  });
}

/**
 * 線を描画する
 */
export function drawLine(ctx: RenderContext, options: LineOptions): void {
  const { x1, y1, x2, y2, color, width, endArrowType } = options;

  const isHorizontal = y1 === y2;
  const isVertical = x1 === x2;

  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(Math.min(x1, x2)),
    y: pxToIn(Math.min(y1, y2)),
    w: isVertical ? 0 : pxToIn(Math.abs(x2 - x1)),
    h: isHorizontal ? 0 : pxToIn(Math.abs(y2 - y1)),
    line: {
      color,
      width: pxToPt(width),
      endArrowType,
    },
  });
}
