import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn, pxToPt } from "../units.ts";

type TimelinePositionedNode = Extract<PositionedNode, { type: "timeline" }>;

export function renderTimelineNode(
  node: TimelinePositionedNode,
  ctx: RenderContext,
): void {
  const direction = node.direction ?? "horizontal";
  const items = node.items;
  const itemCount = items.length;

  if (itemCount === 0) return;

  const defaultColor = "1D4ED8"; // blue
  const nodeRadius = 12; // px
  const lineWidth = 4; // px

  if (direction === "horizontal") {
    renderHorizontalTimeline(
      node,
      ctx,
      items,
      defaultColor,
      nodeRadius,
      lineWidth,
    );
  } else {
    renderVerticalTimeline(
      node,
      ctx,
      items,
      defaultColor,
      nodeRadius,
      lineWidth,
    );
  }
}

function renderHorizontalTimeline(
  node: TimelinePositionedNode,
  ctx: RenderContext,
  items: TimelinePositionedNode["items"],
  defaultColor: string,
  nodeRadius: number,
  lineWidth: number,
): void {
  const itemCount = items.length;
  const lineY = node.y + node.h / 2;
  const startX = node.x + nodeRadius;
  const endX = node.x + node.w - nodeRadius;
  const lineLength = endX - startX;

  // メインの線を描画
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(startX),
    y: pxToIn(lineY),
    w: pxToIn(lineLength),
    h: 0,
    line: { color: "E2E8F0", width: pxToPt(lineWidth) },
  });

  // 各アイテムを描画
  items.forEach((item, index) => {
    const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
    const cx = startX + lineLength * progress;
    const cy = lineY;
    const color = item.color ?? defaultColor;

    // ノード（円）を描画
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
      x: pxToIn(cx - nodeRadius),
      y: pxToIn(cy - nodeRadius),
      w: pxToIn(nodeRadius * 2),
      h: pxToIn(nodeRadius * 2),
      fill: { color },
      line: { type: "none" as const },
    });

    // 日付を上に表示
    ctx.slide.addText(item.date, {
      x: pxToIn(cx - 60),
      y: pxToIn(cy - nodeRadius - 40),
      w: pxToIn(120),
      h: pxToIn(24),
      fontSize: pxToPt(12),
      fontFace: "Noto Sans JP",
      color: "64748B",
      align: "center",
      valign: "bottom",
    });

    // タイトルを下に表示
    ctx.slide.addText(item.title, {
      x: pxToIn(cx - 60),
      y: pxToIn(cy + nodeRadius + 8),
      w: pxToIn(120),
      h: pxToIn(24),
      fontSize: pxToPt(14),
      fontFace: "Noto Sans JP",
      color: "1E293B",
      bold: true,
      align: "center",
      valign: "top",
    });

    // 説明を表示
    if (item.description) {
      ctx.slide.addText(item.description, {
        x: pxToIn(cx - 60),
        y: pxToIn(cy + nodeRadius + 32),
        w: pxToIn(120),
        h: pxToIn(32),
        fontSize: pxToPt(11),
        fontFace: "Noto Sans JP",
        color: "64748B",
        align: "center",
        valign: "top",
      });
    }
  });
}

function renderVerticalTimeline(
  node: TimelinePositionedNode,
  ctx: RenderContext,
  items: TimelinePositionedNode["items"],
  defaultColor: string,
  nodeRadius: number,
  lineWidth: number,
): void {
  const itemCount = items.length;
  const lineX = node.x + 40;
  const startY = node.y + nodeRadius;
  const endY = node.y + node.h - nodeRadius;
  const lineLength = endY - startY;

  // メインの線を描画
  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(lineX),
    y: pxToIn(startY),
    w: 0,
    h: pxToIn(lineLength),
    line: { color: "E2E8F0", width: pxToPt(lineWidth) },
  });

  // 各アイテムを描画
  items.forEach((item, index) => {
    const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
    const cx = lineX;
    const cy = startY + lineLength * progress;
    const color = item.color ?? defaultColor;

    // ノード（円）を描画
    ctx.slide.addShape(ctx.pptx.ShapeType.ellipse, {
      x: pxToIn(cx - nodeRadius),
      y: pxToIn(cy - nodeRadius),
      w: pxToIn(nodeRadius * 2),
      h: pxToIn(nodeRadius * 2),
      fill: { color },
      line: { type: "none" as const },
    });

    // 日付を左上に表示
    ctx.slide.addText(item.date, {
      x: pxToIn(cx + nodeRadius + 16),
      y: pxToIn(cy - nodeRadius - 4),
      w: pxToIn(100),
      h: pxToIn(20),
      fontSize: pxToPt(12),
      fontFace: "Noto Sans JP",
      color: "64748B",
      align: "left",
      valign: "bottom",
    });

    // タイトルを右に表示
    ctx.slide.addText(item.title, {
      x: pxToIn(cx + nodeRadius + 16),
      y: pxToIn(cy - 4),
      w: pxToIn(node.w - 80),
      h: pxToIn(24),
      fontSize: pxToPt(14),
      fontFace: "Noto Sans JP",
      color: "1E293B",
      bold: true,
      align: "left",
      valign: "top",
    });

    // 説明を表示
    if (item.description) {
      ctx.slide.addText(item.description, {
        x: pxToIn(cx + nodeRadius + 16),
        y: pxToIn(cy + 20),
        w: pxToIn(node.w - 80),
        h: pxToIn(32),
        fontSize: pxToPt(11),
        fontFace: "Noto Sans JP",
        color: "64748B",
        align: "left",
        valign: "top",
      });
    }
  });
}
