import {
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asPt,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type AddTextBoxRunPropertiesInput,
  type SourceAutoNumScheme,
} from "@pptx-glimpse/document";
import type { Underline } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToEmu, pxToPt, rectPxToIn } from "../units.ts";
import { toColorInput } from "../glimpseTextBoxes.ts";

type TextBoundsPx = { x: number; y: number; w: number; h: number };

type TextBoxVerticalAlign = "top" | "middle" | "bottom";

export type GlimpseTextRunStyle = {
  fontSize?: number;
  fontFace?: string;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: Underline;
  strike?: boolean;
  subscript?: boolean;
  superscript?: boolean;
  highlight?: string;
};

export type GlimpseTextBoxOptions = GlimpseTextRunStyle & {
  text?: string;
  align?: "left" | "center" | "right";
  valign?: TextBoxVerticalAlign;
  lineHeight?: number;
  rotate?: number;
  autoFit?: boolean;
  margin?: number;
};

export type ListBulletOptions =
  | { kind: "bullet" }
  | {
      kind: "number";
      scheme?: string;
      startAt?: number;
    };

const TRANSPARENT_MARKER_STYLE = {
  fill: { color: "FFFFFF", transparency: 100 },
  line: { color: "FFFFFF", transparency: 100 },
} as const;

function toUnderlineInput(underline: Underline | undefined) {
  if (underline === undefined || underline === false) return undefined;
  if (underline === true) return true;
  return {
    style: underline.style,
    color: toColorInput(underline.color),
  };
}

export function createGlimpseRunProperties(
  style: GlimpseTextRunStyle,
): AddTextBoxRunPropertiesInput {
  return {
    fontFace: style.fontFace ?? "Noto Sans JP",
    fontSize: asPt(pxToPt(style.fontSize ?? 24)),
    color: toColorInput(style.color),
    bold: style.bold,
    italic: style.italic,
    underline: toUnderlineInput(style.underline),
    strike: style.strike,
    baseline: style.subscript
      ? "subscript"
      : style.superscript
        ? "superscript"
        : undefined,
    highlight: toColorInput(style.highlight),
  };
}

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
    },
    paragraphs,
  };
}

function withShapeAutofit(xml: string): string {
  const selfClosing = xml.replace(
    /<a:bodyPr\b([^>]*)\/>/,
    (_match, attrs: string) => `<a:bodyPr${attrs}><a:spAutoFit/></a:bodyPr>`,
  );
  if (selfClosing !== xml) return selfClosing;
  return xml.replace(
    /(<a:bodyPr\b[^>]*>)([\s\S]*?)(<\/a:bodyPr>)/,
    (_match, open: string, body: string, close: string) => {
      if (body.includes("<a:spAutoFit/>")) return `${open}${body}${close}`;
      return `${open}<a:spAutoFit/>${body}${close}`;
    },
  );
}

function composeXmlTransform(
  autoFit: boolean | undefined,
  transform: ((xml: string) => string) | undefined,
) {
  if (!autoFit) return transform;
  return (xml: string) => {
    const fitted = withShapeAutofit(xml);
    return transform ? transform(fitted) : fitted;
  };
}

export function addGlimpseTextBox(
  ctx: RenderContext,
  bounds: TextBoundsPx,
  options: GlimpseTextBoxOptions & {
    paragraphs?: readonly AddTextBoxParagraphInput[];
    hyperlinks?: readonly (string | undefined)[];
    xmlTransform?: (xml: string) => string;
  } = {},
): void {
  const paragraphs =
    options.paragraphs ??
    createGlimpseParagraphs(options.text ?? "", options, {
      align: options.align,
      lineHeight: options.lineHeight,
    });
  const marker = ctx.buildContext.glimpseTextBoxes.registerTextBox(
    textBoxInput(bounds, options, paragraphs),
    {
      hyperlinks: options.hyperlinks,
      xmlTransform: composeXmlTransform(options.autoFit, options.xmlTransform),
    },
  );
  ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
    ...rectPxToIn({
      ...bounds,
      w: Math.max(bounds.w, 1),
      h: Math.max(bounds.h, 1),
    }),
    ...TRANSPARENT_MARKER_STYLE,
    objectName: marker,
  });
}

function bulletXml(options: ListBulletOptions): string {
  if (options.kind === "bullet") {
    return '<a:buSzPct val="100000"/><a:buChar char="&#x2022;"/>';
  }
  return `<a:buSzPct val="100000"/><a:buFont typeface="+mj-lt"/><a:buAutoNum type="arabicPeriod" startAt="${
    options.startAt ?? 1
  }"/>`;
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

export function listBulletXmlTransform(
  options: ListBulletOptions & { lineHeight?: number },
) {
  const lineSpacing = `<a:lnSpc><a:spcPct val="${Math.round(
    (options.lineHeight ?? 1.3) * 100000,
  )}"/></a:lnSpc>`;
  const paragraphBody = `${lineSpacing}${bulletXml(
    options.kind === "number" && !isSupportedAutoNumScheme(options.scheme)
      ? { ...options, scheme: options.scheme ?? "arabicPeriod" }
      : options,
  )}`;
  return (xml: string): string => {
    const expanded = xml.replace(
      /<a:pPr([^>]*)\/>/g,
      (_match, attrs: string) =>
        `<a:pPr${attrs} marL="342900" indent="-342900">${paragraphBody}</a:pPr>`,
    );
    return expanded.replace(
      /<a:pPr([^>]*)>([\s\S]*?)<\/a:pPr>/g,
      (match: string, attrs: string, body: string) => {
        if (!body.includes("<a:buNone/>")) return match;
        return `<a:pPr${attrs} marL="342900" indent="-342900">${body.replace(
          /(?:<a:lnSpc>[\s\S]*?<\/a:lnSpc>)?<a:buNone\/>/,
          paragraphBody,
        )}</a:pPr>`;
      },
    );
  };
}

export function listLineSpacingXmlTransform(options: { lineHeight?: number }) {
  const lineSpacing = `<a:lnSpc><a:spcPct val="${Math.round(
    (options.lineHeight ?? 1.3) * 100000,
  )}"/></a:lnSpc>`;
  const paragraphBody = `${lineSpacing}<a:buNone/>`;
  return (xml: string): string => {
    const expanded = xml.replace(
      /<a:pPr([^>]*)\/>/g,
      (_match, attrs: string) => `<a:pPr${attrs}>${paragraphBody}</a:pPr>`,
    );
    return expanded.replace(
      /<a:pPr([^>]*)>([\s\S]*?)<\/a:pPr>/g,
      (_match: string, attrs: string, body: string) => {
        const nextBody = body
          .replace(/<a:lnSpc>[\s\S]*?<\/a:lnSpc>/, "")
          .replace(/<a:buNone\/>/, "");
        return `<a:pPr${attrs}>${paragraphBody}${nextBody}</a:pPr>`;
      },
    );
  };
}
