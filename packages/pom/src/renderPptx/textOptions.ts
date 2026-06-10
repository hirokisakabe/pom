import type { PositionedNode, Underline, UnderlineStyle } from "../types.ts";
import { pxToIn, pxToPt } from "./units.ts";
import { getContentArea } from "./utils/contentArea.ts";

type TextNode = Extract<PositionedNode, { type: "text" }>;

/**
 * underline プロパティを pptxgenjs 形式に変換する
 */
export function convertUnderline(
  underline: Underline | undefined,
): { style?: UnderlineStyle; color?: string } | undefined {
  if (underline === undefined) return undefined;
  if (underline === false) return undefined;
  if (underline === true) return { style: "sng" };
  return {
    style: underline.style,
    color: underline.color,
  };
}

/**
 * strike プロパティを pptxgenjs 形式に変換する
 */
export function convertStrike(
  strike: boolean | undefined,
): "sngStrike" | undefined {
  if (strike) return "sngStrike";
  return undefined;
}

export function createTextOptions(node: TextNode) {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;
  const content = getContentArea(node);

  return {
    x: pxToIn(content.x),
    y: pxToIn(content.y),
    w: pxToIn(content.w),
    h: pxToIn(content.h),
    fontSize: pxToPt(fontSizePx),
    fontFace: fontFamily,
    align: node.textAlign ?? "left",
    valign: "top" as const,
    margin: 0,
    lineSpacingMultiple: lineHeight,
    color: node.color,
    bold: node.bold,
    italic: node.italic,
    underline: convertUnderline(node.underline),
    strike: convertStrike(node.strike),
    highlight: node.highlight,
    // letterSpacing はユーザー入力 px、pptxgenjs の charSpacing は pt
    charSpacing:
      node.letterSpacing !== undefined ? pxToPt(node.letterSpacing) : undefined,
  };
}
