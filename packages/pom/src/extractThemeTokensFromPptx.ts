import { readPptx } from "@pptx-glimpse/document";
import type {
  PptxSourceModel,
  RawOoxmlNode,
  SourceColor,
} from "@pptx-glimpse/document";
import { XMLParser } from "fast-xml-parser";
import { FALLBACK_THEME_TOKENS } from "./types.ts";
import type { ThemeTokens } from "./types.ts";

const SLIDE_LAYOUT_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout";
const THEME_REL_TYPE =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";

const DEFAULT_COLOR_MAP: Record<string, string> = {
  bg1: "lt1",
  tx1: "dk1",
  bg2: "lt2",
  tx2: "dk2",
  accent1: "accent1",
  accent2: "accent2",
  accent3: "accent3",
  accent4: "accent4",
  accent5: "accent5",
  accent6: "accent6",
  hlink: "hlink",
  folHlink: "folHlink",
};

const THEME_TOKEN_SLOT_MAP = {
  text: "tx1",
  background: "bg1",
  primary: "accent1",
  secondary: "accent2",
  accent3: "accent3",
  accent4: "accent4",
  accent5: "accent5",
  accent6: "accent6",
} as const satisfies Record<keyof ThemeTokens, string>;

const SYSTEM_COLOR_FALLBACKS: Record<string, string> = {
  windowText: "#000000",
  window: "#FFFFFF",
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

const textDecoder = new TextDecoder();

function toUint8Array(input: ArrayBuffer | Uint8Array): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

function normalizeHex(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = value.startsWith("#") ? value.slice(1) : value;
  if (!/^[0-9a-fA-F]{6}$/.test(raw)) return undefined;
  return `#${raw.toUpperCase()}`;
}

type ThemeColorValue = SourceColor | string;

function resolveSourceColor(
  color: ThemeColorValue | undefined,
): string | undefined {
  if (color === undefined) return undefined;
  if (typeof color === "string") return normalizeHex(color);
  if (color.kind === "srgb") return normalizeHex(color.hex);
  if (color.kind === "system") {
    return (
      normalizeHex(color.lastColor) ??
      SYSTEM_COLOR_FALLBACKS[color.value] ??
      undefined
    );
  }
  return undefined;
}

function tokensFromColorScheme(
  colors: Readonly<Record<string, ThemeColorValue>> | undefined,
  colorMap: Readonly<Record<string, string>>,
): ThemeTokens {
  const resolve = (token: keyof ThemeTokens): string => {
    const logicalSlot = THEME_TOKEN_SLOT_MAP[token];
    const schemeSlot = colorMap[logicalSlot] ?? logicalSlot;
    return (
      resolveSourceColor(colors?.[schemeSlot]) ??
      resolveSourceColor(colors?.[logicalSlot]) ??
      FALLBACK_THEME_TOKENS[token]
    );
  };

  return {
    text: resolve("text"),
    background: resolve("background"),
    primary: resolve("primary"),
    secondary: resolve("secondary"),
    accent3: resolve("accent3"),
    accent4: resolve("accent4"),
    accent5: resolve("accent5"),
    accent6: resolve("accent6"),
  };
}

function fallbackTokensFromColorScheme(
  colors: Readonly<Record<string, ThemeColorValue>> | undefined,
): ThemeTokens {
  const resolve = (token: keyof ThemeTokens): string => {
    const schemeSlot = DEFAULT_COLOR_MAP[THEME_TOKEN_SLOT_MAP[token]];
    return (
      resolveSourceColor(colors?.[schemeSlot]) ?? FALLBACK_THEME_TOKENS[token]
    );
  };

  return {
    text: resolve("text"),
    background: resolve("background"),
    primary: resolve("primary"),
    secondary: resolve("secondary"),
    accent3: resolve("accent3"),
    accent4: resolve("accent4"),
    accent5: resolve("accent5"),
    accent6: resolve("accent6"),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function localName(name: string): string {
  return name.split(":").pop() ?? name;
}

function getChildByLocalName(node: unknown, childLocalName: string): unknown {
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

function getAttributeByLocalName(
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

function getAttributes(node: unknown): Record<string, string> {
  if (!isRecord(node)) return {};
  const attributes: Record<string, string> = {};
  for (const [key, value] of Object.entries(node)) {
    if (!key.startsWith("@_")) continue;
    const stringValue = primitiveString(value);
    if (stringValue !== undefined) attributes[key.slice(2)] = stringValue;
  }
  return attributes;
}

function primitiveString(value: unknown): string | undefined {
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

function parseXmlRoot(xml: string, rootLocalName: string): unknown {
  return getChildByLocalName(xmlParser.parse(xml) as unknown, rootLocalName);
}

function readRawPartXml(
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

function resolveRelationshipsByType(
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

function getPresentationMasterPartPaths(source: PptxSourceModel): string[] {
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

function getMasterLayoutPartPaths(
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

function getMasterThemePartPath(
  source: PptxSourceModel,
  masterPartPath: string,
): string | undefined {
  const typedMaster = source.slideMasters.find(
    (master) => master.partPath === masterPartPath,
  );
  return (
    typedMaster?.themePartPath ??
    resolveRelationshipsByType(source, masterPartPath, THEME_REL_TYPE)[0]
  );
}

function parseRawColorElement(parent: unknown): string | undefined {
  const srgb = getChildByLocalName(parent, "srgbClr");
  const srgbValue = primitiveString(getAttributeByLocalName(srgb, "val"));
  if (srgbValue !== undefined) return normalizeHex(srgbValue);

  const system = getChildByLocalName(parent, "sysClr");
  const lastColor = primitiveString(getAttributeByLocalName(system, "lastClr"));
  if (lastColor !== undefined) return normalizeHex(lastColor);
  const systemValue = primitiveString(getAttributeByLocalName(system, "val"));
  if (systemValue !== undefined) return SYSTEM_COLOR_FALLBACKS[systemValue];

  return undefined;
}

function getThemeColorScheme(
  source: PptxSourceModel,
  themePartPath: string | undefined,
): Readonly<Record<string, ThemeColorValue>> | undefined {
  const typedTheme = source.themes.find(
    (theme) => theme.partPath === themePartPath,
  );
  if (typedTheme?.colorScheme?.colors !== undefined) {
    return typedTheme.colorScheme.colors;
  }

  const themeXml = readRawPartXml(source, themePartPath);
  if (themeXml === undefined) return undefined;

  const root = parseXmlRoot(themeXml, "theme");
  const themeElements = getChildByLocalName(root, "themeElements");
  const colorScheme = getChildByLocalName(themeElements, "clrScheme");
  const colors: Record<string, string> = {};
  for (const slot of Object.values(DEFAULT_COLOR_MAP)) {
    const color = parseRawColorElement(getChildByLocalName(colorScheme, slot));
    if (color !== undefined) colors[slot] = color;
  }
  return colors;
}

function getMasterColorMap(
  source: PptxSourceModel,
  masterPartPath: string,
): Record<string, string> {
  const typedMaster = source.slideMasters.find(
    (master) => master.partPath === masterPartPath,
  );
  if (typedMaster?.colorMap?.mapping !== undefined) {
    return { ...DEFAULT_COLOR_MAP, ...typedMaster.colorMap.mapping };
  }

  const masterXml = readRawPartXml(source, masterPartPath);
  if (masterXml === undefined) return DEFAULT_COLOR_MAP;

  const root = parseXmlRoot(masterXml, "sldMaster");
  const colorMap = getAttributes(getChildByLocalName(root, "clrMap"));
  return { ...DEFAULT_COLOR_MAP, ...colorMap };
}

function isVisibleLayout(
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

/**
 * Extract PowerPoint theme colors as pom ThemeTokens.
 *
 * The result repeats each slide master's tokens once for every visible layout
 * under that master, preserving the source master/layout relationship order.
 */
export function extractThemeTokensFromPptx(
  pptxBuffer: ArrayBuffer | Uint8Array,
): Promise<ThemeTokens[]> {
  const source = readPptx(toUint8Array(pptxBuffer));
  const tokens: ThemeTokens[] = [];

  for (const masterPartPath of getPresentationMasterPartPaths(source)) {
    const themePartPath = getMasterThemePartPath(source, masterPartPath);
    const colorScheme = getThemeColorScheme(source, themePartPath);
    const colorMap = getMasterColorMap(source, masterPartPath);
    const masterTokens =
      themePartPath === undefined
        ? fallbackTokensFromColorScheme(colorScheme)
        : tokensFromColorScheme(colorScheme, colorMap);

    for (const layoutPartPath of getMasterLayoutPartPaths(
      source,
      masterPartPath,
    )) {
      if (isVisibleLayout(source, layoutPartPath)) {
        tokens.push(masterTokens);
      }
    }
  }

  return Promise.resolve(tokens);
}
