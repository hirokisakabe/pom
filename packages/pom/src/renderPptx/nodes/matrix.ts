import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";
import { measureMatrix } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { resolveScaledContentArea } from "../utils/scaleToFit.ts";

type MatrixPositionedNode = Extract<PositionedNode, { type: "matrix" }>;

export function renderMatrixNode(
  node: MatrixPositionedNode,
  ctx: RenderContext,
): void {
  const items = node.items;
  const axes = node.axes;
  const quadrants = node.quadrants;

  const defaultItemColor = "1D4ED8"; // blue
  const baseItemSize = 24; // px
  const baseLineWidth = 2; // px
  const axisColor = "E2E8F0";
  const axisLabelColor = node.axisLabelColor?.replace("#", "") ?? "64748B";
  const itemLabelColor = node.itemLabelColor?.replace("#", "") ?? "1E293B";

  // スケール係数を計算（コンテンツ領域基準）
  const { content, scaleFactor } = resolveScaledContentArea(
    node,
    measureMatrix(node),
    ctx,
  );

  const itemSize = baseItemSize * scaleFactor;
  const lineWidth = baseLineWidth * scaleFactor;

  // マトリクスの描画領域（軸ラベル用の余白を考慮）
  const axisMargin = 60 * scaleFactor; // 軸ラベル用の余白
  const areaX = content.x + axisMargin;
  const areaY = content.y + axisMargin;
  const areaW = content.w - axisMargin * 2;
  const areaH = content.h - axisMargin * 2;

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
  const axisLabelW = 120 * scaleFactor;
  const axisLabelH = 24 * scaleFactor;

  // X軸ラベル（下部中央）
  ctx.slide.addText(axes.x, {
    x: pxToIn(centerX - axisLabelW / 2),
    y: pxToIn(areaY + areaH + 8 * scaleFactor),
    w: pxToIn(axisLabelW),
    h: pxToIn(axisLabelH),
    fontSize: pxToPt(12 * scaleFactor),
    fontFace: "Noto Sans JP",
    color: axisLabelColor,
    align: "center",
    valign: "top",
  });

  // Y軸ラベル（左部中央）270° 回転で下から上読み。w が視覚的な高さになるため CJK 5 文字以上も収まる幅を確保
  const yLabelW = 100 * scaleFactor;
  const yLabelH = 20 * scaleFactor;
  ctx.slide.addText(axes.y, {
    x: pxToIn(content.x + axisMargin / 2 - yLabelW / 2),
    y: pxToIn(centerY - yLabelH / 2),
    w: pxToIn(yLabelW),
    h: pxToIn(yLabelH),
    fontSize: pxToPt(12 * scaleFactor),
    fontFace: "Noto Sans JP",
    color: axisLabelColor,
    align: "center",
    valign: "middle",
    rotate: 270,
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
      scaleFactor,
      node.quadrantLabelColor?.replace("#", "") ?? "94A3B8",
    );
  }

  // === 4. アイテムをプロット ===
  const itemLabelW = 100 * scaleFactor;
  const itemLabelH = 18 * scaleFactor;

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
      x: pxToIn(itemX - itemLabelW / 2),
      y: pxToIn(itemY - itemSize / 2 - 20 * scaleFactor),
      w: pxToIn(itemLabelW),
      h: pxToIn(itemLabelH),
      fontSize: pxToPt(11 * scaleFactor),
      fontFace: "Noto Sans JP",
      color: item.textColor?.replace("#", "") ?? itemLabelColor,
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
  scaleFactor: number,
  quadrantColor: string,
): void {
  const quadrantFontSize = 11 * scaleFactor;
  const quadrantInset = 10 * scaleFactor;
  const quadrantW = areaW / 2 - 20 * scaleFactor;
  const quadrantH = 48 * scaleFactor;

  // 左上
  ctx.slide.addText(quadrants.topLeft, {
    x: pxToIn(areaX + quadrantInset),
    y: pxToIn(areaY + quadrantInset),
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
    x: pxToIn(centerX + quadrantInset),
    y: pxToIn(areaY + quadrantInset),
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
    x: pxToIn(areaX + quadrantInset),
    y: pxToIn(centerY + areaH / 2 - quadrantH - quadrantInset),
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
    x: pxToIn(centerX + quadrantInset),
    y: pxToIn(centerY + areaH / 2 - quadrantH - quadrantInset),
    w: pxToIn(quadrantW),
    h: pxToIn(quadrantH),
    fontSize: pxToPt(quadrantFontSize),
    fontFace: "Noto Sans JP",
    color: quadrantColor,
    align: "right",
    valign: "bottom",
  });
}
