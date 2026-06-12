import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { stripHash } from "../utils/visualStyle.ts";
import { pxToIn, pxToPt } from "../units.ts";
import { measurePyramid } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { resolveScaledContentArea } from "../utils/scaleToFit.ts";

type PyramidPositionedNode = Extract<PositionedNode, { type: "pyramid" }>;

export function renderPyramidNode(
  node: PyramidPositionedNode,
  ctx: RenderContext,
): void {
  const direction = node.direction ?? "up";
  const levels = node.levels;
  const levelCount = levels.length;

  if (levelCount === 0) return;

  const defaultColor = "4472C4";
  const defaultTextColor = "FFFFFF";

  // スケール係数を計算（コンテンツ領域基準）
  const { content, scaleFactor } = resolveScaledContentArea(
    node,
    measurePyramid(node),
    ctx,
  );

  const baseWidth = 400 * scaleFactor;
  const layerHeight = 50 * scaleFactor;
  const gap = 2 * scaleFactor;

  const totalHeight = levelCount * layerHeight + (levelCount - 1) * gap;
  const startX = content.x + (content.w - baseWidth) / 2;
  const startY = content.y + (content.h - totalHeight) / 2;

  for (let i = 0; i < levelCount; i++) {
    const level = levels[i];
    const fillColor = stripHash(level.color) ?? defaultColor;
    const textColor = stripHash(level.textColor) ?? defaultTextColor;

    const layerY = startY + i * (layerHeight + gap);

    // direction="up": i=0 が最上段（最も狭い＝三角形）、i=levelCount-1 が最下段（最も広い）
    // direction="down": i=0 が最上段（最も広い）、i=levelCount-1 が最下段（最も狭い＝三角形）
    // 頂点層の上辺は幅0（三角形）、それ以外は台形
    let topWidthRatio: number;
    let bottomWidthRatio: number;

    if (direction === "up") {
      topWidthRatio = i / levelCount;
      bottomWidthRatio = (i + 1) / levelCount;
    } else {
      topWidthRatio = (levelCount - i) / levelCount;
      bottomWidthRatio = (levelCount - i - 1) / levelCount;
    }

    const topWidth = baseWidth * topWidthRatio;
    const bottomWidth = baseWidth * bottomWidthRatio;

    const topLeftX = startX + (baseWidth - topWidth) / 2;
    const topRightX = topLeftX + topWidth;
    const bottomLeftX = startX + (baseWidth - bottomWidth) / 2;
    const bottomRightX = bottomLeftX + bottomWidth;

    // custGeom のバウンディングボックス
    const bboxX = Math.min(topLeftX, bottomLeftX);
    const bboxW = Math.max(topRightX, bottomRightX) - bboxX;

    // points はバウンディングボックス内の相対インチ座標
    const points = [
      { x: pxToIn(topLeftX - bboxX), y: 0 },
      { x: pxToIn(topRightX - bboxX), y: 0 },
      { x: pxToIn(bottomRightX - bboxX), y: pxToIn(layerHeight) },
      { x: pxToIn(bottomLeftX - bboxX), y: pxToIn(layerHeight) },
      { close: true as const },
    ];

    // 図形を描画（頂点層は三角形、それ以外は台形）
    ctx.slide.addShape("custGeom" as never, {
      x: pxToIn(bboxX),
      y: pxToIn(layerY),
      w: pxToIn(bboxW),
      h: pxToIn(layerHeight),
      points,
      fill: { color: fillColor },
      line: { type: "none" as const },
    });

    // テキストを図形の中央に重ねて描画
    ctx.slide.addText(level.label, {
      x: pxToIn(bboxX),
      y: pxToIn(layerY),
      w: pxToIn(bboxW),
      h: pxToIn(layerHeight),
      fontSize: pxToPt((node.fontSize ?? 14) * scaleFactor),
      fontFace: node.fontFamily ?? "Noto Sans JP",
      color: textColor,
      bold: node.bold ?? false,
      align: "center",
      valign: "middle",
      autoFit: true,
    });
  }
}
