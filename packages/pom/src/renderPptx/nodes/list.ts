import type { PositionedNode, LiNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToPt } from "../units.ts";
import {
  convertUnderline,
  convertStrike,
  resolveSubSup,
} from "../textOptions.ts";
import { getContentAreaIn } from "../utils/contentArea.ts";

type UlPositionedNode = Extract<PositionedNode, { type: "ul" }>;
type OlPositionedNode = Extract<PositionedNode, { type: "ol" }>;

function resolveStyle(li: LiNode, parent: UlPositionedNode | OlPositionedNode) {
  const subSup = resolveSubSup(li, parent);
  return {
    fontSize: li.fontSize ?? parent.fontSize ?? 24,
    color: li.color ?? parent.color,
    bold: li.bold ?? parent.bold,
    italic: li.italic ?? parent.italic,
    underline: li.underline ?? parent.underline,
    strike: li.strike ?? parent.strike,
    subscript: subSup.subscript,
    superscript: subSup.superscript,
    highlight: li.highlight ?? parent.highlight,
    fontFamily: li.fontFamily ?? parent.fontFamily ?? "Noto Sans JP",
  };
}

function buildListTextItems(
  items: LiNode[],
  parent: UlPositionedNode | OlPositionedNode,
  bullet: boolean | Record<string, unknown>,
) {
  const textItems: { text: string; options: Record<string, unknown> }[] = [];
  for (let i = 0; i < items.length; i++) {
    const li = items[i];
    const style = resolveStyle(li, parent);
    const isLast = i === items.length - 1;
    const baseOptions = {
      fontSize: pxToPt(style.fontSize),
      fontFace: style.fontFamily,
      color: style.color,
      underline: convertUnderline(style.underline),
      strike: convertStrike(style.strike),
      subscript: style.subscript,
      superscript: style.superscript,
      highlight: style.highlight,
    };

    if (li.runs && li.runs.length > 0) {
      for (let j = 0; j < li.runs.length; j++) {
        const run = li.runs[j];
        const isLastRun = j === li.runs.length - 1;
        let text = run.text;
        if (isLastRun && !isLast) text += "\n";
        const runSubSup = resolveSubSup(run, style);
        textItems.push({
          text,
          options: {
            ...baseOptions,
            fontFace: run.fontFamily ?? style.fontFamily,
            color: run.color ?? style.color,
            bold: run.bold ?? style.bold,
            italic: run.italic ?? style.italic,
            underline: convertUnderline(run.underline ?? style.underline),
            strike: convertStrike(run.strike ?? style.strike),
            subscript: runSubSup.subscript,
            superscript: runSubSup.superscript,
            highlight: run.highlight ?? style.highlight,
            bullet: j === 0 ? bullet : false,
            ...(run.href ? { hyperlink: { url: run.href } } : {}),
          },
        });
      }
    } else {
      textItems.push({
        text: isLast ? li.text : li.text + "\n",
        options: {
          ...baseOptions,
          bold: style.bold,
          italic: style.italic,
          bullet,
        },
      });
    }
  }
  return textItems;
}

function hasItemStyleOverride(items: LiNode[]): boolean {
  return items.some(
    (li) =>
      li.fontSize !== undefined ||
      li.color !== undefined ||
      li.bold !== undefined ||
      li.italic !== undefined ||
      li.underline !== undefined ||
      li.strike !== undefined ||
      li.subscript !== undefined ||
      li.superscript !== undefined ||
      li.highlight !== undefined ||
      li.fontFamily !== undefined ||
      li.runs !== undefined,
  );
}

export function renderUlNode(node: UlPositionedNode, ctx: RenderContext): void {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;
  const contentIn = getContentAreaIn(node);

  if (hasItemStyleOverride(node.items)) {
    // Li に個別スタイルがある場合は配列形式を使用
    const textItems = buildListTextItems(node.items, node, true);

    ctx.slide.addText(textItems, {
      ...contentIn,
      align: node.textAlign ?? "left",
      valign: "top" as const,
      margin: 0,
      lineSpacingMultiple: lineHeight,
    });
  } else {
    // Li にスタイルオーバーライドがない場合は単一文字列形式を使用
    const text = node.items.map((li) => li.text).join("\n");

    ctx.slide.addText(text, {
      ...contentIn,
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
      subscript: node.subscript,
      superscript: node.superscript,
      highlight: node.highlight,
      bullet: true,
    });
  }
}

export function renderOlNode(node: OlPositionedNode, ctx: RenderContext): void {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;
  const contentIn = getContentAreaIn(node);

  const bulletOptions: Record<string, unknown> = { type: "number" };
  if (node.numberType !== undefined) {
    bulletOptions.numberType = node.numberType;
  }
  if (node.numberStartAt !== undefined) {
    bulletOptions.numberStartAt = node.numberStartAt;
  }

  if (hasItemStyleOverride(node.items)) {
    const textItems = buildListTextItems(node.items, node, bulletOptions);

    ctx.slide.addText(textItems, {
      ...contentIn,
      align: node.textAlign ?? "left",
      valign: "top" as const,
      margin: 0,
      lineSpacingMultiple: lineHeight,
    });
  } else {
    const text = node.items.map((li) => li.text).join("\n");

    ctx.slide.addText(text, {
      ...contentIn,
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
      subscript: node.subscript,
      superscript: node.superscript,
      highlight: node.highlight,
      bullet: bulletOptions,
    });
  }
}
