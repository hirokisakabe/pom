import { readPptx } from "@pptx-glimpse/document";
import { XMLBuilder, XMLParser } from "fast-xml-parser";
import {
  getMasterLayoutPartPaths,
  getPresentationMasterPartPaths,
  isVisibleLayout,
  toUint8Array,
} from "./pptxLayoutEnumeration.ts";

const SLIDE_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide";
const SLIDE_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml";
const PRESENTATION_PART_PATH = "ppt/presentation.xml";
const PRESENTATION_RELS_PART_PATH = "ppt/_rels/presentation.xml.rels";
const CONTENT_TYPES_PART_PATH = "[Content_Types].xml";

// CT_Presentation (ECMA-376) の子要素の宣言順。p:sldIdLst が元々存在しない
// PPTX を扱う際、末尾追加ではなくこの順序で組み直して schema 違反を防ぐ。
const PRESENTATION_CHILD_ORDER = [
  "p:sldMasterIdLst",
  "p:notesMasterIdLst",
  "p:handoutMasterIdLst",
  "p:sldIdLst",
  "p:sldSz",
  "p:notesSz",
  "p:embeddedFontLst",
  "p:custShowLst",
  "p:photoAlbum",
  "p:custDataLst",
  "p:kinsoku",
  "p:defaultTextStyle",
  "p:modifyVerifier",
  "p:extLst",
];

// JSZip は CJS パッケージのため動的 import で読み込む
async function loadJSZip(): Promise<typeof import("jszip")> {
  const mod = await import("jszip");
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  return (mod as any).default ?? mod;
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (_name, jpath) => {
    return (
      jpath === "Relationships.Relationship" ||
      jpath === "Types.Override" ||
      jpath === "Types.Default" ||
      jpath === "p:presentation.p:sldIdLst.p:sldId" ||
      jpath === "p:presentation.p:sldMasterIdLst.p:sldMasterId"
    );
  },
});

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  suppressEmptyNode: false,
});

/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

function blankSlideXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>
</p:sld>`;
}

function blankSlideRelsXml(layoutPartPath: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="/${layoutPartPath}"/>
</Relationships>`;
}

async function readZipText(
  zip: import("jszip"),
  partPath: string,
): Promise<string> {
  const file = zip.file(partPath);
  if (file === null) throw new Error(`${partPath} not found in the PPTX`);
  return file.async("text");
}

function reorderPresentationChildren(
  presentation: Record<string, unknown>,
): Record<string, unknown> {
  const attributeEntries = Object.entries(presentation).filter(([key]) =>
    key.startsWith("@_"),
  );
  const knownKeys = new Set(PRESENTATION_CHILD_ORDER);
  const orderedChildEntries = PRESENTATION_CHILD_ORDER.filter(
    (key) => key in presentation,
  ).map((key) => [key, presentation[key]] as const);
  const otherChildEntries = Object.entries(presentation).filter(
    ([key]) => !key.startsWith("@_") && !knownKeys.has(key),
  );

  return Object.fromEntries([
    ...attributeEntries,
    ...orderedChildEntries,
    ...otherChildEntries,
  ]);
}

async function updatePresentationXml(
  zip: import("jszip"),
  slideCount: number,
): Promise<void> {
  const xml = await readZipText(zip, PRESENTATION_PART_PATH);
  const parsed = xmlParser.parse(xml);
  const presentation = parsed["p:presentation"];

  const existingSldIds: Array<Record<string, string>> =
    presentation["p:sldIdLst"]?.["p:sldId"] ?? [];
  const maxSldId = existingSldIds.reduce((max, sldId) => {
    const id = parseInt(sldId["@_id"] ?? "0", 10);
    return Number.isFinite(id) ? Math.max(max, id) : max;
  }, 255);

  presentation["p:sldIdLst"] = {
    "p:sldId": Array.from({ length: slideCount }, (_, index) => ({
      "@_id": String(maxSldId + 1 + index),
      "@_r:id": `rIdSlide${index + 1}`,
    })),
  };

  parsed["p:presentation"] = reorderPresentationChildren(presentation);
  zip.file(PRESENTATION_PART_PATH, xmlBuilder.build(parsed));
}

async function updatePresentationRelsXml(
  zip: import("jszip"),
  slideCount: number,
): Promise<void> {
  const xml = await readZipText(zip, PRESENTATION_RELS_PART_PATH);
  const parsed = xmlParser.parse(xml);
  const relationshipsRoot = parsed.Relationships;

  const existingRelationships: Array<Record<string, string>> =
    relationshipsRoot.Relationship ?? [];
  const nonSlideRelationships = existingRelationships.filter(
    (relationship) => relationship["@_Type"] !== SLIDE_REL_TYPE,
  );
  const newSlideRelationships = Array.from(
    { length: slideCount },
    (_, index) => ({
      "@_Id": `rIdSlide${index + 1}`,
      "@_Type": SLIDE_REL_TYPE,
      "@_Target": `slides/slide${index + 1}.xml`,
    }),
  );

  relationshipsRoot.Relationship = [
    ...nonSlideRelationships,
    ...newSlideRelationships,
  ];

  zip.file(PRESENTATION_RELS_PART_PATH, xmlBuilder.build(parsed));
}

async function updateContentTypesXml(
  zip: import("jszip"),
  slideCount: number,
): Promise<void> {
  const xml = await readZipText(zip, CONTENT_TYPES_PART_PATH);
  const parsed = xmlParser.parse(xml);
  const typesRoot = parsed.Types;

  const existingOverrides: Array<Record<string, string>> =
    typesRoot.Override ?? [];
  const nonSlideOverrides = existingOverrides.filter(
    (override) =>
      !/^\/ppt\/slides\/slide\d+\.xml$/.test(override["@_PartName"] ?? ""),
  );
  const newSlideOverrides = Array.from({ length: slideCount }, (_, index) => ({
    "@_PartName": `/ppt/slides/slide${index + 1}.xml`,
    "@_ContentType": SLIDE_CONTENT_TYPE,
  }));

  typesRoot.Override = [...nonSlideOverrides, ...newSlideOverrides];

  zip.file(CONTENT_TYPES_PART_PATH, xmlBuilder.build(parsed));
}

/* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */

/**
 * Convert a PPTX buffer into a new PPTX that contains exactly one blank slide
 * per visible slide layout, grouped by slide master in presentation order.
 *
 * Layouts hidden via `p:sldLayout[show="0"]` (or `"false"`) are excluded. The
 * slide/layout order matches {@link extractThemeTokensFromPptx}, so the two
 * outputs can be zipped together to pair each generated slide with its theme.
 */
export async function extractSlideMastersAsPptx(
  pptxBuffer: ArrayBuffer | Uint8Array,
): Promise<ArrayBuffer> {
  const buffer = toUint8Array(pptxBuffer);
  const source = readPptx(buffer);

  const layoutPartPaths: string[] = [];
  for (const masterPartPath of getPresentationMasterPartPaths(source)) {
    for (const layoutPartPath of getMasterLayoutPartPaths(
      source,
      masterPartPath,
    )) {
      if (isVisibleLayout(source, layoutPartPath)) {
        layoutPartPaths.push(layoutPartPath);
      }
    }
  }

  if (layoutPartPaths.length === 0) {
    throw new Error("No visible slide layouts found for slide masters");
  }

  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(buffer);

  for (const path of Object.keys(zip.files)) {
    if (path.startsWith("ppt/slides/")) zip.remove(path);
  }

  layoutPartPaths.forEach((layoutPartPath, index) => {
    const slideNumber = index + 1;
    zip.file(`ppt/slides/slide${slideNumber}.xml`, blankSlideXml());
    zip.file(
      `ppt/slides/_rels/slide${slideNumber}.xml.rels`,
      blankSlideRelsXml(layoutPartPath),
    );
  });

  await updatePresentationXml(zip, layoutPartPaths.length);
  await updatePresentationRelsXml(zip, layoutPartPaths.length);
  await updateContentTypesXml(zip, layoutPartPaths.length);

  return zip.generateAsync({ type: "arraybuffer" });
}
