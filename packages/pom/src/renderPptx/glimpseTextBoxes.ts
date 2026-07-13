/**
 * Primitive の @pptx-glimpse/document writer への段階的 swap。
 *
 * 混在期間の合成方式は「pptxgenjs 出力 zip をベースに、swap 済み primitive
 * の XML / package part を glimpse writer で生成して該当 marker shape と
 * 差し替える」方式を採用する。pptxgenjs 側には slide master 生成が残っているため、既存 zip を
 * ベースにすると [Content_Types].xml / rels / media parts の管理を現行実装へ
 * 寄せられる。代替案として glimpse の package をベースに未 swap primitive を
 * pptxgenjs から取り込む方式も検討したが、初回スライス時点では pptxgenjs 側の
 * 非 text primitive と master 出力を XML part 単位で切り出す責務が増え、以降の
 * primitive swap より先に package 合成の複雑さが大きくなるため採用しない。
 *
 * marker shape は描画順を保持するためだけに pptxgenjs へ追加し、write 時に
 * glimpse の `<p:sp>` / `<p:graphicFrame>` で丸ごと置換する。swap 済み primitive
 * 自体は対応する pptxgenjs API を経由しない。
 */
import {
  addChart,
  addPicture,
  addShape,
  addTable,
  addTextBox,
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asOoxmlPercent,
  asPt,
  createPptx,
  type AddChartInput,
  type AddTextBoxGradientFillInput,
  type AddShapeInput,
  type AddPictureInput,
  type AddTableInput,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type AddTextBoxRunPropertiesInput,
  type MediaPart,
  type PartPath,
  type PptxSourceModel,
  type PptxSourceModelAddPictureEdit,
  type PptxSourceModelAddShapeEdit,
  type PptxSourceModelAddChartEdit,
  type PptxSourceModelAddTableEdit,
  type PptxSourceModelAddTextBoxEdit,
  readPptx,
  writePptx,
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
const TABLE_MARKER_PREFIX = "pom-table:";
const CHART_MARKER_PREFIX = "pom-chart:";
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
  outlineOpacity?: number;
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
      if ("close" in point) return hasMoveTo ? "<a:close/>" : "";
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
  const lineFillPattern =
    /<a:(?:solidFill|gradFill)\b[\s\S]*?<\/a:(?:solidFill|gradFill)>|<a:noFill\/>/;
  if (/<a:ln\b[^>]*\/>/.test(xml)) {
    return xml.replace(
      /<a:ln\b([^>]*)\/>/,
      (_match, attrs: string) => `<a:ln${attrs}>${gradFill}</a:ln>`,
    );
  }
  return xml.replace(
    /(<a:ln\b[^>]*>)([\s\S]*?)(<\/a:ln>)/,
    (_match, open: string, body: string, close: string) => {
      const nextBody = lineFillPattern.test(body)
        ? body.replace(lineFillPattern, gradFill)
        : `${gradFill}${body}`;
      return `${open}${nextBody}${close}`;
    },
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
    options?.outlineOpacity ?? options?.fillOpacity,
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

interface RegisteredTable {
  kind: "table";
  marker: string;
  name: string;
  input: AddTableInput;
  runProperties?: readonly TableRunCompatibility[];
  borderDash?: string;
}

export type TableRunCompatibility = {
  strike?: boolean;
  baseline?: "subscript" | "superscript";
  highlight?: string;
  underlineStyle?: string;
  underlineColor?: string;
};

interface RegisteredChart {
  kind: "chart";
  marker: string;
  name: string;
  input: AddChartInput;
  pointColors?: readonly string[];
}

interface RegisteredSlideBackground {
  kind: "slideBackground";
  marker: string;
  slideNumber: number;
  xml: string;
}

type RegisteredDrawing =
  | RegisteredTextBox
  | RegisteredPicture
  | RegisteredTable
  | RegisteredChart
  | RegisteredSlideBackground;

export class GlimpseTextBoxRegistry {
  private readonly registered: RegisteredDrawing[] = [];
  private textCount = 0;
  private shapeCount = 0;
  private pictureCount = 0;
  private tableCount = 0;
  private chartCount = 0;
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
      kind: "shape",
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

  registerTable(
    input: AddTableInput,
    options?: {
      name?: string;
      runProperties?: readonly TableRunCompatibility[];
      borderDash?: string;
    },
  ): string {
    const index = this.tableCount++;
    const marker = `${TABLE_MARKER_PREFIX}${index}`;
    const name = options?.name ?? `Table ${index + 1}`;
    this.registered.push({
      kind: "table",
      marker,
      name,
      input: { ...input, name },
      runProperties: options?.runProperties,
      borderDash: options?.borderDash,
    });
    return marker;
  }

  registerChart(
    input: AddChartInput,
    options?: { name?: string; pointColors?: readonly string[] },
  ): string {
    const index = this.chartCount++;
    const marker = `${CHART_MARKER_PREFIX}${index}`;
    const name = options?.name ?? `Chart ${index + 1}`;
    this.registered.push({
      kind: "chart",
      marker,
      name,
      input: { ...input, name },
      pointColors: options?.pointColors,
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

type AddedGraphicFrame = {
  marker: string;
  name: string;
  slidePath: string;
  xml: string;
  chartPartPath?: PartPath;
  chartInput?: AddChartInput;
  pointColors?: readonly string[];
};

function withPptxGenTableDefaults(
  xml: string,
  runProperties: readonly TableRunCompatibility[] | undefined,
  borderDash: string | undefined,
): string {
  let runIndex = 0;
  return xml
    .replace(/<a:tblPr\b[^>]*>[\s\S]*?<\/a:tblPr>/, "<a:tblPr/>")
    .replace(
      /<a:tcPr(?=[\s/>])/g,
      '<a:tcPr marL="0" marR="0" marT="0" marB="0"',
    )
    .replace(
      /<a:rPr\b([^>]*?)(?:\/>|>([\s\S]*?)<\/a:rPr>)/g,
      (_match, rawAttrs: string, rawBody: string | undefined) => {
        const compatibility = runProperties?.[runIndex++];
        if (!compatibility) return _match;
        let attrs = rawAttrs;
        const setAttr = (name: string, value: string) => {
          const pattern = new RegExp(`\\s${name}="[^"]*"`);
          attrs = pattern.test(attrs)
            ? attrs.replace(pattern, ` ${name}="${value}"`)
            : `${attrs} ${name}="${value}"`;
        };
        if (compatibility.strike) setAttr("strike", "sngStrike");
        if (compatibility.baseline === "subscript")
          setAttr("baseline", "-40000");
        if (compatibility.baseline === "superscript")
          setAttr("baseline", "30000");
        if (compatibility.underlineStyle) {
          setAttr("u", compatibility.underlineStyle);
        }
        let body = rawBody ?? "";
        let compatibilityChildren = "";
        if (compatibility.highlight) {
          compatibilityChildren += `<a:highlight><a:srgbClr val="${cleanHex(compatibility.highlight)}"/></a:highlight>`;
        }
        if (compatibility.underlineColor) {
          compatibilityChildren += `<a:uFill><a:solidFill><a:srgbClr val="${cleanHex(compatibility.underlineColor)}"/></a:solidFill></a:uFill>`;
        }
        if (compatibilityChildren) {
          const lateChild =
            /<a:(?:latin|ea|cs|sym|hlinkClick|hlinkMouseOver|rtl)\b/;
          body = lateChild.test(body)
            ? body.replace(lateChild, `${compatibilityChildren}$&`)
            : `${body}${compatibilityChildren}`;
        }
        return body ? `<a:rPr${attrs}>${body}</a:rPr>` : `<a:rPr${attrs}/>`;
      },
    )
    .replace(
      /<a:tcPr\b([^>]*)>([\s\S]*?)<\/a:tcPr>/g,
      (_match, attrs: string, body: string) => {
        const borders =
          body.match(/<a:ln(?:L|R|T|B)\b[\s\S]*?<\/a:ln(?:L|R|T|B)>/g) ?? [];
        if (borders.length === 0) return _match;
        const bodyWithoutBorders = body.replace(
          /<a:ln(?:L|R|T|B)\b[\s\S]*?<\/a:ln(?:L|R|T|B)>/g,
          "",
        );
        return `<a:tcPr${attrs}>${borders.join("")}${bodyWithoutBorders}</a:tcPr>`;
      },
    )
    .replace(
      /<a:prstDash val="[^"]+"\/>/g,
      borderDash ? `<a:prstDash val="${xmlAttr(borderDash)}"/>` : "$&",
    );
}

const CHART_AXIS_LINE_XML =
  '<c:spPr><a:ln w="12700" cap="flat"><a:solidFill><a:srgbClr val="888888"/></a:solidFill><a:prstDash val="solid"/><a:round/></a:ln></c:spPr>';
const CHART_AXIS_TEXT_XML =
  '<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="0" i="0" u="none" strike="noStrike"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>';
const CHART_NO_FILL_XML =
  "<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln><a:effectLst/></c:spPr>";
const CHART_TRANSPARENT_FILL_XML =
  '<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"><a:alpha val="0"/></a:srgbClr></a:solidFill><a:ln w="12700" cap="flat"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln><a:effectLst/></c:spPr>';
const CHART_HIDDEN_AXIS_LINE_XML =
  '<c:spPr><a:ln w="12700" cap="flat"><a:noFill/><a:prstDash val="solid"/><a:round/></a:ln></c:spPr>';

function withPptxGenChartDefaults(
  xml: string,
  input: AddChartInput,
  pointColors: readonly string[] | undefined,
): string {
  const isSparkline = input.plotLayout !== undefined;
  const chartAreaShape = isSparkline
    ? CHART_TRANSPARENT_FILL_XML
    : CHART_NO_FILL_XML;
  let result = xml
    .replace(/<c:lang\b[^>]*\/>/, "")
    .replace('<c:dispBlanksAs val="gap"/>', '<c:dispBlanksAs val="span"/>')
    .replace(/(<c:legend>.*?)<c:layout\/>/g, "$1")
    .replace("</c:plotArea>", `${chartAreaShape}</c:plotArea>`)
    .replace(
      "</c:chart><c:externalData",
      `</c:chart>${chartAreaShape}<c:externalData`,
    );
  if (!isSparkline) {
    result = result.replace(
      '<c:roundedCorners val="0"/>',
      '<c:roundedCorners val="1"/>',
    );
  }

  if (input.title !== undefined) {
    result = result.replace(/<c:title>[\s\S]*?<\/c:title>/, (titleXml) =>
      titleXml
        .replace(
          "<a:p><a:r>",
          '<a:p><a:pPr><a:defRPr sz="1800" b="0" i="0" u="none" strike="noStrike"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/></a:defRPr></a:pPr><a:r>',
        )
        .replace(
          /<a:rPr\b[^>]*\/>/,
          '<a:rPr sz="1800" b="0" i="0" u="none" strike="noStrike"><a:solidFill><a:srgbClr val="000000"/></a:solidFill><a:latin typeface="Arial"/></a:rPr>',
        ),
    );
  }

  if (isSparkline) {
    result = result.replace(
      '<c:xMode val="factor"/><c:yMode val="factor"/><c:wMode val="factor"/><c:hMode val="factor"/>',
      '<c:xMode val="edge"/><c:yMode val="edge"/>',
    );
    result = withPptxGenChartAxisDefaults(result, "catAx", true, true);
    result = withPptxGenChartAxisDefaults(result, "valAx", false, true);
  } else {
    result = withPptxGenChartAxisDefaults(result, "catAx", true, false);
    result = withPptxGenChartAxisDefaults(result, "valAx", false, false);
  }

  let seriesIndex = 0;
  result = result.replace(
    /<c:ser>([\s\S]*?)<\/c:ser>/g,
    (_match, body: string) => {
      const color = cleanHex(input.series[seriesIndex]?.color) ?? "C0504D";
      seriesIndex += 1;
      let seriesBody = body;
      const solidFill = `<a:solidFill><a:srgbClr val="${color}"/></a:solidFill>`;
      const seriesShape =
        input.chartType === "pie" || input.chartType === "doughnut"
          ? '<c:spPr><a:solidFill><a:schemeClr val="accent1"/></a:solidFill><a:ln w="9525" cap="flat"><a:solidFill><a:srgbClr val="F9F9F9"/></a:solidFill><a:prstDash val="solid"/><a:round/></a:ln><a:effectLst/></c:spPr>'
          : input.chartType === "line" || input.chartType === "radar"
            ? `<c:spPr>${solidFill}<a:ln w="25400" cap="flat">${solidFill}<a:prstDash val="solid"/><a:round/></a:ln><a:effectLst/></c:spPr>`
            : `<c:spPr>${solidFill}<a:effectLst/></c:spPr>`;
      seriesBody = seriesBody.replace(
        /<c:spPr>[\s\S]*?<\/c:spPr>/,
        seriesShape,
      );
      if (input.chartType === "line" || input.chartType === "radar") {
        const markerShape = `<c:marker><c:symbol val="circle"/><c:size val="6"/><c:spPr>${solidFill}<a:ln w="9525" cap="flat">${solidFill}<a:prstDash val="solid"/><a:round/></a:ln><a:effectLst/></c:spPr></c:marker>`;
        seriesBody = seriesBody.replace(
          /<c:marker>[\s\S]*?<\/c:marker>/,
          markerShape,
        );
      }
      return `<c:ser>${seriesBody}</c:ser>`;
    },
  );
  if (pointColors?.length) {
    const points = pointColors
      .map(
        (color, index) =>
          `<c:dPt><c:idx val="${index}"/>${input.chartType === "bar" ? '<c:invertIfNegative val="0"/>' : ""}<c:bubble3D val="0"/><c:spPr><a:solidFill><a:srgbClr val="${cleanHex(color)}"/></a:solidFill><a:effectLst/></c:spPr></c:dPt>`,
      )
      .join("");
    result = result.replace(/(<c:ser>[\s\S]*?<\/c:spPr>)/, `$1${points}`);
  }
  return result;
}

function withPptxGenChartAxisDefaults(
  xml: string,
  tag: "catAx" | "valAx",
  category: boolean,
  hidden: boolean,
): string {
  return xml.replace(
    new RegExp(`<c:${tag}>([\\s\\S]*?)</c:${tag}>`),
    (_match, rawBody: string) => {
      let body = rawBody
        .replace(
          '<c:majorTickMark val="none"/>',
          '<c:majorTickMark val="out"/>',
        )
        .replace(
          /<c:tickLblPos val="[^"]+"\/>/,
          `<c:tickLblPos val="${category ? "low" : "nextTo"}"/>`,
        )
        .replace(
          '<c:numFmt formatCode="General" sourceLinked="1"/>',
          `<c:numFmt formatCode="General" sourceLinked="${category ? 1 : 0}"/>`,
        )
        .replace(
          /<c:spPr><a:ln><a:noFill\/><\/a:ln><\/c:spPr>/,
          hidden ? CHART_HIDDEN_AXIS_LINE_XML : "",
        );
      if (tag === "valAx") {
        body = body.replace(
          "<c:majorGridlines/>",
          `<c:majorGridlines>${CHART_AXIS_LINE_XML}</c:majorGridlines>`,
        );
      }
      body = body.replace(
        "<c:crossAx",
        `${hidden ? "" : CHART_AXIS_LINE_XML}${CHART_AXIS_TEXT_XML}<c:crossAx`,
      );
      if (category) {
        body = body
          .replace(/<c:lblOffset\b[^>]*\/>/, "")
          .replace("</c:catAx>", "</c:catAx>");
        body += '<c:noMultiLvlLbl val="1"/>';
      }
      return `<c:${tag}>${body}</c:${tag}>`;
    },
  );
}

function markerShapePattern(marker: string): RegExp {
  return new RegExp(
    `<p:sp><p:nvSpPr><p:cNvPr id="([^"]+)" name="${escapeRegExp(
      marker,
    )}"[\\s\\S]*?</p:sp>`,
  );
}

async function addGlimpseGraphicFrames(
  data: Uint8Array | ArrayBuffer,
  registry: GlimpseTextBoxRegistry,
): Promise<Uint8Array> {
  const entries = registry.entries.filter(
    (entry): entry is RegisteredTable | RegisteredChart =>
      entry.kind === "table" || entry.kind === "chart",
  );
  if (entries.length === 0) {
    return data instanceof Uint8Array ? data : new Uint8Array(data);
  }

  const JSZip = await loadJSZip();
  const inputZip = await JSZip.loadAsync(data);
  const slidePaths = Object.keys(inputZip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(path),
  );
  const slideXmlByPath = new Map<string, string>();
  for (const path of slidePaths) {
    const file = inputZip.file(path);
    if (file) slideXmlByPath.set(path, await file.async("text"));
  }

  let source = readPptx(
    data instanceof Uint8Array ? data : new Uint8Array(data),
  );
  const added: AddedGraphicFrame[] = [];
  for (const entry of entries) {
    const slidePath = slidePaths.find((path) =>
      markerShapePattern(entry.marker).test(slideXmlByPath.get(path) ?? ""),
    );
    if (!slidePath) {
      throw new Error(`graphic frame marker was not found: ${entry.marker}`);
    }
    const slideHandle = findSlideHandle(source, slidePath);
    if (!slideHandle) {
      throw new Error(`slide handle was not found: ${slidePath}`);
    }
    source =
      entry.kind === "table"
        ? addTable(source, slideHandle, entry.input)
        : addChart(source, slideHandle, entry.input);
    const edit = source.edits?.at(-1) as
      PptxSourceModelAddTableEdit | PptxSourceModelAddChartEdit | undefined;
    if (!edit || (edit.kind !== "addTable" && edit.kind !== "addChart")) {
      throw new Error(`${entry.kind} did not produce an add edit`);
    }
    added.push({
      marker: entry.marker,
      name: entry.name,
      slidePath,
      xml:
        entry.kind === "table"
          ? withPptxGenTableDefaults(
              edit.xml,
              entry.runProperties,
              entry.borderDash,
            )
          : edit.xml,
      chartPartPath: edit.kind === "addChart" ? edit.chartPartPath : undefined,
      chartInput: entry.kind === "chart" ? entry.input : undefined,
      pointColors: entry.kind === "chart" ? entry.pointColors : undefined,
    });
  }

  const writtenZip = await JSZip.loadAsync(writePptx(source));
  for (const [path, file] of Object.entries(writtenZip.files)) {
    if (file.dir || inputZip.file(path)) continue;
    inputZip.file(path, await file.async("uint8array"));
  }
  for (const entry of added) {
    if (!entry.chartPartPath || !entry.chartInput) continue;
    const chartFile = writtenZip.file(entry.chartPartPath);
    if (!chartFile) {
      throw new Error(`chart part was not found: ${entry.chartPartPath}`);
    }
    inputZip.file(
      entry.chartPartPath,
      withPptxGenChartDefaults(
        await chartFile.async("text"),
        entry.chartInput,
        entry.pointColors,
      ),
    );
  }

  const contentTypes = inputZip.file("[Content_Types].xml");
  const writtenContentTypes = writtenZip.file("[Content_Types].xml");
  if (contentTypes && writtenContentTypes) {
    inputZip.file(
      "[Content_Types].xml",
      mergePackageDeclarations(
        await contentTypes.async("text"),
        await writtenContentTypes.async("text"),
        "Default",
        "Extension",
      ),
    );
    const current = await inputZip.file("[Content_Types].xml")!.async("text");
    inputZip.file(
      "[Content_Types].xml",
      mergePackageDeclarations(
        current,
        await writtenContentTypes.async("text"),
        "Override",
        "PartName",
      ),
    );
  }

  for (const path of new Set(added.map((entry) => entry.slidePath))) {
    const file = inputZip.file(path);
    if (!file) throw new Error(`slide XML was not found: ${path}`);
    let xml = await file.async("text");
    for (const entry of added.filter(
      (candidate) => candidate.slidePath === path,
    )) {
      const marker = markerShapePattern(entry.marker);
      if (!marker.test(xml))
        throw new Error(`graphic frame marker was not found: ${entry.marker}`);
      xml = xml.replace(marker, (_match, id: string) =>
        replaceShapeId(entry.xml, id, entry.name),
      );
    }
    inputZip.file(path, xml);

    const relsPath = slideRelsPath(path);
    const rels = inputZip.file(relsPath);
    const writtenRels = writtenZip.file(relsPath);
    if (writtenRels) {
      inputZip.file(
        relsPath,
        mergePackageDeclarations(
          rels
            ? await rels.async("text")
            : createRelationshipEditor(undefined).result.xml,
          await writtenRels.async("text"),
          "Relationship",
          "Id",
        ),
      );
    }
  }
  return inputZip.generateAsync({ type: "uint8array" });
}

function mergePackageDeclarations(
  target: string,
  source: string,
  tag: "Default" | "Override" | "Relationship",
  key: "Extension" | "PartName" | "Id",
): string {
  let result = target;
  const closeTag = tag === "Relationship" ? "Relationships" : "Types";
  const entries = source.match(new RegExp(`<${tag}\\b[^>]*/>`, "g")) ?? [];
  for (const entry of entries) {
    const value = entry.match(new RegExp(`\\b${key}="([^"]+)"`))?.[1];
    if (!value) continue;
    const exists = new RegExp(
      `<${tag}\\b[^>]*\\b${key}="${escapeRegExp(value)}"`,
    ).test(result);
    if (!exists)
      result = result.replace(`</${closeTag}>`, `${entry}</${closeTag}>`);
  }
  return result;
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
  data = await addGlimpseGraphicFrames(data, registry);
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
