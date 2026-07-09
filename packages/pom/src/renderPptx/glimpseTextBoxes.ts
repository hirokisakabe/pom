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
  addTextBox,
  asEmu,
  asHundredthPt,
  asOoxmlAngle,
  asOoxmlPercent,
  asPt,
  createPptx,
  type AddTextBoxGradientFillInput,
  type AddTextBoxInput,
  type AddTextBoxParagraphInput,
  type AddTextBoxRunPropertiesInput,
  type PptxSourceModelAddTextBoxEdit,
} from "@pptx-glimpse/document";
import type {
  PositionedNode,
  TextGlow,
  TextOutline,
  Underline,
} from "../types.ts";
import { parseLinearGradient } from "../shared/gradient.ts";
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

const MARKER_PREFIX = "pom-text:";
const HYPERLINK_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink";

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

function cleanHex(color: string | undefined): string | undefined {
  return color?.replace(/^#/, "").toUpperCase();
}

function toColorInput(color: string | undefined) {
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
  const source = createPptx();
  const slideHandle = source.slides[0]?.handle;
  if (!slideHandle) {
    throw new Error("createPptx did not create an editable slide");
  }

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
  const edited = addTextBox(source, slideHandle, input);
  const edit = edited.edits?.at(-1) as
    PptxSourceModelAddTextBoxEdit | undefined;
  if (edit?.kind !== "addTextBox") {
    throw new Error("addTextBox did not produce an addTextBox edit");
  }
  return {
    xml: withPptxGenParagraphDefaults(withGlowAlpha(edit.xml, node)),
    hyperlinks,
  };
}

interface RegisteredTextBox {
  marker: string;
  name: string;
  xml: string;
  hyperlinks: readonly (string | undefined)[];
}

export class GlimpseTextBoxRegistry {
  private readonly registered: RegisteredTextBox[] = [];

  register(node: TextPositionedNode): string {
    const index = this.registered.length;
    const marker = `${MARKER_PREFIX}${index}`;
    const name = `Text ${index + 1}`;
    const { xml, hyperlinks } = createTextBoxXml(node, name);
    this.registered.push({ marker, name, xml, hyperlinks });
    return marker;
  }

  get isEmpty(): boolean {
    return this.registered.length === 0;
  }

  get entries(): readonly RegisteredTextBox[] {
    return this.registered;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceShapeId(xml: string, id: string, name: string): string {
  return xml.replace(
    /<p:cNvPr id="[^"]+" name="[^"]*"/,
    `<p:cNvPr id="${id}" name="${name}"`,
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

function applyGlimpseTextBoxesToXml(
  xml: string,
  registry: GlimpseTextBoxRegistry,
  addRelationship: (href: string) => string,
): string {
  let result = xml;
  for (const entry of registry.entries) {
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

async function applyGlimpseTextBoxes(
  data: Uint8Array | ArrayBuffer,
  registry: GlimpseTextBoxRegistry,
): Promise<import("jszip")> {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(data);

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
    const replaced = applyGlimpseTextBoxesToXml(original, registry, (href) =>
      relationshipEditor.addHyperlink(href),
    );
    if (replaced !== original) {
      zip.file(path, replaced);
    }
    const relationships = relationshipEditor.result;
    if (relationships.changed) {
      zip.file(relsPath, relationships.xml);
    }
  }
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
