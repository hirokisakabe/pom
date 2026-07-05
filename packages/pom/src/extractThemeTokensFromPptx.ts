import { readPptx } from "@pptx-glimpse/document";
import type { RawOoxmlNode, SourceColor } from "@pptx-glimpse/document";
import { XMLParser } from "fast-xml-parser";
import { FALLBACK_THEME_TOKENS } from "./types.ts";
import type { ThemeTokens } from "./types.ts";

const THEME_TOKEN_SLOT_MAP = {
  text: "dk1",
  background: "lt1",
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

function resolveSourceColor(
  color: SourceColor | undefined,
): string | undefined {
  if (color === undefined) return undefined;
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
  colors: Readonly<Record<string, SourceColor>> | undefined,
): ThemeTokens {
  const resolve = (token: keyof ThemeTokens): string =>
    resolveSourceColor(colors?.[THEME_TOKEN_SLOT_MAP[token]]) ??
    FALLBACK_THEME_TOKENS[token];

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

function isVisibleLayout(
  source: ReturnType<typeof readPptx>,
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

  for (const master of source.slideMasters) {
    const theme = source.themes.find(
      (candidate) => candidate.partPath === master.themePartPath,
    );
    const masterTokens = tokensFromColorScheme(theme?.colorScheme?.colors);

    for (const layoutPartPath of master.layoutPartPaths) {
      if (isVisibleLayout(source, layoutPartPath)) {
        tokens.push(masterTokens);
      }
    }
  }

  return Promise.resolve(tokens);
}
