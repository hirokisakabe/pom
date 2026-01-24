import type { PositionedNode, LineArrow } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";

type LinePositionedNode = Extract<PositionedNode, { type: "line" }>;

/**
 * boolean | LineArrowOptions から pptxgenjs の arrow type を取得
 */
function resolveArrowType(
  arrow: LineArrow | undefined,
): "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle" | undefined {
  if (arrow === undefined) {
    return undefined;
  }
  if (arrow === false) {
    return "none";
  }
  if (arrow === true) {
    return "triangle"; // デフォルト
  }
  return arrow.type ?? "triangle";
}

export function renderLineNode(
  node: LinePositionedNode,
  ctx: RenderContext,
): void {
  const { x1, y1, x2, y2, color, lineWidth, dashType, beginArrow, endArrow } =
    node;

  // pptxgenjs の line シェイプは x, y, w, h で描画
  // x, y は左上座標、w, h で方向と長さを指定
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const lineW = Math.abs(x2 - x1);
  const lineH = Math.abs(y2 - y1);

  // 線の方向を判定して flip を決定
  // flipH: 右から左へ向かう線
  // flipV: 下から上へ向かう線
  const flipH = x2 < x1;
  const flipV = y2 < y1;

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
      dashType: dashType,
      beginArrowType: resolveArrowType(beginArrow),
      endArrowType: resolveArrowType(endArrow),
    },
  });
}
