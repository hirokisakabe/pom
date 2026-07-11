import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { stripHash } from "../utils/visualStyle.ts";
import { measureTimeline } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { resolveScaledContentArea } from "../utils/scaleToFit.ts";
import { withContentBounds } from "../utils/contentArea.ts";
import { parseGradient } from "../../shared/gradient.ts";
import { addStraightLine } from "../utils/straightLine.ts";
import {
  addGlimpseShape,
  createShapeBoundsInput,
  noShapeOutline,
  solidShapeFill,
} from "../utils/glimpseShape.ts";
import { addGlimpseTextBox } from "../utils/glimpseTextBox.ts";

type TimelinePositionedNode = Extract<PositionedNode, { type: "timeline" }>;

type TimelineTextColors = {
  date: string;
  title: string;
  description: string;
};

type TimelineRenderOptions = {
  defaultColor: string;
  nodeRadius: number;
  lineWidth: number;
  scaleFactor: number;
  textColors: TimelineTextColors;
  connectorLineColor: string;
  connectorGradient?: string;
  connectorGradientOpacity?: number;
  fontFace: string;
  useColorForDate: boolean;
};

export function renderTimelineNode(
  node: TimelinePositionedNode,
  ctx: RenderContext,
): void {
  const direction = node.direction ?? "horizontal";
  const items = node.items;
  const itemCount = items.length;

  if (itemCount === 0) return;

  const defaultColor = "1D4ED8"; // blue
  const baseNodeRadius = 12; // px
  const baseLineWidth = 4; // px

  const textColors: TimelineTextColors = {
    date: stripHash(node.dateColor) ?? "64748B",
    title: stripHash(node.titleColor) ?? "1E293B",
    description: stripHash(node.descriptionColor) ?? "64748B",
  };

  const connectorGradientFallback = node.connectorGradient
    ? parseGradient(node.connectorGradient)?.value.stops[0]?.color
    : undefined;
  const connectorLineColor =
    stripHash(connectorGradientFallback) ??
    stripHash(node.connectorColor) ??
    "E2E8F0";

  const fontFace = node.fontFamily ?? "Noto Sans JP";
  const useColorForDate = node.useColorForDate ?? false;

  // スケール係数を計算（コンテンツ領域基準）
  const { content, scaleFactor } = resolveScaledContentArea(
    node,
    measureTimeline(node),
    ctx,
  );

  const nodeRadius = baseNodeRadius * scaleFactor;
  const lineWidth = baseLineWidth * scaleFactor;

  // コンテンツ領域を使用するための仮想ノードを作成
  const contentNode = withContentBounds(node, content);

  const options: TimelineRenderOptions = {
    defaultColor,
    nodeRadius,
    lineWidth,
    scaleFactor,
    textColors,
    connectorLineColor,
    connectorGradient: node.connectorGradient,
    connectorGradientOpacity: node.opacity,
    fontFace,
    useColorForDate,
  };

  if (direction === "horizontal") {
    renderHorizontalTimeline(contentNode, ctx, items, options);
  } else {
    renderVerticalTimeline(contentNode, ctx, items, options);
  }
}

function resolveItemDateColor(
  item: TimelinePositionedNode["items"][number],
  options: TimelineRenderOptions,
): string {
  // 優先順位: item.dateColor > (useColorForDate && item.color) > Timeline.dateColor
  const perItemDateColor = stripHash(item.dateColor);
  if (perItemDateColor) return perItemDateColor;
  if (options.useColorForDate && item.color) {
    const inherited = stripHash(item.color);
    if (inherited) return inherited;
  }
  return options.textColors.date;
}

function renderHorizontalTimeline(
  node: TimelinePositionedNode,
  ctx: RenderContext,
  items: TimelinePositionedNode["items"],
  options: TimelineRenderOptions,
): void {
  const {
    defaultColor,
    nodeRadius,
    lineWidth,
    scaleFactor,
    textColors,
    connectorLineColor,
    fontFace,
  } = options;
  const itemCount = items.length;
  const lineY = node.y + node.h / 2;
  const labelW = 120 * scaleFactor;
  // 極端に狭い node.w でも startX <= endX を保つため、インセットを node.w/2 で頭打ちする
  const inset = Math.min(labelW / 2, node.w / 2);
  const startX = node.x + inset;
  const endX = node.x + node.w - inset;
  const lineLength = endX - startX;

  // メインの線を描画
  addStraightLine(
    ctx,
    { x1: startX, y1: lineY, x2: startX + lineLength, y2: lineY },
    {
      color: connectorLineColor,
      lineWidth,
      lineGradient: options.connectorGradient,
      lineGradientOpacity: options.connectorGradientOpacity,
    },
  );
  const dateLabelH = 24 * scaleFactor;
  const titleLabelH = 24 * scaleFactor;
  const descLabelH = 32 * scaleFactor;
  const dateOffset = 40 * scaleFactor;
  const titleGap = 8 * scaleFactor;
  const descOffset = 32 * scaleFactor;

  // 各アイテムを描画
  items.forEach((item, index) => {
    const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
    const cx = startX + lineLength * progress;
    const cy = lineY;
    const color = item.color ?? defaultColor;
    const dateColor = resolveItemDateColor(item, options);

    // ノード（円）を描画
    addGlimpseShape(
      ctx,
      {
        preset: "ellipse",
        ...createShapeBoundsInput({
          x: cx - nodeRadius,
          y: cy - nodeRadius,
          w: nodeRadius * 2,
          h: nodeRadius * 2,
        }),
        fill: solidShapeFill(color),
        outline: noShapeOutline(),
      },
      {
        x: cx - nodeRadius,
        y: cy - nodeRadius,
        w: nodeRadius * 2,
        h: nodeRadius * 2,
      },
      { fillColor: color },
    );

    // 日付を上に表示
    addGlimpseTextBox(
      ctx,
      {
        x: cx - labelW / 2,
        y: cy - nodeRadius - dateOffset,
        w: labelW,
        h: dateLabelH,
      },
      {
        text: item.date,
        fontSize: 12 * scaleFactor,
        fontFace,
        color: dateColor,
        align: "center",
        valign: "bottom",
      },
    );

    // タイトルを下に表示
    addGlimpseTextBox(
      ctx,
      {
        x: cx - labelW / 2,
        y: cy + nodeRadius + titleGap,
        w: labelW,
        h: titleLabelH,
      },
      {
        text: item.title,
        fontSize: 14 * scaleFactor,
        fontFace,
        color: textColors.title,
        bold: true,
        align: "center",
        valign: "top",
      },
    );

    // 説明を表示
    if (item.description) {
      addGlimpseTextBox(
        ctx,
        {
          x: cx - labelW / 2,
          y: cy + nodeRadius + descOffset,
          w: labelW,
          h: descLabelH,
        },
        {
          text: item.description,
          fontSize: 11 * scaleFactor,
          fontFace,
          color: textColors.description,
          align: "center",
          valign: "top",
        },
      );
    }
  });
}

function renderVerticalTimeline(
  node: TimelinePositionedNode,
  ctx: RenderContext,
  items: TimelinePositionedNode["items"],
  options: TimelineRenderOptions,
): void {
  const {
    defaultColor,
    nodeRadius,
    lineWidth,
    scaleFactor,
    textColors,
    connectorLineColor,
    fontFace,
  } = options;
  const itemCount = items.length;
  const lineX = node.x + 40 * scaleFactor;
  const startY = node.y + nodeRadius;
  const endY = node.y + node.h - nodeRadius;
  const lineLength = endY - startY;

  // メインの線を描画
  addStraightLine(
    ctx,
    { x1: lineX, y1: startY, x2: lineX, y2: startY + lineLength },
    {
      color: connectorLineColor,
      lineWidth,
      lineGradient: options.connectorGradient,
      lineGradientOpacity: options.connectorGradientOpacity,
    },
  );

  const labelGap = 16 * scaleFactor;
  const dateLabelW = 100 * scaleFactor;
  const dateLabelH = 20 * scaleFactor;
  const titleLabelH = 24 * scaleFactor;
  const descLabelH = 32 * scaleFactor;
  const titleLabelW = node.w - 80 * scaleFactor;
  const descLabelW = node.w - 80 * scaleFactor;

  // 各アイテムを描画
  items.forEach((item, index) => {
    const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
    const cx = lineX;
    const cy = startY + lineLength * progress;
    const color = item.color ?? defaultColor;
    const dateColor = resolveItemDateColor(item, options);

    // ノード（円）を描画
    addGlimpseShape(
      ctx,
      {
        preset: "ellipse",
        ...createShapeBoundsInput({
          x: cx - nodeRadius,
          y: cy - nodeRadius,
          w: nodeRadius * 2,
          h: nodeRadius * 2,
        }),
        fill: solidShapeFill(color),
        outline: noShapeOutline(),
      },
      {
        x: cx - nodeRadius,
        y: cy - nodeRadius,
        w: nodeRadius * 2,
        h: nodeRadius * 2,
      },
      { fillColor: color },
    );

    // 日付を左上に表示
    addGlimpseTextBox(
      ctx,
      {
        x: cx + nodeRadius + labelGap,
        y: cy - nodeRadius - 4 * scaleFactor,
        w: dateLabelW,
        h: dateLabelH,
      },
      {
        text: item.date,
        fontSize: 12 * scaleFactor,
        fontFace,
        color: dateColor,
        align: "left",
        valign: "bottom",
      },
    );

    // タイトルを右に表示
    addGlimpseTextBox(
      ctx,
      {
        x: cx + nodeRadius + labelGap,
        y: cy - 4 * scaleFactor,
        w: titleLabelW,
        h: titleLabelH,
      },
      {
        text: item.title,
        fontSize: 14 * scaleFactor,
        fontFace,
        color: textColors.title,
        bold: true,
        align: "left",
        valign: "top",
      },
    );

    // 説明を表示
    if (item.description) {
      addGlimpseTextBox(
        ctx,
        {
          x: cx + nodeRadius + labelGap,
          y: cy + 20 * scaleFactor,
          w: descLabelW,
          h: descLabelH,
        },
        {
          text: item.description,
          fontSize: 11 * scaleFactor,
          fontFace,
          color: textColors.description,
          align: "left",
          valign: "top",
        },
      );
    }
  });
}
