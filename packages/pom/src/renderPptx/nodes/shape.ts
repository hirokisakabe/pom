import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToPt } from "../units.ts";
import { convertUnderline, convertStrike } from "../textOptions.ts";
import { getContentAreaIn } from "../utils/contentArea.ts";
import { convertBorderLine, convertShadow } from "../utils/visualStyle.ts";

type ShapePositionedNode = Extract<PositionedNode, { type: "shape" }>;

export function renderShapeNode(
  node: ShapePositionedNode,
  ctx: RenderContext,
): void {
  const shapeOptions = {
    ...getContentAreaIn(node),
    fill: node.fill
      ? {
          color: node.fill.color,
          transparency: node.fill.transparency,
        }
      : undefined,
    line: node.line ? convertBorderLine(node.line) : undefined,
    shadow: convertShadow(node.shadow),
  };

  if (node.text) {
    // テキストがある場合：addTextでshapeを指定
    ctx.slide.addText(node.text, {
      ...shapeOptions,
      shape: node.shapeType,
      fontSize: pxToPt(node.fontSize ?? 24),
      fontFace: node.fontFamily ?? "Noto Sans JP",
      color: node.color,
      bold: node.bold,
      italic: node.italic,
      underline: convertUnderline(node.underline),
      strike: convertStrike(node.strike),
      highlight: node.highlight,
      align: node.textAlign ?? "center",
      valign: "middle" as const,
      lineSpacingMultiple: node.lineHeight ?? 1.3,
    });
  } else {
    // テキストがない場合：addShapeを使用
    ctx.slide.addShape(node.shapeType, shapeOptions);
  }
}
