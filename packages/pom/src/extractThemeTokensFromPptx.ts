import { readPptx } from "@pptx-glimpse/document";
import type { PptxSourceModel, SourceColor } from "@pptx-glimpse/document";
import {
  getAttributeByLocalName,
  getAttributes,
  getChildByLocalName,
  getMasterLayoutPartPaths,
  getPresentationMasterPartPaths,
  isVisibleLayout,
  parseXmlRoot,
  primitiveString,
  readRawPartXml,
  resolveRelationshipsByType,
  toUint8Array,
} from "./pptxLayoutEnumeration.ts";
import { FALLBACK_THEME_TOKENS } from "./types.ts";
import type { ThemeTokens } from "./types.ts";

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
