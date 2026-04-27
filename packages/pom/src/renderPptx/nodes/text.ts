import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import {
  createTextOptions,
  convertUnderline,
  convertStrike,
} from "../textOptions.ts";
import { pxToPt } from "../units.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const textOptions = createTextOptions(node);

  if (node.runs && node.runs.length > 0) {
    const fontSizePx = node.fontSize ?? 24;
    const fontFamily = node.fontFamily ?? "Noto Sans JP";
    const textItems = node.runs.map((run) => ({
      text: run.text,
      options: {
        fontSize: pxToPt(fontSizePx),
        fontFace: run.fontFamily ?? fontFamily,
        color: run.color ?? node.color,
        bold: run.bold ?? node.bold,
        italic: run.italic ?? node.italic,
        underline: convertUnderline(run.underline ?? node.underline),
        strike: convertStrike(run.strike ?? node.strike),
        highlight: run.highlight ?? node.highlight,
        ...(run.href ? { hyperlink: { url: run.href } } : {}),
      },
    }));
    ctx.slide.addText(textItems, {
      x: textOptions.x,
      y: textOptions.y,
      w: textOptions.w,
      h: textOptions.h,
      align: textOptions.align,
      valign: textOptions.valign,
      margin: textOptions.margin,
      lineSpacingMultiple: textOptions.lineSpacingMultiple,
    });
  } else {
    ctx.slide.addText(node.text ?? "", textOptions);
  }
}
