import type { PositionedNode } from "../types";
import { pxToIn, pxToPt } from "./units";

type TextNode = Extract<PositionedNode, { type: "text" }>;

export function createTextOptions(node: TextNode) {
  const fontSizePx = node.fontPx ?? 24;
  const fontFamily = "Noto Sans JP";

  return {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    fontSize: pxToPt(fontSizePx),
    fontFace: fontFamily,
    align: node.alignText ?? "left",
    valign: "top" as const,
    margin: 0,
    lineSpacingMultiple: 1.3,
    color: node.color,
  };
}
