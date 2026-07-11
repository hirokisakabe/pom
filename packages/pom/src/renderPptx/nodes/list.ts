import type { PositionedNode, LiNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { resolveSubSup } from "../textOptions.ts";
import { getContentArea } from "../utils/contentArea.ts";
import {
  addGlimpseTextBox,
  createGlimpseRunProperties,
  listBulletXmlTransform,
  type GlimpseTextRunStyle,
} from "../utils/glimpseTextBox.ts";
import {
  type AddTextBoxParagraphInput,
  type AddTextBoxRunInput,
} from "@pptx-glimpse/document";

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

function paragraphProperties(parent: UlPositionedNode | OlPositionedNode) {
  return {
    align: parent.textAlign ?? "left",
  };
}

function toRunStyle(
  style: ReturnType<typeof resolveStyle>,
): GlimpseTextRunStyle {
  return {
    fontSize: style.fontSize,
    fontFace: style.fontFamily,
    color: style.color,
    bold: style.bold,
    italic: style.italic,
    underline: style.underline,
    strike: style.strike,
    subscript: style.subscript,
    superscript: style.superscript,
    highlight: style.highlight,
  };
}

function buildListParagraphs(
  items: LiNode[],
  parent: UlPositionedNode | OlPositionedNode,
): {
  paragraphs: AddTextBoxParagraphInput[];
  hyperlinks: (string | undefined)[];
} {
  const paragraphs: AddTextBoxParagraphInput[] = [];
  const hyperlinks: (string | undefined)[] = [];
  for (let i = 0; i < items.length; i++) {
    const li = items[i];
    const style = resolveStyle(li, parent);
    const runs: AddTextBoxRunInput[] = [];
    if (li.runs && li.runs.length > 0) {
      for (const run of li.runs) {
        const runSubSup = resolveSubSup(run, style);
        runs.push({
          text: run.text,
          properties: createGlimpseRunProperties({
            fontSize: run.fontSize ?? style.fontSize,
            fontFace: run.fontFamily ?? style.fontFamily,
            color: run.color ?? style.color,
            bold: run.bold ?? style.bold,
            italic: run.italic ?? style.italic,
            underline: run.underline ?? style.underline,
            strike: run.strike ?? style.strike,
            subscript: runSubSup.subscript,
            superscript: runSubSup.superscript,
            highlight: run.highlight ?? style.highlight,
          }),
        });
        hyperlinks.push(run.text ? run.href : undefined);
      }
    } else {
      runs.push({
        text: li.text,
        properties: createGlimpseRunProperties(toRunStyle(style)),
      });
      hyperlinks.push(undefined);
    }
    paragraphs.push({
      properties: paragraphProperties(parent),
      runs,
    });
  }
  return { paragraphs, hyperlinks };
}

export function renderUlNode(node: UlPositionedNode, ctx: RenderContext): void {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const content = getContentArea(node);

  const { paragraphs, hyperlinks } = buildListParagraphs(node.items, node);
  addGlimpseTextBox(ctx, content, {
    fontSize: fontSizePx,
    fontFace: fontFamily,
    align: node.textAlign ?? "left",
    valign: "top",
    margin: 0,
    color: node.color,
    bold: node.bold,
    italic: node.italic,
    underline: node.underline,
    strike: node.strike,
    subscript: node.subscript,
    superscript: node.superscript,
    highlight: node.highlight,
    paragraphs,
    hyperlinks,
    xmlTransform: listBulletXmlTransform({
      kind: "bullet",
      lineHeight: node.lineHeight,
    }),
  });
}

export function renderOlNode(node: OlPositionedNode, ctx: RenderContext): void {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const content = getContentArea(node);

  const { paragraphs, hyperlinks } = buildListParagraphs(node.items, node);
  addGlimpseTextBox(ctx, content, {
    fontSize: fontSizePx,
    fontFace: fontFamily,
    align: node.textAlign ?? "left",
    valign: "top",
    margin: 0,
    color: node.color,
    bold: node.bold,
    italic: node.italic,
    underline: node.underline,
    strike: node.strike,
    subscript: node.subscript,
    superscript: node.superscript,
    highlight: node.highlight,
    paragraphs,
    hyperlinks,
    xmlTransform: listBulletXmlTransform({
      kind: "number",
      scheme: node.numberType,
      startAt: node.numberStartAt,
      lineHeight: node.lineHeight,
    }),
  });
}
