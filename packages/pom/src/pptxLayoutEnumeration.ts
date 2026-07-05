import { XMLParser } from "fast-xml-parser";
import type { PptxSourceModel, RawOoxmlNode } from "@pptx-glimpse/document";

const SLIDE_LAYOUT_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const textDecoder = new TextDecoder();

export function toUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function localName(name: string): string {
  return name.split(":").pop() ?? name;
}

export function getChildByLocalName(
  node: unknown,
  childLocalName: string,
): unknown {
  if (!isRecord(node)) return undefined;
  for (const [key, value] of Object.entries(node)) {
    if (localName(key) === childLocalName) return value;
  }
  return undefined;
}

function getChildrenByLocalName(
  node: unknown,
  childLocalName: string,
): unknown[] {
  if (!isRecord(node)) return [];
  const child = getChildByLocalName(node, childLocalName);
  if (Array.isArray(child)) return child;
  return child === undefined ? [] : [child];
}

export function getAttributeByLocalName(
  node: unknown,
  attributeLocalName: string,
): unknown {
  if (!isRecord(node)) return undefined;
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("@_")) continue;
    if (localName(key.slice(2)) === attributeLocalName) return value;
  }
  return undefined;
}

export function getAttributes(node: unknown): Record<string, string> {
  if (!isRecord(node)) return {};
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("@_")) continue;
    const stringValue = primitiveString(value);
    if (stringValue !== undefined) attributes[key.slice(2)] = stringValue;
  }
  return attributes;
}

export function primitiveString(value: unknown): string | undefined {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  return undefined;
}

function getRelationshipIdAttribute(node: unknown): string | undefined {
  if (!isRecord(node)) return undefined;
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("@_")) continue;
    const attributeName = key.slice(2);
    if (attributeName === "r:id") return primitiveString(value);
  }
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("@_")) continue;
    const attributeName = key.slice(2);
    if (attributeName.includes(":") && localName(attributeName) === "id") {
      return primitiveString(value);
    }
  }
  return undefined;
}

function isHiddenShowValue(value: unknown): boolean {
  const normalized = primitiveString(value)?.toLowerCase();
  return normalized === "0" || normalized === "false";
}

function isHiddenRawLayoutNode(node: RawOoxmlNode): boolean {
  if (localName(node.name) !== "sldLayout") return false;
  const show = Object.entries(node.attributes ?? {}).find(
    ([key]) => localName(key) === "show",
  )?.[1];
  return isHiddenShowValue(show);
}

function isHiddenLayoutXml(xml: string): boolean {
  const parsed = xmlParser.parse(xml) as unknown;
  const root = getChildByLocalName(parsed, "sldLayout");
  return isHiddenShowValue(getAttributeByLocalName(root, "show"));
}

export function parseXmlRoot(xml: string, rootLocalName: string): unknown {
  return getChildByLocalName(xmlParser.parse(xml) as unknown, rootLocalName);
}

export function readRawPartXml(
  source: PptxSourceModel,
  partPath: string | undefined,
): string | undefined {
  if (partPath === undefined) return undefined;
  const rawPart = source.packageGraph.rawParts?.find(
    (part) => part.partPath === partPath,
  );
  if (rawPart?.kind !== "binary") return undefined;
  return textDecoder.decode(rawPart.bytes);
}

function normalizePartPath(partPath: string): string {
  const segments: string[] = [];
  for (const segment of partPath.split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
    } else {
      segments.push(segment);
    }
  }
  return segments.join("/");
}

function resolveRelationshipTarget(
  sourcePartPath: string,
  target: string,
): string {
  if (target.startsWith("/")) return normalizePartPath(target.slice(1));
  const slash = sourcePartPath.lastIndexOf("/");
  const basePath = slash === -1 ? "" : sourcePartPath.slice(0, slash + 1);
  return normalizePartPath(`${basePath}${target}`);
}

function getRelationships(source: PptxSourceModel, sourcePartPath: string) {
  return (
    source.packageGraph.relationships.find(
      (relationships) => relationships.sourcePartPath === sourcePartPath,
    )?.relationships ?? []
  );
}

function resolveRelationshipById(
  source: PptxSourceModel,
  sourcePartPath: string,
  relationshipId: string | undefined,
): string | undefined {
  if (relationshipId === undefined) return undefined;
  const relationship = getRelationships(source, sourcePartPath).find(
    (candidate) =>
      candidate.id === relationshipId && candidate.targetMode !== "External",
  );
  if (relationship === undefined) return undefined;
  return resolveRelationshipTarget(sourcePartPath, relationship.target);
}

export function resolveRelationshipsByType(
  source: PptxSourceModel,
  sourcePartPath: string,
  relationshipType: string,
): string[] {
  return getRelationships(source, sourcePartPath).flatMap((relationship) => {
    if (
      relationship.type !== relationshipType ||
      relationship.targetMode === "External"
    ) {
      return [];
    }
    return [resolveRelationshipTarget(sourcePartPath, relationship.target)];
  });
}

/**
 * `presentation.xml` の `p:sldMasterIdLst` 順（解決できない場合は
 * `source.slideMasters` の列挙順）でスライドマスターの partPath を返す。
 */
export function getPresentationMasterPartPaths(
  source: PptxSourceModel,
): string[] {
  const presentationPath = source.presentation.partPath;
  const presentationXml = readRawPartXml(source, presentationPath);
  if (presentationXml === undefined) {
    return source.slideMasters.map((master) => master.partPath);
  }

  const root = parseXmlRoot(presentationXml, "presentation");
  const list = getChildByLocalName(root, "sldMasterIdLst");
  const paths = getChildrenByLocalName(list, "sldMasterId").flatMap((node) => {
    const partPath = resolveRelationshipById(
      source,
      presentationPath,
      getRelationshipIdAttribute(node),
    );
    return partPath === undefined ? [] : [partPath];
  });

  return paths.length > 0
    ? paths
    : source.slideMasters.map((master) => master.partPath);
}

/**
 * スライドマスター配下の `p:sldLayoutIdLst` 順（解決できない場合は型付き
 * モデルの `layoutPartPaths`、それも無ければ relationship type 検索）で
 * レイアウトの partPath を返す。
 */
export function getMasterLayoutPartPaths(
  source: PptxSourceModel,
  masterPartPath: string,
): string[] {
  const masterXml = readRawPartXml(source, masterPartPath);
  if (masterXml !== undefined) {
    const root = parseXmlRoot(masterXml, "sldMaster");
    const list = getChildByLocalName(root, "sldLayoutIdLst");
    const paths = getChildrenByLocalName(list, "sldLayoutId").flatMap(
      (node) => {
        const partPath = resolveRelationshipById(
          source,
          masterPartPath,
          getRelationshipIdAttribute(node),
        );
        return partPath === undefined ? [] : [partPath];
      },
    );
    if (paths.length > 0) return paths;
  }

  const typedMaster = source.slideMasters.find(
    (master) => master.partPath === masterPartPath,
  );
  if (typedMaster !== undefined) return Array.from(typedMaster.layoutPartPaths);
  return resolveRelationshipsByType(
    source,
    masterPartPath,
    SLIDE_LAYOUT_REL_TYPE,
  );
}

/** `p:sldLayout` の `show="0"` / `show="false"` (hidden) かどうかを判定する。 */
export function isVisibleLayout(
  source: PptxSourceModel,
  layoutPartPath: string,
): boolean {
  const rawPart = source.packageGraph.rawParts?.find(
    (part) => part.partPath === layoutPartPath,
  );

  if (rawPart?.kind === "xml") return !isHiddenRawLayoutNode(rawPart.xml);
  if (rawPart?.kind === "binary") {
    return !isHiddenLayoutXml(textDecoder.decode(rawPart.bytes));
  }
  return true;
}
