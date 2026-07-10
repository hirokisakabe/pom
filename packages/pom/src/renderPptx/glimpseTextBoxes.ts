/**
 * Text primitive の @pptx-glimpse/document writer への段階的 swap。
 *
 * 混在期間の合成方式は「pptxgenjs 出力 zip をベースに、swap 済み Text
 * primitive の shape XML だけを glimpse writer で生成して該当 marker shape と
 * 差し替える」方式を採用する。pptxgenjs 側にはまだ Shape / Image / Table /
 * Chart など未 swap primitive と slide master 生成が残っているため、既存 zip を
 * ベースにすると [Content_Types].xml / rels / media parts の管理を現行実装へ
 * 寄せられる。代替案として glimpse の package をベースに未 swap primitive を
 * pptxgenjs から取り込む方式も検討したが、初回スライス時点では pptxgenjs 側の
 * 非 text primitive と master 出力を XML part 単位で切り出す責務が増え、以降の
 * primitive swap より先に package 合成の複雑さが大きくなるため採用しない。
 *
 * marker shape は描画順を保持するためだけに pptxgenjs へ追加し、write 時に
 * glimpse の `<p:sp>` で丸ごと置換する。Text content 自体は pptxgenjs `addText`
 * を経由しない。
 */
import {
  addPicture,
  addShape,
  addTextBox,
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asOoxmlPercent,
  asPt,
  createPptx,
  type AddTextBoxGradientFillInput,
  type AddShapeInput,
  type AddPictureInput,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type AddTextBoxRunPropertiesInput,
  type MediaPart,
  type PartPath,
  type PptxSourceModel,
  type PptxSourceModelAddPictureEdit,
  type PptxSourceModelAddShapeEdit,
  type PptxSourceModelAddTextBoxEdit,
  readPptx,
} from "@pptx-glimpse/document";
import type {
  BorderStyle,
  PositionedNode,
  ShadowStyle,
  TextGlow,
  TextOutline,
  Underline,
} from "../types.ts";
import { parseGradient, parseLinearGradient } from "../shared/gradient.ts";
import { EMU_PER_IN, pxToEmu, pxToPt } from "./units.ts";
import { createTextOptions, resolveSubSup } from "./textOptions.ts";

type PptxGenJSInstance = import("pptxgenjs").default;
type StreamProps = NonNullable<Parameters<PptxGenJSInstance["stream"]>[0]>;
type WriteProps = NonNullable<Parameters<PptxGenJSInstance["write"]>[0]>;
type WriteFileProps = NonNullable<
  Parameters<PptxGenJSInstance["writeFile"]>[0]
>;
type BrowserWritablePptx = PptxGenJSInstance & {
  writeFileToBrowser?: (fileName: string, blobContent: Blob) => Promise<string>;
};
type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

type XmlTransform = (xml: string) => string;

const MARKER_PREFIX = "pom-text:";
const SHAPE_MARKER_PREFIX = "pom-shape:";
const PICTURE_MARKER_PREFIX = "pom-picture:";
const SLIDE_BACKGROUND_MARKER_BASE = 0x0f7a3d;
const HYPERLINK_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink";
const IMAGE_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image";

interface GlimpseTextRun {
  text: string;
  properties: AddTextBoxRunPropertiesInput;
  href?: string;
}

async function loadJSZip(): Promise<typeof import("jszip")> {
  const mod = await import("jszip");
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  return (mod as any).default ?? mod;
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
}

export function cleanHex(color: string | undefined): string | undefined {
  return color?.replace(/^#/, "").toUpperCase();
}

export function toColorInput(color: string | undefined) {
  const hex = cleanHex(color);
  return hex ? { kind: "srgb" as const, hex } : undefined;
}

function toUnderlineInput(underline: Underline | undefined) {
  if (underline === undefined || underline === false) return undefined;
  if (underline === true) return true;
  return {
    style: underline.style,
    color: toColorInput(underline.color),
  };
}

function toBaselineInput(
  subscript: boolean | undefined,
  superscript: boolean | undefined,
) {
  if (subscript) return "subscript" as const;
  if (superscript) return "superscript" as const;
  return undefined;
}

function toGlowInput(glow: TextGlow | undefined) {
  if (!glow) return undefined;
  return {
    radius: asEmu(Math.round(pxToEmu(glow.size ?? 8))),
    color: toColorInput(glow.color ?? "FFFFFF")!,
  };
}

function toOutlineInput(outline: TextOutline | undefined) {
  if (!outline) return undefined;
  return {
    width: asEmu(Math.round(pxToEmu(outline.size ?? 1))),
    color: toColorInput(outline.color ?? "FFFFFF"),
  };
}

function toCharSpacing(letterSpacingPx: number | undefined) {
  if (letterSpacingPx === undefined) return undefined;
  return Math.round(pxToPt(letterSpacingPx) * 100);
}

function toTextGradientInput(
  value: string | undefined,
): AddTextBoxGradientFillInput | undefined {
  if (!value) return undefined;
  const linear = parseLinearGradient(value);
  if (!linear) return undefined;
  const dmlAngle = (((linear.angle - 90) % 360) + 360) % 360;
  return {
    angle: asOoxmlAngle(Math.round(dmlAngle * 60000)),
    stops: linear.stops.map((stop) => ({
      position: asOoxmlPercent(Math.round(stop.position * 1000)),
      color: toColorInput(stop.color)!,
    })),
  };
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined),
  ) as T;
}

function buildRunProperties(
  node: TextPositionedNode,
  run: NonNullable<TextPositionedNode["runs"]>[number] | undefined,
  gradientFill: AddTextBoxGradientFillInput | undefined,
): AddTextBoxRunPropertiesInput {
  const fontSizePx = run?.fontSize ?? node.fontSize ?? 24;
  const letterSpacingPx = run?.letterSpacing ?? node.letterSpacing;
  const subSup = run ? resolveSubSup(run, node) : node;
  const color = gradientFill
    ? undefined
    : toColorInput(run?.color ?? node.color);

  return stripUndefined({
    fontFace: run?.fontFamily ?? node.fontFamily ?? "Noto Sans JP",
    fontSize: asPt(pxToPt(fontSizePx)),
    color,
    gradientFill,
    bold: run?.bold ?? node.bold,
    italic: run?.italic ?? node.italic,
    underline: toUnderlineInput(resolveUnderline(node, run)),
    strike: run?.strike ?? node.strike,
    baseline: toBaselineInput(subSup.subscript, subSup.superscript),
    highlight: toColorInput(run?.highlight ?? node.highlight),
    glow: toGlowInput(node.glow),
    outline: toOutlineInput(node.outline),
    charSpacing: toCharSpacing(letterSpacingPx),
  });
}

function resolveUnderline(
  node: TextPositionedNode,
  run: NonNullable<TextPositionedNode["runs"]>[number] | undefined,
): Underline | undefined {
  if (run?.underline !== undefined) return run.underline;
  if (node.underline !== undefined) return node.underline;
  return run?.href ? true : undefined;
}

function createParagraphProperties(
  node: TextPositionedNode,
): AddTextBoxParagraphInput["properties"] {
  const lineHeight = node.lineHeight ?? 1.3;
  const fontSizePx = node.fontSize ?? 24;
  return stripUndefined({
    align: node.textAlign,
    lineSpacing: asHundredthPt(
      Math.round(pxToPt(fontSizePx * lineHeight) * 100),
    ),
  });
}

function buildParagraphs(node: TextPositionedNode): {
  paragraphs: readonly AddTextBoxParagraphInput[];
  hyperlinks: readonly (string | undefined)[];
} {
  const gradientFill = toTextGradientInput(node.textGradient);
  const sourceRuns: GlimpseTextRun[] =
    node.runs && node.runs.length > 0
      ? node.runs.map((run) => ({
          text: run.text,
          properties: buildRunProperties(node, run, gradientFill),
          href: run.href,
        }))
      : [
          {
            text: node.text ?? "",
            properties: buildRunProperties(node, undefined, gradientFill),
          },
        ];
  const paragraphRuns: GlimpseTextRun[][] = [[]];
  for (const run of sourceRuns) {
    const lines = run.text.replace(/\r*\n/g, "\n").split("\n");
    lines.forEach((line, index) => {
      if (index > 0) {
        paragraphRuns.push([]);
      }
      paragraphRuns[paragraphRuns.length - 1]?.push({
        ...run,
        text: line,
      });
    });
  }

  return {
    paragraphs: paragraphRuns.map((runs) => ({
      properties: createParagraphProperties(node),
      runs,
    })),
    hyperlinks: paragraphRuns.flatMap((runs) =>
      runs.map((run) => (run.text ? run.href : undefined)),
    ),
  };
}

function withGlowAlpha(xml: string, node: TextPositionedNode): string {
  const glow = node.glow;
  if (!glow) return xml;
  const alpha = Math.round((glow.opacity ?? 0.75) * 100000);
  const color = cleanHex(glow.color ?? "FFFFFF");
  const target = `<a:glow rad="${Math.round(pxToEmu(glow.size ?? 8))}"><a:srgbClr val="${color}"/></a:glow>`;
  const replacement = `<a:glow rad="${Math.round(pxToEmu(glow.size ?? 8))}"><a:srgbClr val="${color}"><a:alpha val="${alpha}"/></a:srgbClr></a:glow>`;
  return xml.replaceAll(target, replacement);
}

function withShapeGlowAlpha(xml: string, glow: TextGlow | undefined): string {
  if (!glow) return xml;
  const alpha = Math.round((glow.opacity ?? 0.75) * 100000);
  const color = cleanHex(glow.color ?? "FFFFFF");
  const target = `<a:glow rad="${Math.round(pxToEmu(glow.size ?? 8))}"><a:srgbClr val="${color}"/></a:glow>`;
  const replacement = `<a:glow rad="${Math.round(pxToEmu(glow.size ?? 8))}"><a:srgbClr val="${color}"><a:alpha val="${alpha}"/></a:srgbClr></a:glow>`;
  return xml.replaceAll(target, replacement);
}

function colorWithOptionalAlphaXml(
  color: string,
  opacity: number | undefined,
): string {
  const clean = cleanHex(color) ?? color;
  if (opacity === undefined) return `<a:srgbClr val="${clean}"/>`;
  return `<a:srgbClr val="${clean}"><a:alpha val="${Math.round(opacity * 100000)}"/></a:srgbClr>`;
}

function buildGradFillXml(value: string, opacity?: number): string | undefined {
  const gradient = parseGradient(value);
  if (!gradient) return undefined;
  const gsXml = gradient.value.stops
    .map(
      (stop) =>
        `<a:gs pos="${Math.round(stop.position * 1000)}">${colorWithOptionalAlphaXml(
          stop.color,
          opacity,
        )}</a:gs>`,
    )
    .join("");

  if (gradient.kind === "linear") {
    const dmlAngle = (((gradient.value.angle - 90) % 360) + 360) % 360;
    const ang = Math.round(dmlAngle * 60000);
    return `<a:gradFill flip="none" rotWithShape="1"><a:gsLst>${gsXml}</a:gsLst><a:lin ang="${ang}" scaled="0"/></a:gradFill>`;
  }

  const { centerX, centerY } = gradient.value;
  const l = Math.round(centerX * 1000);
  const t = Math.round(centerY * 1000);
  const r = Math.round((100 - centerX) * 1000);
  const b = Math.round((100 - centerY) * 1000);
  return `<a:gradFill flip="none" rotWithShape="1"><a:gsLst>${gsXml}</a:gsLst><a:path path="circle"><a:fillToRect l="${l}" t="${t}" r="${r}" b="${b}"/></a:path></a:gradFill>`;
}

function withSolidFillAlpha(
  xml: string,
  color: string | undefined,
  opacity: number | undefined,
): string {
  if (color === undefined || opacity === undefined) return xml;
  const clean = cleanHex(color);
  return xml.replaceAll(
    `<a:solidFill><a:srgbClr val="${clean}"/></a:solidFill>`,
    `<a:solidFill>${colorWithOptionalAlphaXml(clean ?? color, opacity)}</a:solidFill>`,
  );
}

function withGradientFill(
  xml: string,
  backgroundGradient: string | undefined,
  opacity: number | undefined,
  preset: string,
): string {
  if (!backgroundGradient) return xml;
  const gradFill = buildGradFillXml(backgroundGradient, opacity);
  if (!gradFill) return xml;
  if (preset === "line") {
    return xml.replace(
      /<a:ln\b([^>]*)>([\s\S]*?)<\/a:ln>/,
      (match, attrs, body) => {
        const nextBody = (body as string).replace(
          /<a:(?:solidFill|gradFill)\b[\s\S]*?<\/a:(?:solidFill|gradFill)>|<a:noFill\/>/,
          gradFill,
        );
        return nextBody === body
          ? match
          : `<a:ln${attrs as string}>${nextBody}</a:ln>`;
      },
    );
  }
  return xml.replace(
    /<a:(?:solidFill|gradFill)\b[\s\S]*?<\/a:(?:solidFill|gradFill)>|<a:noFill\/>/,
    gradFill,
  );
}

function withRoundRectAdjust(
  xml: string,
  input: AddShapeInput,
  rectRadius: number | undefined,
): string {
  if (input.preset !== "roundRect" || rectRadius === undefined) return xml;
  // `rectRadius` is the pptxgenjs-compatible option value already resolved by
  // visualStyle.resolveRectRadius. Keep the same formula pptxgenjs uses.
  const adj = Math.round(
    (rectRadius * EMU_PER_IN * 100000) / Math.min(input.width, input.height),
  );
  return xml.replace(
    /<a:prstGeom prst="roundRect"><a:avLst\/><\/a:prstGeom>/,
    `<a:prstGeom prst="roundRect"><a:avLst><a:gd name="adj" fmla="val ${adj}"/></a:avLst></a:prstGeom>`,
  );
}

function shadowXml(shadow: ShadowStyle | undefined): string | undefined {
  if (!shadow) return undefined;
  const blur = Math.round((shadow.blur ?? 3) * 12700);
  const dist = Math.round((shadow.offset ?? 23000 / 12700) * 12700);
  const dir = Math.round((shadow.angle ?? 90) * 60000);
  const color = cleanHex(shadow.color ?? "000000") ?? "000000";
  const alpha = Math.round((shadow.opacity ?? 0.35) * 100000);
  const type = shadow.type ?? "outer";
  return `<a:${type}Shdw sx="100000" sy="100000" kx="0" ky="0" algn="bl" blurRad="${blur}" rotWithShape="1" dist="${dist}" dir="${dir}"><a:srgbClr val="${color}"><a:alpha val="${alpha}"/></a:srgbClr></a:${type}Shdw>`;
}

function withShadow(xml: string, shadow: ShadowStyle | undefined): string {
  const effect = shadowXml(shadow);
  if (!effect) return xml;
  if (xml.includes("<a:effectLst>")) {
    return xml.replace("</a:effectLst>", `${effect}</a:effectLst>`);
  }
  return xml.replace(
    "</p:spPr>",
    `<a:effectLst>${effect}</a:effectLst></p:spPr>`,
  );
}

function withLineFlip(
  xml: string,
  flipH: boolean | undefined,
  flipV: boolean | undefined,
): string {
  if (!flipH && !flipV) return xml;
  return xml.replace(
    "<a:xfrm",
    `<a:xfrm${flipH ? ' flipH="1"' : ""}${flipV ? ' flipV="1"' : ""}`,
  );
}

function withLineZeroExtent(
  xml: string,
  preset: string,
  zeroWidth: boolean | undefined,
  zeroHeight: boolean | undefined,
): string {
  if (preset !== "line" || (!zeroWidth && !zeroHeight)) return xml;
  return xml.replace(
    /<a:ext cx="(\d+)" cy="(\d+)"\/>/,
    (_match, cx: string, cy: string) =>
      `<a:ext cx="${zeroWidth ? "0" : cx}" cy="${zeroHeight ? "0" : cy}"/>`,
  );
}

function withPrstDash(xml: string, dashType: string): string {
  return xml.replace(
    /<a:ln\b([^>]*)>([\s\S]*?)<\/a:ln>/g,
    (match, attrs, body) => {
      const bodyText = body as string;
      if (bodyText.includes("<a:prstDash")) return match;
      return `<a:ln${attrs as string}>${bodyText.replace(
        /(<a:(?:solidFill|noFill\/)>[\s\S]*?<\/a:solidFill>|<a:noFill\/>)/,
        `$1<a:prstDash val="${dashType}"/>`,
      )}</a:ln>`;
    },
  );
}

function withUnsupportedDashStyle(
  xml: string,
  dashType: BorderStyle["dashType"] | undefined,
): string {
  if (dashType !== "lgDashDotDot") return xml;
  return withPrstDash(xml, dashType);
}

function withPptxGenLineArrowDefaults(xml: string, preset: string): string {
  if (preset !== "line") return xml;
  const withoutDefaultSizes = xml.replace(
    /<a:(headEnd|tailEnd) type="([^"]+)" w="med" len="med"\/>/g,
    '<a:$1 type="$2"/>',
  );
  return withPrstDash(withoutDefaultSizes, "solid");
}

function withPptxGenParagraphDefaults(xml: string): string {
  let result = xml.replaceAll('baseline="-25000"', 'baseline="-40000"');
  result = result.replace(/<a:bodyPr\b([^>]*)\/>/g, (_match, attrs) => {
    const attrText = attrs as string;
    const withRtl = /(?:^|\s)rtlCol=/.test(attrText)
      ? attrText
      : `${attrText} rtlCol="0"`;
    const withAnchor = /(?:^|\s)anchor=/.test(withRtl)
      ? withRtl
      : `${withRtl} anchor="t"`;
    return `<a:bodyPr${withAnchor}/>`;
  });
  result = result.replace(
    /<a:pPr([^>]*)>([\s\S]*?)<\/a:pPr>/g,
    (match, attrs, body) => {
      const attrText = attrs as string;
      const nextAttrs = /(?:^|\s)indent=/.test(attrText)
        ? attrText
        : `${attrText} indent="0" marL="0"`;
      const bodyText = body as string;
      const nextBody = bodyText.includes("<a:buNone/>")
        ? bodyText
        : `${bodyText}<a:buNone/>`;
      return `<a:pPr${nextAttrs}>${nextBody}</a:pPr>`;
    },
  );
  result = result.replace(
    /<a:p>(?!<a:pPr)/g,
    '<a:p><a:pPr indent="0" marL="0"><a:buNone/></a:pPr>',
  );
  return result;
}

function createTextBoxXml(
  node: TextPositionedNode,
  name: string,
): { xml: string; hyperlinks: readonly (string | undefined)[] } {
  const textOptions = createTextOptions(node);
  const { paragraphs, hyperlinks } = buildParagraphs(node);
  const input: AddTextBoxInput = {
    offsetX: asEmu(Math.round(textOptions.x * EMU_PER_IN)),
    offsetY: asEmu(Math.round(textOptions.y * EMU_PER_IN)),
    width: asEmu(Math.round(textOptions.w * EMU_PER_IN)),
    height: asEmu(Math.round(textOptions.h * EMU_PER_IN)),
    rotation:
      node.rotate !== undefined
        ? asOoxmlAngle(Math.round(node.rotate * 60000))
        : undefined,
    name,
    body: {
      marginLeft: asEmu(0),
      marginRight: asEmu(0),
      marginTop: asEmu(0),
      marginBottom: asEmu(0),
    },
    paragraphs,
  };
  return {
    xml: createTextBoxXmlFromInput(input, {
      xmlTransform: (xml) => withGlowAlpha(xml, node),
    }),
    hyperlinks,
  };
}

function createTextBoxXmlFromInput(
  input: AddTextBoxInput,
  options?: { xmlTransform?: XmlTransform },
): string {
  const source = createPptx();
  const slideHandle = source.slides[0]?.handle;
  if (!slideHandle) {
    throw new Error("createPptx did not create an editable slide");
  }

  const edited = addTextBox(source, slideHandle, input);
  const edit = edited.edits?.at(-1) as
    PptxSourceModelAddTextBoxEdit | undefined;
  if (edit?.kind !== "addTextBox") {
    throw new Error("addTextBox did not produce an addTextBox edit");
  }
  const xml = withPptxGenParagraphDefaults(edit.xml);
  return options?.xmlTransform ? options.xmlTransform(xml) : xml;
}

export type GlimpseShapeXmlOptions = {
  fillColor?: string;
  fillOpacity?: number;
  backgroundGradient?: string;
  outlineGradient?: string;
  glow?: TextGlow;
  shadow?: ShadowStyle;
  rectRadius?: number;
  dashType?: BorderStyle["dashType"];
  flipH?: boolean;
  flipV?: boolean;
  zeroWidth?: boolean;
  zeroHeight?: boolean;
  customGeometry?: CustomGeometryXmlInput;
};

type CustomGeometryPointInput = { x: number; y: number } | { close: true };

export type CustomGeometryXmlInput = {
  width: number;
  height: number;
  points: readonly CustomGeometryPointInput[];
};

function geometryPointXml(point: { x: number; y: number }): string {
  return `<a:pt x="${Math.round(point.x * EMU_PER_IN)}" y="${Math.round(
    point.y * EMU_PER_IN,
  )}"/>`;
}

function buildCustomGeometryXml(
  geometry: CustomGeometryXmlInput,
): string | undefined {
  const first = geometry.points.find(
    (point): point is { x: number; y: number } => "x" in point,
  );
  if (!first) return undefined;

  let hasMoveTo = false;
  const commands = geometry.points
    .map((point) => {
      if ("close" in point) return "<a:close/>";
      if (!hasMoveTo) {
        hasMoveTo = true;
        return `<a:moveTo>${geometryPointXml(point)}</a:moveTo>`;
      }
      return `<a:lnTo>${geometryPointXml(point)}</a:lnTo>`;
    })
    .join("");

  return (
    "<a:custGeom><a:avLst/><a:gdLst/><a:ahLst/><a:cxnLst/>" +
    '<a:rect l="l" t="t" r="r" b="b"/>' +
    `<a:pathLst><a:path w="${Math.round(
      geometry.width * EMU_PER_IN,
    )}" h="${Math.round(geometry.height * EMU_PER_IN)}">${commands}</a:path></a:pathLst>` +
    "</a:custGeom>"
  );
}

function withCustomGeometry(
  xml: string,
  geometry: CustomGeometryXmlInput | undefined,
): string {
  if (!geometry) return xml;
  const customGeometry = buildCustomGeometryXml(geometry);
  if (!customGeometry) return xml;
  return xml.replace(/<a:prstGeom\b[\s\S]*?<\/a:prstGeom>/, customGeometry);
}

function withOutlineGradientFill(
  xml: string,
  outlineGradient: string | undefined,
  opacity: number | undefined,
): string {
  if (!outlineGradient) return xml;
  const gradFill = buildGradFillXml(outlineGradient, opacity);
  if (!gradFill) return xml;
  return xml.replace(
    /(<a:ln\b[^>]*>)([\s\S]*?)(<\/a:ln>)/,
    (_match, open: string, body: string, close: string) =>
      `${open}${body.replace(
        /<a:(?:solidFill|gradFill)\b[\s\S]*?<\/a:(?:solidFill|gradFill)>|<a:noFill\/>/,
        gradFill,
      )}${close}`,
  );
}

function createShapeXml(
  input: AddShapeInput,
  options: GlimpseShapeXmlOptions | undefined,
): string {
  const source = createPptx();
  const slideHandle = source.slides[0]?.handle;
  if (!slideHandle) {
    throw new Error("createPptx did not create an editable slide");
  }

  const edited = addShape(source, slideHandle, input);
  const edit = edited.edits?.at(-1) as PptxSourceModelAddShapeEdit | undefined;
  if (edit?.kind !== "addShape") {
    throw new Error("addShape did not produce an addShape edit");
  }

  let xml = edit.xml;
  xml = withShapeGlowAlpha(xml, options?.glow);
  xml = withSolidFillAlpha(xml, options?.fillColor, options?.fillOpacity);
  xml = withGradientFill(
    xml,
    options?.backgroundGradient,
    options?.fillOpacity,
    input.preset,
  );
  xml = withOutlineGradientFill(
    xml,
    options?.outlineGradient,
    options?.fillOpacity,
  );
  xml = withRoundRectAdjust(xml, input, options?.rectRadius);
  xml = withShadow(xml, options?.shadow);
  xml = withUnsupportedDashStyle(xml, options?.dashType);
  xml = withLineFlip(xml, options?.flipH, options?.flipV);
  xml = withLineZeroExtent(
    xml,
    input.preset,
    options?.zeroWidth,
    options?.zeroHeight,
  );
  xml = withPptxGenLineArrowDefaults(xml, input.preset);
  xml = withCustomGeometry(xml, options?.customGeometry);
  return xml;
}

interface RegisteredTextBox {
  kind: "shape";
  marker: string;
  name: string;
  xml: string;
  hyperlinks: readonly (string | undefined)[];
}

interface RegisteredPicture {
  kind: "picture";
  marker: string;
  name: string;
  input: AddPictureInput;
  shadow?: ShadowStyle;
}

interface RegisteredSlideBackground {
  kind: "slideBackground";
  marker: string;
  slideNumber: number;
  xml: string;
}

type RegisteredDrawing =
  RegisteredTextBox | RegisteredPicture | RegisteredSlideBackground;

export class GlimpseTextBoxRegistry {
  private readonly registered: RegisteredDrawing[] = [];
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private slideBackgroundCount = 0;

  register(node: TextPositionedNode): string {
    const index = this.textCount++;
    const marker = `${MARKER_PREFIX}${index}`;
    const name = `Text ${index + 1}`;
    const { xml, hyperlinks } = createTextBoxXml(node, name);
    this.registered.push({ kind: "shape", marker, name, xml, hyperlinks });
    return marker;
  }

  registerTextBox(
    input: AddTextBoxInput,
    options?: {
      name?: string;
      hyperlinks?: readonly (string | undefined)[];
      xmlTransform?: XmlTransform;
    },
  ): string {
    const index = this.textCount++;
    const marker = `${MARKER_PREFIX}${index}`;
    const name = options?.name ?? `Text ${index + 1}`;
    const xml = createTextBoxXmlFromInput({ ...input, name }, options);
    this.registered.push({
      marker,
      name,
      xml,
      hyperlinks: options?.hyperlinks ?? [],
    });
    return marker;
  }

  registerShape(
    input: AddShapeInput,
    options?: GlimpseShapeXmlOptions & { name?: string },
  ): string {
    const index = this.shapeCount++;
    const marker = `${SHAPE_MARKER_PREFIX}${index}`;
    const name = options?.name ?? `Shape ${index + 1}`;
    const xml = createShapeXml({ ...input, name }, options);
    this.registered.push({ kind: "shape", marker, name, xml, hyperlinks: [] });
    return marker;
  }

  registerPicture(
    input: AddPictureInput,
    options?: { name?: string; shadow?: ShadowStyle },
  ): string {
    const index = this.pictureCount++;
    const marker = `${PICTURE_MARKER_PREFIX}${index}`;
    const name = options?.name ?? `Picture ${index + 1}`;
    this.registered.push({
      kind: "picture",
      marker,
      name,
      input: { ...input, name },
      shadow: options?.shadow,
    });
    return marker;
  }

  registerSlideBackgroundGradient(
    backgroundGradient: string,
    slideNumber: number,
    opacity?: number,
  ): string | undefined {
    const xml = buildGradFillXml(backgroundGradient, opacity);
    if (!xml) return undefined;
    const marker = (SLIDE_BACKGROUND_MARKER_BASE + this.slideBackgroundCount++)
      .toString(16)
      .toUpperCase()
      .padStart(6, "0");
    this.registered.push({ kind: "slideBackground", marker, slideNumber, xml });
    return marker;
  }

  get isEmpty(): boolean {
    return this.registered.length === 0;
  }

  get entries(): readonly RegisteredDrawing[] {
    return this.registered;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceShapeId(xml: string, id: string, name: string): string {
  return xml.replace(
    /<p:cNvPr id="[^"]+" name="[^"]*"/,
    `<p:cNvPr id="${xmlAttr(id)}" name="${xmlAttr(name)}"`,
  );
}

function xmlAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function slideRelsPath(slidePath: string): string {
  const fileName = slidePath.split("/").at(-1);
  return `ppt/slides/_rels/${fileName}.rels`;
}

class SlideRelationshipEditor {
  private nextId: number;

  private changed = false;

  constructor(private xml: string) {
    const ids = Array.from(xml.matchAll(/\bId="rId(\d+)"/g), (match) =>
      Number(match[1]),
    );
    this.nextId = Math.max(0, ...ids) + 1;
  }

  addHyperlink(href: string): string {
    const id = `rId${this.nextId++}`;
    const rel =
      `<Relationship Id="${id}" Type="${HYPERLINK_REL_TYPE}" ` +
      `Target="${xmlAttr(href)}" TargetMode="External"/>`;
    this.xml = this.xml.replace("</Relationships>", `${rel}</Relationships>`);
    this.changed = true;
    return id;
  }

  addImageRelationship(id: string, target: string): void {
    const idPattern = new RegExp(`\\bId="${escapeRegExp(id)}"`);
    if (idPattern.test(this.xml)) return;
    const rel =
      `<Relationship Id="${xmlAttr(id)}" Type="${IMAGE_REL_TYPE}" ` +
      `Target="${xmlAttr(target)}"/>`;
    this.xml = this.xml.replace("</Relationships>", `${rel}</Relationships>`);
    const numeric = id.match(/^rId(\d+)$/)?.[1];
    if (numeric) {
      this.nextId = Math.max(this.nextId, Number(numeric) + 1);
    }
    this.changed = true;
  }

  get result(): { xml: string; changed: boolean } {
    return { xml: this.xml, changed: this.changed };
  }
}

function createRelationshipEditor(xml: string | undefined) {
  return new SlideRelationshipEditor(
    xml ??
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>',
  );
}

function withHyperlinkRelationships(
  xml: string,
  hyperlinks: readonly (string | undefined)[],
  addRelationship: (href: string) => string,
): string {
  if (!hyperlinks.some(Boolean)) return xml;
  let index = 0;
  return xml.replace(
    /<a:rPr\b([^>]*)>([\s\S]*?)<\/a:rPr>/g,
    (match, attrs, body) => {
      const href = hyperlinks[index++];
      if (!href) return match;
      const id = addRelationship(href);
      return `<a:rPr${attrs as string}>${body as string}<a:hlinkClick r:id="${id}"/></a:rPr>`;
    },
  );
}

function findSlideHandle(source: PptxSourceModel, slidePath: string) {
  return source.slides.find((slide) => slide.partPath === slidePath)?.handle;
}

function findMediaPart(source: PptxSourceModel, partPath: PartPath): MediaPart {
  const media = source.packageGraph.media.find(
    (part) => part.partPath === partPath,
  );
  if (!media) {
    throw new Error(`addPicture media part was not found: ${partPath}`);
  }
  return media;
}

function findSlideImageTarget(
  source: PptxSourceModel,
  slidePath: string,
  relationshipId: string,
): string {
  const relationships = source.packageGraph.relationships.find(
    (group) => group.sourcePartPath === slidePath,
  );
  const relationship = relationships?.relationships.find(
    (candidate) => candidate.id === relationshipId,
  );
  if (!relationship) {
    throw new Error(`addPicture relationship was not found: ${relationshipId}`);
  }
  return relationship.target;
}

function applyGlimpseTextBoxesToXml(
  xml: string,
  registry: GlimpseTextBoxRegistry,
  addRelationship: (href: string) => string,
): string {
  let result = xml;
  for (const entry of registry.entries) {
    if (entry.kind !== "shape") continue;
    const re = new RegExp(
      `<p:sp><p:nvSpPr><p:cNvPr id="([^"]+)" name="${escapeRegExp(
        entry.marker,
      )}"[\\s\\S]*?</p:sp>`,
      "g",
    );
    result = result.replace(re, (_match, id: string) => {
      const xmlWithIds = replaceShapeId(entry.xml, id, entry.name);
      return withHyperlinkRelationships(
        xmlWithIds,
        entry.hyperlinks,
        addRelationship,
      );
    });
  }
  return result;
}

function applySlideBackgroundGradientsToXml(
  xml: string,
  registry: GlimpseTextBoxRegistry,
  slidePath: string,
): string {
  let result = xml;
  const slideNumber = Number(slidePath.match(/slide(\d+)\.xml$/)?.[1]);
  for (const entry of registry.entries) {
    if (entry.kind !== "slideBackground") continue;
    if (entry.slideNumber !== slideNumber) continue;
    const target = `<p:bgPr><a:solidFill><a:srgbClr val="${entry.marker}"/></a:solidFill></p:bgPr>`;
    result = result.replace(target, `<p:bgPr>${entry.xml}</p:bgPr>`);
  }
  return result;
}

function withPptxGenPictureSizingXml(xml: string, hasSizing: boolean): string {
  if (!hasSizing) return xml;
  return xml.replace("<a:stretch><a:fillRect/></a:stretch>", "<a:stretch/>");
}

function applyGlimpsePicturesToXml(
  xml: string,
  registry: GlimpseTextBoxRegistry,
  source: PptxSourceModel,
  slidePath: string,
  relationshipEditor: SlideRelationshipEditor,
  addMedia: (media: MediaPart) => void,
): { xml: string; source: PptxSourceModel } {
  let result = xml;
  let editedSource = source;
  for (const entry of registry.entries) {
    if (entry.kind !== "picture") continue;
    const re = new RegExp(
      `<p:sp><p:nvSpPr><p:cNvPr id="([^"]+)" name="${escapeRegExp(
        entry.marker,
      )}"[\\s\\S]*?</p:sp>`,
      "g",
    );
    result = result.replace(re, (_match, id: string) => {
      const slideHandle = findSlideHandle(editedSource, slidePath);
      if (!slideHandle) {
        throw new Error(`slide handle was not found: ${slidePath}`);
      }
      editedSource = addPicture(editedSource, slideHandle, entry.input);
      const edit = editedSource.edits?.at(-1) as
        PptxSourceModelAddPictureEdit | undefined;
      if (edit?.kind !== "addPicture") {
        throw new Error("addPicture did not produce an addPicture edit");
      }
      const media = findMediaPart(editedSource, edit.mediaPartPath);
      addMedia(media);
      relationshipEditor.addImageRelationship(
        edit.relationshipId,
        findSlideImageTarget(editedSource, slidePath, edit.relationshipId),
      );
      const xml = withPptxGenPictureSizingXml(
        replaceShapeId(edit.xml, id, entry.name),
        entry.input.crop !== undefined,
      );
      return withShadow(xml, entry.shadow);
    });
  }
  return { xml: result, source: editedSource };
}

function ensureContentTypeDefault(
  xml: string,
  extension: string,
  contentType: string,
): string {
  const existing = new RegExp(
    `<Default\\s+[^>]*Extension="${escapeRegExp(extension)}"[^>]*/>`,
  );
  if (existing.test(xml)) return xml;
  const entry = `<Default Extension="${xmlAttr(extension)}" ContentType="${xmlAttr(
    contentType,
  )}"/>`;
  return xml.replace("</Types>", `${entry}</Types>`);
}

async function applyGlimpseMediaParts(
  zip: import("jszip"),
  mediaParts: Iterable<MediaPart>,
): Promise<void> {
  const mediaList = Array.from(mediaParts);
  if (mediaList.length === 0) return;
  const contentTypesFile = zip.file("[Content_Types].xml");
  if (!contentTypesFile) {
    throw new Error("[Content_Types].xml was not found in pptx output");
  }
  let contentTypesXml = await contentTypesFile.async("text");
  for (const media of mediaList) {
    zip.file(media.partPath, media.bytes);
    const extension = media.partPath.split(".").at(-1);
    if (!extension) continue;
    contentTypesXml = ensureContentTypeDefault(
      contentTypesXml,
      extension,
      media.contentType,
    );
  }
  zip.file("[Content_Types].xml", contentTypesXml);
}

async function applyGlimpseTextBoxes(
  data: Uint8Array | ArrayBuffer,
  registry: GlimpseTextBoxRegistry,
): Promise<import("jszip")> {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(data);
  const hasPictures = registry.entries.some(
    (entry) => entry.kind === "picture",
  );
  let source = hasPictures
    ? readPptx(data instanceof Uint8Array ? data : new Uint8Array(data))
    : undefined;
  const addedMedia = new Map<string, MediaPart>();

  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(path),
  );
  for (const path of slidePaths) {
    const file = zip.file(path);
    if (!file) continue;
    const original = await file.async("text");
    const relsPath = slideRelsPath(path);
    const relsFile = zip.file(relsPath);
    const relationshipEditor = createRelationshipEditor(
      relsFile ? await relsFile.async("text") : undefined,
    );
    const withSlideBackground = applySlideBackgroundGradientsToXml(
      original,
      registry,
      path,
    );
    const pictureResult = source
      ? applyGlimpsePicturesToXml(
          withSlideBackground,
          registry,
          source,
          path,
          relationshipEditor,
          (media) => {
            addedMedia.set(media.partPath, media);
          },
        )
      : { xml: withSlideBackground, source };
    source = pictureResult.source;
    const replaced = applyGlimpseTextBoxesToXml(
      pictureResult.xml,
      registry,
      (href) => relationshipEditor.addHyperlink(href),
    );
    if (replaced !== original) {
      zip.file(path, replaced);
    }
    const relationships = relationshipEditor.result;
    if (relationships.changed) {
      zip.file(relsPath, relationships.xml);
    }
  }
  await applyGlimpseMediaParts(zip, addedMedia.values());
  return zip;
}

export function patchPptxWriteForGlimpseTextBoxes(
  pptx: PptxGenJSInstance,
  registry: GlimpseTextBoxRegistry,
): void {
  if (registry.isEmpty) return;

  const originalWrite = pptx.write.bind(pptx);

  const patchedWrite = async (rawProps?: WriteProps | string) => {
    const props: WriteProps | undefined =
      typeof rawProps === "string"
        ? ({ outputType: rawProps } as WriteProps)
        : rawProps;
    const data = (await originalWrite({
      outputType: "uint8array",
    })) as Uint8Array;
    const zip = await applyGlimpseTextBoxes(data, registry);

    const outputType = props?.outputType;
    if (outputType === "STREAM") {
      return zip.generateAsync({
        type: "nodebuffer",
        compression: props?.compression ? "DEFLATE" : "STORE",
      });
    }
    if (outputType) {
      return zip.generateAsync({
        type: outputType,
        compression: props?.compression ? "DEFLATE" : "STORE",
      });
    }
    return zip.generateAsync({
      type: "blob",
      compression: props?.compression ? "DEFLATE" : "STORE",
    });
  };
  pptx.write = patchedWrite;

  const patchedStream = async (props?: StreamProps) =>
    pptx.write({
      outputType: "STREAM",
      compression: props?.compression,
    });
  pptx.stream = patchedStream;

  const patchedWriteFile = async (rawProps?: WriteFileProps | string) => {
    const props: WriteFileProps | undefined =
      typeof rawProps === "string" ? { fileName: rawProps } : rawProps;
    const isNode =
      typeof process !== "undefined" && Boolean(process.versions?.node);
    if (!isNode) {
      const browserWriter = pptx as BrowserWritablePptx;
      if (typeof browserWriter.writeFileToBrowser !== "function") {
        throw new Error(
          "pptx.writeFile browser download helper is unavailable; use pptx.write({ outputType: 'blob' }) instead",
        );
      }
      const rawName = props?.fileName ?? "Presentation.pptx";
      const fileName = rawName.toLowerCase().endsWith(".pptx")
        ? rawName
        : `${rawName}.pptx`;
      const blob = (await patchedWrite({
        outputType: "blob",
        compression: props?.compression,
      })) as Blob;
      await browserWriter.writeFileToBrowser(fileName, blob);
      return fileName;
    }
    const rawName = props?.fileName ?? "Presentation.pptx";
    const fileName = rawName.toLowerCase().endsWith(".pptx")
      ? rawName
      : `${rawName}.pptx`;
    const buffer = (await patchedWrite({
      outputType: "nodebuffer",
      compression: props?.compression,
    })) as Buffer;
    const fs = await import("fs");
    await fs.promises.writeFile(fileName, buffer);
    return fileName;
  };
  pptx.writeFile = patchedWriteFile;
}
