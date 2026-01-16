import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

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
  const itemWidth = node.itemWidth ?? 150;
  const itemHeight = node.itemHeight ?? 60;
  const gap = node.gap ?? -15; // 負の値でシェブロンを重ねる

  if (direction === "horizontal") {
    renderHorizontalProcessArrow(
      node,
      ctx,
      steps,
      stepCount,
      itemWidth,
      itemHeight,
      gap,
      defaultColor,
      defaultTextColor,
    );
  } else {
    renderVerticalProcessArrow(
      node,
      ctx,
      steps,
      stepCount,
      itemWidth,
      itemHeight,
      gap,
      defaultColor,
      defaultTextColor,
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
  defaultColor: string,
  defaultTextColor: string,
): void {
  const totalWidth = stepCount * itemWidth + (stepCount - 1) * gap;
  const startX = node.x + (node.w - totalWidth) / 2;
  const centerY = node.y + node.h / 2;

  steps.forEach((step, index) => {
    const stepX = startX + index * (itemWidth + gap);
    const stepY = centerY - itemHeight / 2;
    const fillColor = step.color?.replace("#", "") ?? defaultColor;
    const textColor = step.textColor?.replace("#", "") ?? defaultTextColor;

    // 最初のステップは homePlate、以降は chevron
    const shapeType =
      index === 0 ? ctx.pptx.ShapeType.homePlate : ctx.pptx.ShapeType.chevron;

    ctx.slide.addText(step.label, {
      x: pxToIn(stepX),
      y: pxToIn(stepY),
      w: pxToIn(itemWidth),
      h: pxToIn(itemHeight),
      shape: shapeType,
      fill: { color: fillColor },
      line: { type: "none" as const },
      fontSize: pxToPt(node.fontPx ?? 14),
      fontFace: "Noto Sans JP",
      color: textColor,
      bold: node.bold ?? false,
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
  defaultColor: string,
  defaultTextColor: string,
): void {
  const totalHeight = stepCount * itemHeight + (stepCount - 1) * gap;
  const startY = node.y + (node.h - totalHeight) / 2;
  const centerX = node.x + node.w / 2;

  steps.forEach((step, index) => {
    const stepX = centerX - itemWidth / 2;
    const stepY = startY + index * (itemHeight + gap);
    const fillColor = step.color?.replace("#", "") ?? defaultColor;
    const textColor = step.textColor?.replace("#", "") ?? defaultTextColor;

    // 垂直方向では pentagon を使用（下向き矢印風）
    const shapeType =
      index === 0 ? ctx.pptx.ShapeType.rect : ctx.pptx.ShapeType.pentagon;

    ctx.slide.addText(step.label, {
      x: pxToIn(stepX),
      y: pxToIn(stepY),
      w: pxToIn(itemWidth),
      h: pxToIn(itemHeight),
      shape: shapeType,
      fill: { color: fillColor },
      line: { type: "none" as const },
      fontSize: pxToPt(node.fontPx ?? 14),
      fontFace: "Noto Sans JP",
      color: textColor,
      bold: node.bold ?? false,
      align: "center",
      valign: "middle",
    });
  });
}
