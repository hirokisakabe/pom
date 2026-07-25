import {
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asOoxmlPercent,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type SourceAutoNumScheme,
} from "@pptx-glimpse/document";
import type { RenderContext } from "../types.ts";
import { pxToEmu, pxToPt } from "../units.ts";
import {
  createGlimpseRunProperties,
  type GlimpseTextRunStyle,
} from "../glimpseAdapter.ts";

type TextBoundsPx = { x: number; y: number; w: number; h: number };

type TextBoxVerticalAlign = "top" | "middle" | "bottom";

export type { GlimpseTextRunStyle } from "../glimpseAdapter.ts";

export type GlimpseTextBoxOptions = GlimpseTextRunStyle & {
  text?: string;
  align?: "left" | "center" | "right";
  valign?: TextBoxVerticalAlign;
  lineHeight?: number;
  rotate?: number;
  autoFit?: boolean;
  margin?: number;
  bullet?: ListBulletOptions;
};

export type ListBulletOptions =
  | { kind: "bullet" }
  | {
      kind: "number";
      scheme?: string;
      startAt?: number;
    };

export { createGlimpseRunProperties } from "../glimpseAdapter.ts";

function createGlimpseParagraph(
  text: string,
  style: GlimpseTextRunStyle,
  options: Pick<GlimpseTextBoxOptions, "align" | "lineHeight"> = {},
): AddTextBoxParagraphInput {
  const fontSizePx = style.fontSize ?? 24;
  return {
    properties: {
      align: options.align,
      lineSpacing:
        options.lineHeight !== undefined
          ? asHundredthPt(
              Math.round(pxToPt(fontSizePx * options.lineHeight) * 100),
            )
          : undefined,
    },
    runs: [{ text, properties: createGlimpseRunProperties(style) }],
  };
}

export function createGlimpseParagraphs(
  text: string,
  style: GlimpseTextRunStyle,
  options: Pick<GlimpseTextBoxOptions, "align" | "lineHeight"> = {},
): AddTextBoxParagraphInput[] {
  return text
    .replace(/\r*\n/g, "\n")
    .split("\n")
    .map((line) => createGlimpseParagraph(line, style, options));
}

function textBoxInput(
  bounds: TextBoundsPx,
  options: GlimpseTextBoxOptions,
  paragraphs: readonly AddTextBoxParagraphInput[],
): AddTextBoxInput {
  const margin =
    options.margin !== undefined
      ? asEmu(Math.round(pxToEmu(options.margin)))
      : undefined;
  return {
    offsetX: asEmu(Math.round(pxToEmu(bounds.x))),
    offsetY: asEmu(Math.round(pxToEmu(bounds.y))),
    width: asEmu(Math.max(1, Math.round(pxToEmu(bounds.w)))),
    height: asEmu(Math.max(1, Math.round(pxToEmu(bounds.h)))),
    rotation:
      options.rotate !== undefined
        ? asOoxmlAngle(Math.round(options.rotate * 60000))
        : undefined,
    body: {
      marginLeft: margin,
      marginRight: margin,
      marginTop: margin,
      marginBottom: margin,
      anchor: options.valign,
      autoFit: options.autoFit ? "shape" : undefined,
    },
    paragraphs,
  };
}

function withListProperties(
  paragraphs: readonly AddTextBoxParagraphInput[],
  options: GlimpseTextBoxOptions,
): readonly AddTextBoxParagraphInput[] {
  if (!options.bullet) return paragraphs;
  const bullet =
    options.bullet.kind === "bullet"
      ? {
          type: "character" as const,
          character: "•",
          size: asOoxmlPercent(100000),
        }
      : {
          type: "auto-number" as const,
          scheme: isSupportedAutoNumScheme(options.bullet.scheme)
            ? options.bullet.scheme
            : "arabicPeriod",
          startAt: options.bullet.startAt ?? 1,
          fontFace: "+mj-lt",
          size: asOoxmlPercent(100000),
        };
  return paragraphs.map((paragraph) => ({
    ...paragraph,
    properties: {
      ...paragraph.properties,
      marginLeft: asEmu(342900),
      indent: asEmu(-342900),
      lineSpacing: {
        type: "percent",
        value: asOoxmlPercent(Math.round((options.lineHeight ?? 1.3) * 100000)),
      },
      bullet,
    },
  }));
}

export function addGlimpseTextBox(
  ctx: RenderContext,
  bounds: TextBoundsPx,
  options: GlimpseTextBoxOptions & {
    paragraphs?: readonly AddTextBoxParagraphInput[];
  } = {},
): void {
  const paragraphs = withListProperties(
    options.paragraphs ??
      createGlimpseParagraphs(options.text ?? "", options, {
        align: options.align,
        lineHeight: options.lineHeight,
      }),
    options,
  );
  ctx.authoring.addTextBox(textBoxInput(bounds, options, paragraphs));
}

function isSupportedAutoNumScheme(
  value: string | undefined,
): value is SourceAutoNumScheme {
  return (
    value === "arabicPeriod" ||
    value === "arabicParenR" ||
    value === "romanUcPeriod" ||
    value === "romanLcPeriod" ||
    value === "alphaUcPeriod" ||
    value === "alphaLcPeriod" ||
    value === "alphaLcParenR" ||
    value === "alphaUcParenR" ||
    value === "arabicPlain"
  );
}
