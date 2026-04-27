import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";
import { convertUnderline, convertStrike } from "../textOptions.ts";
import { measureProcessArrow } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { calcScaleFactor } from "../utils/scaleToFit.ts";
import {
  ARROW_DEPTH_RATIO,
  DEFAULT_PROCESS_ARROW_ITEM_WIDTH,
  DEFAULT_PROCESS_ARROW_ITEM_HEIGHT,
} from "../../shared/processArrowConstants.ts";
import { getContentArea } from "../utils/contentArea.ts";

type ProcessArrowPositionedNode = Extract<
  PositionedNode,
  { type: "processArrow" }
>;

export function renderProcessArrowNode(
  node: ProcessArrowPositionedNode,
  ctx: RenderContext,
): void {
  const direction = node.direction ?? "horizontal";
  const steps = node.steps;
  const stepCount = steps.length;

  if (stepCount === 0) return;

  const defaultColor = "4472C4"; // PowerPoint標準の青
  const defaultTextColor = "FFFFFF";
  const itemWidth = node.itemWidth ?? DEFAULT_PROCESS_ARROW_ITEM_WIDTH;
  const itemHeight = node.itemHeight ?? DEFAULT_PROCESS_ARROW_ITEM_HEIGHT;
  const arrowDepth = itemHeight * ARROW_DEPTH_RATIO;
  const gap = node.gap ?? -arrowDepth;

  // スケール係数を計算（コンテンツ領域基準）
  const content = getContentArea(node);
  const intrinsic = measureProcessArrow(node);
  const scaleFactor = calcScaleFactor(
    content.w,
    content.h,
    intrinsic.width,
    intrinsic.height,
    "processArrow",
    ctx.buildContext.diagnostics,
  );

  const scaledItemWidth = itemWidth * scaleFactor;
  const scaledItemHeight = itemHeight * scaleFactor;
  const scaledGap = gap * scaleFactor;
  const scaledArrowDepth = arrowDepth * scaleFactor;

  // コンテンツ領域を使用するための仮想ノードを作成
  const contentNode = {
    ...node,
    x: content.x,
    y: content.y,
    w: content.w,
    h: content.h,
  };

  if (direction === "horizontal") {
    renderHorizontalProcessArrow(
      contentNode,
      ctx,
      steps,
      stepCount,
      scaledItemWidth,
      scaledItemHeight,
      scaledGap,
      scaledArrowDepth,
      defaultColor,
      defaultTextColor,
      scaleFactor,
    );
  } else {
    renderVerticalProcessArrow(
      contentNode,
      ctx,
      steps,
      stepCount,
      scaledItemWidth,
      scaledItemHeight,
      scaledGap,
      scaledArrowDepth,
      defaultColor,
      defaultTextColor,
      scaleFactor,
    );
  }
}

function renderHorizontalProcessArrow(
  node: ProcessArrowPositionedNode,
  ctx: RenderContext,
  steps: ProcessArrowPositionedNode["steps"],
  stepCount: number,
  itemWidth: number,
  itemHeight: number,
  gap: number,
  arrowDepth: number,
  defaultColor: string,
  defaultTextColor: string,
  scaleFactor: number,
): void {
  const totalWidth = stepCount * itemWidth + (stepCount - 1) * gap;
  const startX = node.x + (node.w - totalWidth) / 2;
  const centerY = node.y + node.h / 2;

  steps.forEach((step, index) => {
    const stepX = startX + index * (itemWidth + gap);
    const stepY = centerY - itemHeight / 2;
    const fillColor = step.color?.replace("#", "") ?? defaultColor;
    const textColor = step.textColor?.replace("#", "") ?? defaultTextColor;

    // custGeom でシェブロン形状を描画
    const isFirst = index === 0;
    const points = isFirst
      ? [
          // homePlate 風: 左辺フラット、右辺が矢印
          { x: 0, y: 0 },
          { x: pxToIn(itemWidth - arrowDepth), y: 0 },
          { x: pxToIn(itemWidth), y: pxToIn(itemHeight / 2) },
          { x: pxToIn(itemWidth - arrowDepth), y: pxToIn(itemHeight) },
          { x: 0, y: pxToIn(itemHeight) },
          { close: true as const },
        ]
      : [
          // chevron 風: 左辺に切り欠き、右辺が矢印
          { x: 0, y: 0 },
          { x: pxToIn(itemWidth - arrowDepth), y: 0 },
          { x: pxToIn(itemWidth), y: pxToIn(itemHeight / 2) },
          { x: pxToIn(itemWidth - arrowDepth), y: pxToIn(itemHeight) },
          { x: 0, y: pxToIn(itemHeight) },
          { x: pxToIn(arrowDepth), y: pxToIn(itemHeight / 2) },
          { close: true as const },
        ];

    ctx.slide.addShape("custGeom" as never, {
      x: pxToIn(stepX),
      y: pxToIn(stepY),
      w: pxToIn(itemWidth),
      h: pxToIn(itemHeight),
      points,
      fill: { color: fillColor },
      line: { type: "none" as const },
    });

    // テキストを図形の中央（矢印部分を除いた領域）に配置
    const textOffsetLeft = isFirst ? 0 : arrowDepth;
    const textWidth = Math.max(1, itemWidth - arrowDepth - textOffsetLeft);

    ctx.slide.addText(step.label, {
      x: pxToIn(stepX + textOffsetLeft),
      y: pxToIn(stepY),
      w: pxToIn(textWidth),
      h: pxToIn(itemHeight),
      fontSize: pxToPt((node.fontSize ?? 14) * scaleFactor),
      fontFace: node.fontFamily ?? "Noto Sans JP",
      color: textColor,
      bold: node.bold ?? false,
      italic: node.italic,
      underline: convertUnderline(node.underline),
      strike: convertStrike(node.strike),
      highlight: node.highlight,
      align: "center",
      valign: "middle",
    });
  });
}

function renderVerticalProcessArrow(
  node: ProcessArrowPositionedNode,
  ctx: RenderContext,
  steps: ProcessArrowPositionedNode["steps"],
  stepCount: number,
  itemWidth: number,
  itemHeight: number,
  gap: number,
  arrowDepth: number,
  defaultColor: string,
  defaultTextColor: string,
  scaleFactor: number,
): void {
  const totalHeight = stepCount * itemHeight + (stepCount - 1) * gap;
  const startY = node.y + (node.h - totalHeight) / 2;
  const centerX = node.x + node.w / 2;

  steps.forEach((step, index) => {
    const stepX = centerX - itemWidth / 2;
    const stepY = startY + index * (itemHeight + gap);
    const fillColor = step.color?.replace("#", "") ?? defaultColor;
    const textColor = step.textColor?.replace("#", "") ?? defaultTextColor;

    const isFirst = index === 0;
    const points = isFirst
      ? [
          // rect 風: 上辺フラット、下辺が矢印
          { x: 0, y: 0 },
          { x: pxToIn(itemWidth), y: 0 },
          { x: pxToIn(itemWidth), y: pxToIn(itemHeight - arrowDepth) },
          { x: pxToIn(itemWidth / 2), y: pxToIn(itemHeight) },
          { x: 0, y: pxToIn(itemHeight - arrowDepth) },
          { close: true as const },
        ]
      : [
          // pentagon 風: 上辺に切り欠き、下辺が矢印
          { x: pxToIn(itemWidth / 2), y: 0 },
          { x: pxToIn(itemWidth), y: pxToIn(arrowDepth) },
          { x: pxToIn(itemWidth), y: pxToIn(itemHeight - arrowDepth) },
          { x: pxToIn(itemWidth / 2), y: pxToIn(itemHeight) },
          { x: 0, y: pxToIn(itemHeight - arrowDepth) },
          { x: 0, y: pxToIn(arrowDepth) },
          { close: true as const },
        ];

    ctx.slide.addShape("custGeom" as never, {
      x: pxToIn(stepX),
      y: pxToIn(stepY),
      w: pxToIn(itemWidth),
      h: pxToIn(itemHeight),
      points,
      fill: { color: fillColor },
      line: { type: "none" as const },
    });

    // テキストを図形の中央（矢印部分を除いた領域）に配置
    const textOffsetTop = isFirst ? 0 : arrowDepth;
    const textHeight = Math.max(1, itemHeight - arrowDepth - textOffsetTop);

    ctx.slide.addText(step.label, {
      x: pxToIn(stepX),
      y: pxToIn(stepY + textOffsetTop),
      w: pxToIn(itemWidth),
      h: pxToIn(textHeight),
      fontSize: pxToPt((node.fontSize ?? 14) * scaleFactor),
      fontFace: node.fontFamily ?? "Noto Sans JP",
      color: textColor,
      bold: node.bold ?? false,
      italic: node.italic,
      underline: convertUnderline(node.underline),
      strike: convertStrike(node.strike),
      highlight: node.highlight,
      align: "center",
      valign: "middle",
    });
  });
}
