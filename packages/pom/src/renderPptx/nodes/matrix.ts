import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { stripHash } from "../utils/visualStyle.ts";
import { measureMatrix } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { resolveScaledContentArea } from "../utils/scaleToFit.ts";
import { addStraightLine } from "../utils/straightLine.ts";
import {
  addGlimpseShape,
  createShapeBoundsInput,
  noShapeOutline,
  solidShapeFill,
} from "../utils/glimpseShape.ts";
import { addGlimpseTextBox } from "../utils/glimpseTextBox.ts";

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
  const axisLabelColor = stripHash(node.axisLabelColor) ?? "64748B";
  const itemLabelColor = stripHash(node.itemLabelColor) ?? "1E293B";

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
  addStraightLine(
    ctx,
    { x1: areaX, y1: centerY, x2: areaX + areaW, y2: centerY },
    { color: axisColor, lineWidth },
  );

  // 縦線（Y軸）
  addStraightLine(
    ctx,
    { x1: centerX, y1: areaY, x2: centerX, y2: areaY + areaH },
    { color: axisColor, lineWidth },
  );

  // === 2. 軸ラベルを描画 ===
  const axisLabelW = 120 * scaleFactor;
  const axisLabelH = 24 * scaleFactor;

  // X軸ラベル（下部中央）
  addGlimpseTextBox(
    ctx,
    {
      x: centerX - axisLabelW / 2,
      y: areaY + areaH + 8 * scaleFactor,
      w: axisLabelW,
      h: axisLabelH,
    },
    {
      text: axes.x,
      fontSize: 12 * scaleFactor,
      fontFace: "Noto Sans JP",
      color: axisLabelColor,
      align: "center",
      valign: "top",
    },
  );

  // Y軸ラベル（左部中央）270° 回転で下から上読み。w が視覚的な高さになるため CJK 5 文字以上も収まる幅を確保
  const yLabelW = 100 * scaleFactor;
  const yLabelH = 20 * scaleFactor;
  addGlimpseTextBox(
    ctx,
    {
      x: content.x + axisMargin / 2 - yLabelW / 2,
      y: centerY - yLabelH / 2,
      w: yLabelW,
      h: yLabelH,
    },
    {
      text: axes.y,
      fontSize: 12 * scaleFactor,
      fontFace: "Noto Sans JP",
      color: axisLabelColor,
      align: "center",
      valign: "middle",
      rotate: 270,
    },
  );

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
      stripHash(node.quadrantLabelColor) ?? "94A3B8",
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
    addGlimpseShape(
      ctx,
      {
        preset: "ellipse",
        ...createShapeBoundsInput({
          x: itemX - itemSize / 2,
          y: itemY - itemSize / 2,
          w: itemSize,
          h: itemSize,
        }),
        fill: solidShapeFill(itemColor),
        outline: noShapeOutline(),
      },
      {
        x: itemX - itemSize / 2,
        y: itemY - itemSize / 2,
        w: itemSize,
        h: itemSize,
      },
      { fillColor: itemColor },
    );

    // ラベルを描画（円の上）
    addGlimpseTextBox(
      ctx,
      {
        x: itemX - itemLabelW / 2,
        y: itemY - itemSize / 2 - 20 * scaleFactor,
        w: itemLabelW,
        h: itemLabelH,
      },
      {
        text: item.label,
        fontSize: 11 * scaleFactor,
        fontFace: "Noto Sans JP",
        color: stripHash(item.textColor) ?? itemLabelColor,
        bold: true,
        align: "center",
        valign: "bottom",
      },
    );
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
  addGlimpseTextBox(
    ctx,
    {
      x: areaX + quadrantInset,
      y: areaY + quadrantInset,
      w: quadrantW,
      h: quadrantH,
    },
    {
      text: quadrants.topLeft,
      fontSize: quadrantFontSize,
      fontFace: "Noto Sans JP",
      color: quadrantColor,
      align: "left",
      valign: "top",
    },
  );

  // 右上
  addGlimpseTextBox(
    ctx,
    {
      x: centerX + quadrantInset,
      y: areaY + quadrantInset,
      w: quadrantW,
      h: quadrantH,
    },
    {
      text: quadrants.topRight,
      fontSize: quadrantFontSize,
      fontFace: "Noto Sans JP",
      color: quadrantColor,
      align: "right",
      valign: "top",
    },
  );

  // 左下
  addGlimpseTextBox(
    ctx,
    {
      x: areaX + quadrantInset,
      y: centerY + areaH / 2 - quadrantH - quadrantInset,
      w: quadrantW,
      h: quadrantH,
    },
    {
      text: quadrants.bottomLeft,
      fontSize: quadrantFontSize,
      fontFace: "Noto Sans JP",
      color: quadrantColor,
      align: "left",
      valign: "bottom",
    },
  );

  // 右下
  addGlimpseTextBox(
    ctx,
    {
      x: centerX + quadrantInset,
      y: centerY + areaH / 2 - quadrantH - quadrantInset,
      w: quadrantW,
      h: quadrantH,
    },
    {
      text: quadrants.bottomRight,
      fontSize: quadrantFontSize,
      fontFace: "Noto Sans JP",
      color: quadrantColor,
      align: "right",
      valign: "bottom",
    },
  );
}
