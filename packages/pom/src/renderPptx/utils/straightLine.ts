/**
 * 2 点間の直線を pptxgenjs の line shape に変換する共通描画処理。
 *
 * pptxgenjs の line shape は左上座標 (x, y) + サイズ (w, h) で表現され、
 * 線の向き (始点→終点) は flipH / flipV で表すため、端点座標からの
 * 変換ロジックを Line / Arrow ノードで共有する。
 */
import type { LineArrow, LineNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { asEmu } from "@pptx-glimpse/document";
import { pxToEmu } from "../units.ts";
import {
  addGlimpseShape,
  arrowEndpoint,
  createShapeBoundsInput,
  noneShapeFill,
  solidShapeFill,
} from "./glimpseShape.ts";

/**
 * boolean | LineArrowOptions から pptxgenjs の arrow type を取得
 */
export function resolveArrowType(
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

type StraightLinePoints = { x1: number; y1: number; x2: number; y2: number };

type StraightLineStyle = Pick<
  LineNode,
  "color" | "lineWidth" | "dashType" | "beginArrow" | "endArrow"
>;

/**
 * 始点 (x1, y1) から終点 (x2, y2) への直線を描画する
 */
export function addStraightLine(
  ctx: RenderContext,
  { x1, y1, x2, y2 }: StraightLinePoints,
  { color, lineWidth, dashType, beginArrow, endArrow }: StraightLineStyle,
): void {
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const lineW = Math.abs(x2 - x1);
  const lineH = Math.abs(y2 - y1);

  // 線の方向を判定して flip を決定
  // flipH: 右から左へ向かう線
  // flipV: 下から上へ向かう線
  const flipH = x2 < x1;
  const flipV = y2 < y1;

  addGlimpseShape(
    ctx,
    {
      preset: "line",
      ...createShapeBoundsInput({ x: minX, y: minY, w: lineW, h: lineH }),
      fill: noneShapeFill(),
      outline: {
        fill: solidShapeFill(color ?? "000000"),
        width:
          lineWidth !== undefined
            ? asEmu(Math.round(pxToEmu(lineWidth)))
            : asEmu(12700),
        dash: dashType === "lgDashDotDot" ? undefined : dashType,
        headEnd: arrowEndpoint(resolveArrowType(beginArrow)),
        tailEnd: arrowEndpoint(resolveArrowType(endArrow)),
      },
    },
    { x: minX, y: minY, w: lineW, h: lineH },
    { flipH, flipV },
  );
}
