import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

type MatrixPositionedNode = Extract<PositionedNode, { type: "matrix" }>;

export function renderMatrixNode(
  node: MatrixPositionedNode,
  ctx: RenderContext,
): void {
  const items = node.items;
  const axes = node.axes;
  const quadrants = node.quadrants;

  const defaultItemColor = "1D4ED8"; // blue
  const itemSize = 24; // px
  const lineWidth = 2; // px
  const axisColor = "E2E8F0";

  // マトリクスの描画領域（パディングを考慮）
  const padding = 60; // 軸ラベル用の余白
  const areaX = node.x + padding;
  const areaY = node.y + padding;
  const areaW = node.w - padding * 2;
  const areaH = node.h - padding * 2;

  // 中心座標
  const centerX = areaX + areaW / 2;
  const centerY = areaY + areaH / 2;

  // === 1. 十字線（軸線）を描画 ===
  // 横線（X軸）
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(areaX),
    y: pxToIn(centerY),
    w: pxToIn(areaW),
    h: 0,
    line: { color: axisColor, width: pxToPt(lineWidth) },
  });

  // 縦線（Y軸）
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(centerX),
    y: pxToIn(areaY),
    w: 0,
    h: pxToIn(areaH),
    line: { color: axisColor, width: pxToPt(lineWidth) },
  });

  // === 2. 軸ラベルを描画 ===
  // X軸ラベル（下部中央）
  ctx.slide.addText(axes.x, {
    x: pxToIn(centerX - 60),
    y: pxToIn(areaY + areaH + 8),
    w: pxToIn(120),
    h: pxToIn(24),
    fontSize: pxToPt(12),
    fontFace: "Noto Sans JP",
    color: "64748B",
    align: "center",
    valign: "top",
  });

  // Y軸ラベル（左部中央）
  ctx.slide.addText(axes.y, {
    x: pxToIn(node.x + 4),
    y: pxToIn(centerY - 12),
    w: pxToIn(48),
    h: pxToIn(24),
    fontSize: pxToPt(12),
    fontFace: "Noto Sans JP",
    color: "64748B",
    align: "center",
    valign: "middle",
  });

  // === 3. 象限ラベルを描画 ===
  if (quadrants) {
    renderQuadrantLabels(
      ctx,
      quadrants,
      areaX,
      areaY,
      areaW,
      areaH,
      centerX,
      centerY,
    );
  }

  // === 4. アイテムをプロット ===
  for (const item of items) {
    // 座標変換: (0,0)=左下, (1,1)=右上
    // x: 0 -> areaX, 1 -> areaX + areaW
    // y: 0 -> areaY + areaH, 1 -> areaY (反転)
    const itemX = areaX + item.x * areaW;
    const itemY = areaY + (1 - item.y) * areaH; // Y軸反転
    const itemColor = item.color ?? defaultItemColor;

    // 円を描画
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
      x: pxToIn(itemX - itemSize / 2),
      y: pxToIn(itemY - itemSize / 2),
      w: pxToIn(itemSize),
      h: pxToIn(itemSize),
      fill: { color: itemColor },
      line: { type: "none" as const },
    });

    // ラベルを描画（円の上）
    ctx.slide.addText(item.label, {
      x: pxToIn(itemX - 50),
      y: pxToIn(itemY - itemSize / 2 - 20),
      w: pxToIn(100),
      h: pxToIn(18),
      fontSize: pxToPt(11),
      fontFace: "Noto Sans JP",
      color: "1E293B",
      bold: true,
      align: "center",
      valign: "bottom",
    });
  }
}

function renderQuadrantLabels(
  ctx: RenderContext,
  quadrants: NonNullable<MatrixPositionedNode["quadrants"]>,
  areaX: number,
  areaY: number,
  areaW: number,
  areaH: number,
  centerX: number,
  centerY: number,
): void {
  const quadrantFontSize = 11;
  const quadrantColor = "94A3B8"; // slate-400
  const quadrantW = areaW / 2 - 20;
  const quadrantH = 48;

  // 左上
  ctx.slide.addText(quadrants.topLeft, {
    x: pxToIn(areaX + 10),
    y: pxToIn(areaY + 10),
    w: pxToIn(quadrantW),
    h: pxToIn(quadrantH),
    fontSize: pxToPt(quadrantFontSize),
    fontFace: "Noto Sans JP",
    color: quadrantColor,
    align: "left",
    valign: "top",
  });

  // 右上
  ctx.slide.addText(quadrants.topRight, {
    x: pxToIn(centerX + 10),
    y: pxToIn(areaY + 10),
    w: pxToIn(quadrantW),
    h: pxToIn(quadrantH),
    fontSize: pxToPt(quadrantFontSize),
    fontFace: "Noto Sans JP",
    color: quadrantColor,
    align: "right",
    valign: "top",
  });

  // 左下
  ctx.slide.addText(quadrants.bottomLeft, {
    x: pxToIn(areaX + 10),
    y: pxToIn(centerY + areaH / 2 - quadrantH - 10),
    w: pxToIn(quadrantW),
    h: pxToIn(quadrantH),
    fontSize: pxToPt(quadrantFontSize),
    fontFace: "Noto Sans JP",
    color: quadrantColor,
    align: "left",
    valign: "bottom",
  });

  // 右下
  ctx.slide.addText(quadrants.bottomRight, {
    x: pxToIn(centerX + 10),
    y: pxToIn(centerY + areaH / 2 - quadrantH - 10),
    w: pxToIn(quadrantW),
    h: pxToIn(quadrantH),
    fontSize: pxToPt(quadrantFontSize),
    fontFace: "Noto Sans JP",
    color: quadrantColor,
    align: "right",
    valign: "bottom",
  });
}
