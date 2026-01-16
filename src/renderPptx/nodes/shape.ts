import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

type ShapePositionedNode = Extract<PositionedNode, { type: "shape" }>;

export function renderShapeNode(
  node: ShapePositionedNode,
  ctx: RenderContext,
): void {
  const shapeOptions = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    fill: node.fill
      ? {
          color: node.fill.color,
          transparency: node.fill.transparency,
        }
      : undefined,
    line: node.line
      ? {
          color: node.line.color,
          width:
            node.line.width !== undefined ? pxToPt(node.line.width) : undefined,
          dashType: node.line.dashType,
        }
      : undefined,
    shadow: node.shadow
      ? {
          type: node.shadow.type,
          opacity: node.shadow.opacity,
          blur: node.shadow.blur,
          angle: node.shadow.angle,
          offset: node.shadow.offset,
          color: node.shadow.color,
        }
      : undefined,
  };

  if (node.text) {
    // テキストがある場合：addTextでshapeを指定
    ctx.slide.addText(node.text, {
      ...shapeOptions,
      shape: node.shapeType,
      fontSize: pxToPt(node.fontPx ?? 24),
      fontFace: "Noto Sans JP",
      color: node.color,
      align: node.alignText ?? "center",
      valign: "middle" as const,
      lineSpacingMultiple: 1.3,
    });
  } else {
    // テキストがない場合：addShapeを使用
    ctx.slide.addShape(node.shapeType, shapeOptions);
  }
}
