import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { z } from "zod";
import type { POMNode } from "../types.ts";
import {
  getNodeMetadata,
  getNodeMetadataByTag,
  NODE_METADATA,
} from "../registry/nodeMetadata.ts";
import {
  type CoercionRule,
  NODE_COERCION_MAP,
  CHILD_ELEMENT_COERCION_MAP,
  coerceWithRule,
  coerceFallback,
  getObjectShapeFromRule,
  resolveMixedNotationShorthand,
} from "./coercionRules.ts";

// ===== ParseXmlError =====
export class ParseXmlError extends Error {
  public readonly errors: string[];
  constructor(errors: string[]) {
    const message = `XML validation failed (${errors.length} error${errors.length > 1 ? "s" : ""}):\n${errors.map((e) => `  - ${e}`).join("\n")}`;
    super(message);
    this.name = "ParseXmlError";
    this.errors = errors;
  }
}

// ===== Tag name → POM node type mapping =====
export const TAG_TO_TYPE: Record<string, string> = Object.fromEntries(
  NODE_METADATA.map((def) => [def.tagName, def.type]),
);
// Attributes allowed on any node (e.g., x/y for Layer children positioning)
const UNIVERSAL_ATTRS = new Set(["x", "y"]);

// ===== Validation helpers =====
function getKnownAttributes(nodeType: string): string[] {
  const rules = NODE_COERCION_MAP[nodeType];
  if (!rules) return [];
  return Object.keys(rules);
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array<number>(n + 1).fill(0),
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function findClosestMatch(
  input: string,
  candidates: string[],
): string | undefined {
  const threshold = Math.max(2, Math.floor(input.length / 2));
  let bestMatch: string | undefined;
  let bestDistance = Infinity;
  for (const candidate of candidates) {
    const dist = levenshteinDistance(
      input.toLowerCase(),
      candidate.toLowerCase(),
    );
    if (dist < bestDistance && dist <= threshold) {
      bestDistance = dist;
      bestMatch = candidate;
    }
  }
  return bestMatch;
}

function getKnownChildAttributes(tagName: string): string[] {
  const rules = CHILD_ELEMENT_COERCION_MAP[tagName];
  if (!rules) return [];
  return Object.keys(rules);
}

function formatZodIssue(
  issue: z.core.$ZodIssue,
  tagName: string,
): string | null {
  const path = issue.path;
  // Skip children-related issues (validated recursively)
  if (path.length > 0 && path[0] === "children") return null;
  // Skip "type" field issues (set internally)
  if (path.length === 1 && path[0] === "type") return null;

  const attrName = path.length > 0 ? String(path[0]) : undefined;

  const code = issue.code;

  if (code === "invalid_type") {
    // Missing required attribute
    if (issue.input === undefined) {
      if (attrName) {
        return `<${tagName}>: Missing required attribute "${attrName}"`;
      }
      return `<${tagName}>: ${issue.message}`;
    }
    // Type mismatch
    if (attrName) {
      return `<${tagName}>: Invalid type for attribute "${attrName}". ${issue.message}`;
    }
    return `<${tagName}>: ${issue.message}`;
  }

  if (code === "invalid_value") {
    if (attrName) {
      const values = (issue as unknown as { values: string[] }).values;
      if (values) {
        return `<${tagName}>: Invalid value for attribute "${attrName}". Expected: ${values.map((v) => `"${v}"`).join(", ")}`;
      }
      return `<${tagName}>: Invalid value for attribute "${attrName}". ${issue.message}`;
    }
    return `<${tagName}>: ${issue.message}`;
  }

  if (code === "too_small" || code === "too_big") {
    if (attrName) {
      return `<${tagName}>: Invalid value for attribute "${attrName}". ${issue.message}`;
    }
    return `<${tagName}>: ${issue.message}`;
  }

  // Generic fallback
  if (attrName) {
    return `<${tagName}>: Attribute "${attrName}": ${issue.message}`;
  }
  return `<${tagName}>: ${issue.message}`;
}

// Properties that may be legitimately absent when using child element notation
// or when the property is optional in practice (even if required in schema).
function validateLeafNode(
  nodeType: string,
  result: Record<string, unknown>,
  errors: string[],
): void {
  const def = getNodeMetadata(nodeType as POMNode["type"]);
  if (def.childPolicy.kind === "pom-children") return;
  const schema = def.schema;
  const tagName = def.tagName;
  const optionalChildProps = new Set(
    def.childPolicy.kind === "custom"
      ? (def.childPolicy.optionalProperties ?? [])
      : [],
  );
  const parseResult = schema.safeParse(result);
  if (!parseResult.success) {
    const seen = new Set<string>();
    for (const issue of parseResult.error.issues) {
      // Skip only top-level missing child-element properties (path.length === 1)
      // Nested issues (e.g., data.children[0].label) must still be reported
      if (
        optionalChildProps.size > 0 &&
        issue.path.length === 1 &&
        optionalChildProps.has(String(issue.path[0])) &&
        issue.code === "invalid_type" &&
        issue.input === undefined
      ) {
        continue;
      }
      // Skip issues for universal attributes (x, y)
      if (issue.path.length > 0 && UNIVERSAL_ATTRS.has(String(issue.path[0]))) {
        continue;
      }
      const msg = formatZodIssue(issue, tagName);
      if (msg && !seen.has(msg)) {
        seen.add(msg);
        errors.push(msg);
      }
    }
  }
}

// ===== Types for XML parser output (preserveOrder mode) =====
type XmlNode = XmlElement | XmlTextNode;
type XmlTextNode = { "#text": string };
interface XmlElement {
  [tagName: string]: XmlNode[] | Record<string, string> | undefined;
  ":@"?: Record<string, string>;
}

// ===== Coercion rule lookup =====

function getCoercionRule(
  nodeType: string,
  propertyName: string,
): CoercionRule | undefined {
  return NODE_COERCION_MAP[nodeType]?.[propertyName];
}

// ===== Dot notation helpers =====

// ===== Dot notation expansion =====
function expandDotNotation(attrs: Record<string, string>): {
  regular: Record<string, string>;
  dotGroups: Record<string, Record<string, string>>;
} {
  const regular: Record<string, string> = {};
  const dotGroups: Record<string, Record<string, string>> = {};

  for (const [key, value] of Object.entries(attrs)) {
    const dotIndex = key.indexOf(".");
    if (dotIndex > 0) {
      const prefix = key.substring(0, dotIndex);
      const suffix = key.substring(dotIndex + 1);
      if (!dotGroups[prefix]) dotGroups[prefix] = {};
      dotGroups[prefix][suffix] = value;
    } else {
      regular[key] = value;
    }
  }

  return { regular, dotGroups };
}

function coerceDotGroup(
  prefix: string,
  subAttrs: Record<string, string>,
  rule: CoercionRule,
  tagName: string,
  errors: string[],
): Record<string, unknown> {
  const objectShape = getObjectShapeFromRule(rule);

  const obj: Record<string, unknown> = {};
  if (objectShape) {
    for (const [subKey, subValue] of Object.entries(subAttrs)) {
      if (objectShape[subKey]) {
        const coerced = coerceWithRule(subValue, objectShape[subKey]);
        if (coerced.error !== null) {
          errors.push(`<${tagName}>: ${prefix}.${subKey}: ${coerced.error}`);
        } else {
          obj[subKey] = coerced.value;
        }
      } else {
        const knownSubKeys = Object.keys(objectShape);
        const suggestion = findClosestMatch(subKey, knownSubKeys);
        errors.push(
          `<${tagName}>: Unknown sub-attribute "${prefix}.${subKey}"${suggestion ? `. Did you mean "${prefix}.${suggestion}"?` : ""}`,
        );
      }
    }
  } else {
    errors.push(
      `<${tagName}>: Attribute "${prefix}" does not support dot notation`,
    );
  }
  return obj;
}

// ===== XML node helpers =====
function isTextNode(node: XmlNode): node is XmlTextNode {
  return "#text" in node;
}

function getTagName(node: XmlElement): string {
  for (const key of Object.keys(node)) {
    if (key !== ":@") return key;
  }
  throw new Error("No tag name found in XML element");
}

function getAttributes(node: XmlElement): Record<string, string> {
  const attrs: Record<string, string> = {};
  const rawAttrs = node[":@"];
  if (rawAttrs) {
    for (const [key, value] of Object.entries(rawAttrs)) {
      const attrName = key.startsWith("@_") ? key.slice(2) : key;
      attrs[attrName] = value.trim();
    }
  }
  return attrs;
}

function getChildElements(node: XmlElement): XmlElement[] {
  const tagName = getTagName(node);
  const children = node[tagName] as XmlNode[] | undefined;
  if (!children) return [];
  return children.filter((child): child is XmlElement => !isTextNode(child));
}

function getTextContent(node: XmlElement): string | undefined {
  const tagName = getTagName(node);
  const children = node[tagName] as XmlNode[] | undefined;
  if (!children) return undefined;
  const textParts: string[] = [];
  for (const child of children) {
    if (isTextNode(child)) {
      textParts.push(child["#text"]);
    }
  }
  return textParts.length > 0 ? textParts.join("") : undefined;
}

function getRawChildren(node: XmlElement): XmlNode[] {
  const tagName = getTagName(node);
  return (node[tagName] as XmlNode[] | undefined) ?? [];
}

const INLINE_FORMAT_TAGS = new Set(["B", "I", "A", "U", "S", "Mark", "Span"]);

function hasInlineFormatChildren(childElements: XmlElement[]): boolean {
  return (
    childElements.length > 0 &&
    childElements.every((el) => INLINE_FORMAT_TAGS.has(getTagName(el)))
  );
}

type TextRunResult = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  highlight?: string;
  color?: string;
  href?: string;
  fontFamily?: string;
  letterSpacing?: number;
};

function extractTextRuns(
  children: XmlNode[],
  inheritBold?: boolean,
  inheritItalic?: boolean,
  inheritHref?: string,
  inheritUnderline?: boolean,
  inheritStrike?: boolean,
  inheritHighlight?: string,
  inheritColor?: string,
  inheritFontFamily?: string,
  inheritLetterSpacing?: number,
): TextRunResult[] {
  const runs: TextRunResult[] = [];
  for (const child of children) {
    if (isTextNode(child)) {
      const run: TextRunResult = { text: child["#text"] };
      if (inheritBold) run.bold = true;
      if (inheritItalic) run.italic = true;
      if (inheritUnderline) run.underline = true;
      if (inheritStrike) run.strike = true;
      if (inheritHighlight) run.highlight = inheritHighlight;
      if (inheritColor) run.color = inheritColor;
      if (inheritHref) run.href = inheritHref;
      if (inheritFontFamily) run.fontFamily = inheritFontFamily;
      if (inheritLetterSpacing !== undefined)
        run.letterSpacing = inheritLetterSpacing;
      runs.push(run);
    } else {
      const tag = getTagName(child);
      const innerChildren = getRawChildren(child);
      if (tag === "B") {
        runs.push(
          ...extractTextRuns(
            innerChildren,
            true,
            inheritItalic,
            inheritHref,
            inheritUnderline,
            inheritStrike,
            inheritHighlight,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "I") {
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            true,
            inheritHref,
            inheritUnderline,
            inheritStrike,
            inheritHighlight,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "A") {
        const href = getAttributes(child).href ?? "";
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            inheritItalic,
            href,
            inheritUnderline,
            inheritStrike,
            inheritHighlight,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "U") {
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            inheritItalic,
            inheritHref,
            true,
            inheritStrike,
            inheritHighlight,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "S") {
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            inheritItalic,
            inheritHref,
            inheritUnderline,
            true,
            inheritHighlight,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "Mark") {
        const rawColor = getAttributes(child).color;
        const color = rawColor && rawColor.trim() ? rawColor : "FFFF00";
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            inheritItalic,
            inheritHref,
            inheritUnderline,
            inheritStrike,
            color,
            inheritColor,
            inheritFontFamily,
            inheritLetterSpacing,
          ),
        );
      } else if (tag === "Span") {
        const spanAttrs = getAttributes(child);
        const rawSpanColor = spanAttrs.color;
        const spanColor =
          rawSpanColor && rawSpanColor.trim() ? rawSpanColor : inheritColor;
        const rawSpanFontFamily = spanAttrs.fontFamily;
        const spanFontFamily =
          rawSpanFontFamily && rawSpanFontFamily.trim()
            ? rawSpanFontFamily
            : inheritFontFamily;
        const rawSpanLetterSpacing = spanAttrs.letterSpacing;
        const spanLetterSpacing =
          rawSpanLetterSpacing && rawSpanLetterSpacing.trim()
            ? Number(rawSpanLetterSpacing)
            : inheritLetterSpacing;
        runs.push(
          ...extractTextRuns(
            innerChildren,
            inheritBold,
            inheritItalic,
            inheritHref,
            inheritUnderline,
            inheritStrike,
            inheritHighlight,
            spanColor,
            spanFontFamily,
            spanLetterSpacing,
          ),
        );
      }
    }
  }
  return runs;
}

function buildRunsAndText(
  node: XmlElement,
): { runs: TextRunResult[]; text: string } | null {
  const rawChildren = getRawChildren(node);
  const childElements = rawChildren.filter(
    (c): c is XmlElement => !isTextNode(c),
  );
  if (!hasInlineFormatChildren(childElements)) return null;
  const runs = extractTextRuns(rawChildren);
  const text = runs.map((r) => r.text).join("");
  return { runs, text };
}

function coerceChildAttrs(
  parentTagName: string,
  tagName: string,
  attrs: Record<string, string>,
  errors: string[],
): Record<string, unknown> {
  const rules = CHILD_ELEMENT_COERCION_MAP[tagName];
  const result: Record<string, unknown> = {};
  const { regular: regularAttrs, dotGroups } = expandDotNotation(attrs);

  // Process dot-notation attributes
  for (const [prefix, subAttrs] of Object.entries(dotGroups)) {
    if (rules && rules[prefix]) {
      result[prefix] = coerceDotGroup(
        prefix,
        subAttrs,
        rules[prefix],
        `${parentTagName}.${tagName}`,
        errors,
      );
    } else if (rules) {
      const knownAttrs = getKnownChildAttributes(tagName);
      const suggestion = findClosestMatch(prefix, knownAttrs);
      errors.push(
        `<${parentTagName}>.<${tagName}>: Unknown attribute "${prefix}"${suggestion ? `. Did you mean "${suggestion}"?` : ""}`,
      );
    } else {
      result[prefix] = {};
      for (const [subKey, subValue] of Object.entries(subAttrs)) {
        (result[prefix] as Record<string, unknown>)[subKey] =
          coerceFallback(subValue);
      }
    }
  }

  // Process regular attributes
  for (const [key, value] of Object.entries(regularAttrs)) {
    if (key in dotGroups) {
      if (rules && rules[key]) {
        const resolved = resolveMixedNotationShorthand(value, rules[key]);
        if (resolved.mode === "ignore") {
          continue;
        }
        if (resolved.mode === "merge") {
          result[key] = {
            ...resolved.value,
            ...(result[key] as Record<string, unknown>),
          };
          continue;
        }
      }
      errors.push(
        `<${parentTagName}>.<${tagName}>: Attribute "${key}" conflicts with dot-notation attributes. Use one or the other, not both`,
      );
      continue;
    }
    if (rules && rules[key]) {
      const coerced = coerceWithRule(value, rules[key]);
      if (coerced.error !== null) {
        errors.push(`<${parentTagName}>.<${tagName}>: ${coerced.error}`);
      } else {
        result[key] = coerced.value;
      }
    } else if (rules) {
      // Unknown attribute on child element
      const knownAttrs = getKnownChildAttributes(tagName);
      const suggestion = findClosestMatch(key, knownAttrs);
      errors.push(
        `<${parentTagName}>.<${tagName}>: Unknown attribute "${key}"${suggestion ? `. Did you mean "${suggestion}"?` : ""}`,
      );
    } else {
      result[key] = coerceFallback(value);
    }
  }
  return result;
}

// ===== Child element converters =====
type ChildElementConverter = (
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
  node?: XmlElement,
) => void;

function convertProcessArrowChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const steps: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    if (tag !== "ProcessArrowStep") {
      errors.push(
        `Unknown child element <${tag}> inside <ProcessArrow>. Expected: <ProcessArrowStep>`,
      );
      continue;
    }
    steps.push(
      coerceChildAttrs("ProcessArrow", tag, getAttributes(child), errors),
    );
  }
  result.steps = steps;
}

function convertPyramidChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const levels: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    if (tag !== "PyramidLevel") {
      errors.push(
        `Unknown child element <${tag}> inside <Pyramid>. Expected: <PyramidLevel>`,
      );
      continue;
    }
    levels.push(coerceChildAttrs("Pyramid", tag, getAttributes(child), errors));
  }
  result.levels = levels;
}

function convertTimelineChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const items: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    if (tag !== "TimelineItem") {
      errors.push(
        `Unknown child element <${tag}> inside <Timeline>. Expected: <TimelineItem>`,
      );
      continue;
    }
    items.push(coerceChildAttrs("Timeline", tag, getAttributes(child), errors));
  }
  result.items = items;
}

function convertMatrixChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const items: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    switch (tag) {
      case "MatrixAxes":
        result.axes = coerceChildAttrs(
          "Matrix",
          tag,
          getAttributes(child),
          errors,
        );
        break;
      case "MatrixQuadrants":
        result.quadrants = coerceChildAttrs(
          "Matrix",
          tag,
          getAttributes(child),
          errors,
        );
        break;
      case "MatrixItem":
        items.push(
          coerceChildAttrs("Matrix", tag, getAttributes(child), errors),
        );
        break;
      default:
        errors.push(
          `Unknown child element <${tag}> inside <Matrix>. Expected: <MatrixAxes>, <MatrixQuadrants>, or <MatrixItem>`,
        );
    }
  }
  if (items.length > 0) {
    result.items = items;
  }
}

function convertFlowChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const nodes: Record<string, unknown>[] = [];
  const connections: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    switch (tag) {
      case "FlowNode":
        nodes.push(coerceChildAttrs("Flow", tag, getAttributes(child), errors));
        break;
      case "FlowConnection":
        connections.push(
          coerceChildAttrs("Flow", tag, getAttributes(child), errors),
        );
        break;
      default:
        errors.push(
          `Unknown child element <${tag}> inside <Flow>. Expected: <FlowNode> or <FlowConnection>`,
        );
    }
  }
  if (nodes.length > 0) {
    result.nodes = nodes;
  }
  if (connections.length > 0) {
    result.connections = connections;
  }
}

function convertChartChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const data: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    if (tag !== "ChartSeries") {
      errors.push(
        `Unknown child element <${tag}> inside <Chart>. Expected: <ChartSeries>`,
      );
      continue;
    }
    const attrs = getAttributes(child);
    const series: Record<string, unknown> = {
      labels: [],
      values: [],
    };
    if (attrs.name !== undefined) {
      // chartDataSchema.name は z.string().optional() なのでそのまま文字列として使用
      series.name = attrs.name;
    }

    for (const dp of getChildElements(child)) {
      const dpTag = getTagName(dp);
      if (dpTag !== "ChartDataPoint") {
        errors.push(
          `Unknown child element <${dpTag}> inside <ChartSeries>. Expected: <ChartDataPoint>`,
        );
        continue;
      }
      const dpAttrs = getAttributes(dp);
      if (dpAttrs.label === undefined) {
        errors.push('<ChartDataPoint> requires a "label" attribute');
      }
      if (dpAttrs.value === undefined) {
        errors.push('<ChartDataPoint> requires a "value" attribute');
      }
      if (dpAttrs.label === undefined || dpAttrs.value === undefined) {
        continue;
      }
      const numValue = Number(dpAttrs.value);
      if (isNaN(numValue)) {
        errors.push(
          `Cannot convert "${dpAttrs.value}" to number in <ChartDataPoint> "value" attribute`,
        );
        continue;
      }
      (series.labels as string[]).push(dpAttrs.label);
      (series.values as number[]).push(numValue);
    }
    data.push(series);
  }
  result.data = data;
}

function convertTableChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const columns: Record<string, unknown>[] = [];
  const rows: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    switch (tag) {
      case "Col":
        columns.push(
          coerceChildAttrs("Table", tag, getAttributes(child), errors),
        );
        break;
      case "Tr": {
        const rowAttrs = getAttributes(child);
        const cells: Record<string, unknown>[] = [];
        for (const cellEl of getChildElements(child)) {
          const cellTag = getTagName(cellEl);
          if (cellTag !== "Td") {
            errors.push(
              `Unknown child element <${cellTag}> inside <Tr>. Expected: <Td>`,
            );
            continue;
          }
          const cellAttrs = coerceChildAttrs(
            "Tr",
            cellTag,
            getAttributes(cellEl),
            errors,
          );
          const runsResult = buildRunsAndText(cellEl);
          if (runsResult) {
            cellAttrs.runs = runsResult.runs;
            cellAttrs.text = runsResult.text;
          } else {
            const cellText = getTextContent(cellEl);
            if (cellText !== undefined && !("text" in cellAttrs)) {
              cellAttrs.text = cellText;
            }
          }
          cells.push(cellAttrs);
        }
        const row: Record<string, unknown> = { cells };
        if (rowAttrs.height !== undefined) {
          const h = Number(rowAttrs.height);
          if (isNaN(h)) {
            errors.push(
              `Cannot convert "${rowAttrs.height}" to number in <Tr> "height" attribute`,
            );
          } else {
            row.height = h;
          }
        }
        rows.push(row);
        break;
      }
      default:
        errors.push(
          `Unknown child element <${tag}> inside <Table>. Expected: <Col> or <Tr>`,
        );
    }
  }
  if (columns.length > 0) {
    result.columns = columns;
  } else if (rows.length > 0) {
    // Col が未指定の場合、行のセル数（colspan 考慮）からデフォルトの columns を自動生成
    const maxCells = Math.max(
      ...rows.map((row) =>
        (row.cells as Record<string, unknown>[]).reduce(
          (sum, cell) => sum + ((cell.colspan as number) ?? 1),
          0,
        ),
      ),
    );
    result.columns = Array.from({ length: maxCells }, () => ({}));
  }
  if (rows.length > 0) {
    result.rows = rows;
  }
}

function convertTreeItem(
  element: XmlElement,
  errors: string[],
): Record<string, unknown> {
  const attrs = getAttributes(element);
  if (attrs.label === undefined) {
    errors.push('<TreeItem> requires a "label" attribute');
  }
  const item: Record<string, unknown> = {};
  if (attrs.label !== undefined) {
    item.label = attrs.label;
  }
  if (attrs.color !== undefined) {
    item.color = attrs.color;
  }
  if (attrs.textColor !== undefined) {
    item.textColor = attrs.textColor;
  }
  const children = getChildElements(element);
  if (children.length > 0) {
    item.children = children
      .map((child) => {
        const tag = getTagName(child);
        if (tag !== "TreeItem") {
          errors.push(
            `Unknown child element <${tag}> inside <TreeItem>. Expected: <TreeItem>`,
          );
          return null;
        }
        return convertTreeItem(child, errors);
      })
      .filter((item): item is Record<string, unknown> => item !== null);
  }
  return item;
}

function convertTreeChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  if (childElements.length !== 1) {
    errors.push(
      `<Tree> must have exactly 1 <TreeItem> child element, but got ${childElements.length}`,
    );
    return;
  }
  const child = childElements[0];
  const tag = getTagName(child);
  if (tag !== "TreeItem") {
    errors.push(
      `Unknown child element <${tag}> inside <Tree>. Expected: <TreeItem>`,
    );
    return;
  }
  result.data = convertTreeItem(child, errors);
}

function convertListChildren(
  parentTag: string,
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  const items: Record<string, unknown>[] = [];
  for (const child of childElements) {
    const tag = getTagName(child);
    if (tag !== "Li") {
      errors.push(
        `Unknown child element <${tag}> inside <${parentTag}>. Expected: <Li>`,
      );
      continue;
    }
    const attrs = coerceChildAttrs(
      parentTag,
      tag,
      getAttributes(child),
      errors,
    );
    const runsResult = buildRunsAndText(child);
    if (runsResult) {
      attrs.runs = runsResult.runs;
      attrs.text = runsResult.text;
    } else {
      const textContent = getTextContent(child);
      if (textContent !== undefined && !("text" in attrs)) {
        attrs.text = textContent;
      }
    }
    items.push(attrs);
  }
  result.items = items;
}

// SVG 要素を XML 文字列に再構築する
const svgBuilder = new XMLBuilder({
  preserveOrder: true,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function serializeSvgElement(svgElement: XmlElement): string {
  return String(svgBuilder.build([svgElement]));
}

function convertSvgChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
): void {
  if (childElements.length !== 1) {
    errors.push(
      `<Svg>: Expected exactly one <svg> child element, but found ${childElements.length} child element(s)`,
    );
    return;
  }

  const child = childElements[0];
  const tag = getTagName(child);
  if (tag !== "svg") {
    errors.push(`<Svg>: Expected <svg> child element, but found <${tag}>`);
    return;
  }

  result.svgContent = serializeSvgElement(child);
}

function convertTextInlineChildren(
  childElements: XmlElement[],
  result: Record<string, unknown>,
  errors: string[],
  node?: XmlElement,
): void {
  // インラインフォーマットタグ以外の子要素がある場合はエラー
  for (const el of childElements) {
    const tag = getTagName(el);
    if (!INLINE_FORMAT_TAGS.has(tag)) {
      errors.push(
        `<Text>: Unexpected child element <${tag}>. Only <B>, <I>, <A>, <U>, <S>, <Mark>, and <Span> are allowed inside <Text>`,
      );
      return;
    }
  }
  if (!node || childElements.length === 0) return;
  const runsResult = buildRunsAndText(node);
  if (runsResult) {
    result.runs = runsResult.runs;
    result.text = runsResult.text;
  }
}

const CHILD_ELEMENT_CONVERTERS: Record<string, ChildElementConverter> = {
  text: convertTextInlineChildren,
  ul: (childElements, result, errors) =>
    convertListChildren("Ul", childElements, result, errors),
  ol: (childElements, result, errors) =>
    convertListChildren("Ol", childElements, result, errors),
  processArrow: convertProcessArrowChildren,
  pyramid: convertPyramidChildren,
  timeline: convertTimelineChildren,
  matrix: convertMatrixChildren,
  flow: convertFlowChildren,
  chart: convertChartChildren,
  table: convertTableChildren,
  tree: convertTreeChildren,
  svg: convertSvgChildren,
};

// ===== Node conversion =====
function convertElement(
  node: XmlElement,
  errors: string[],
): Record<string, unknown> | null {
  const tagName = getTagName(node);
  const def = getNodeMetadataByTag(tagName);
  const attrs = getAttributes(node);
  const childElements = getChildElements(node);
  const textContent = getTextContent(node);

  if (def) {
    return convertPomNode(
      def.type,
      tagName,
      attrs,
      childElements,
      textContent,
      errors,
      node,
    );
  } else {
    errors.push(`Unknown tag: <${tagName}>`);
    return null;
  }
}

function convertPomNode(
  nodeType: string,
  tagName: string,
  attrs: Record<string, string>,
  childElements: XmlElement[],
  textContent: string | undefined,
  errors: string[],
  xmlNode?: XmlElement,
): Record<string, unknown> {
  const result: Record<string, unknown> = { type: nodeType };
  const def = getNodeMetadata(nodeType as POMNode["type"]);

  // Expand dot-notation attributes (e.g., fill.color="hex" → { fill: { color: "hex" } })
  const { regular: regularAttrs, dotGroups } = expandDotNotation(attrs);

  for (const [prefix, subAttrs] of Object.entries(dotGroups)) {
    if (prefix === "type") continue;
    const rule = getCoercionRule(nodeType, prefix);
    if (rule) {
      result[prefix] = coerceDotGroup(prefix, subAttrs, rule, tagName, errors);
    } else {
      const knownAttrs = getKnownAttributes(nodeType);
      const suggestion = findClosestMatch(prefix, knownAttrs);
      if (suggestion) {
        errors.push(
          `<${tagName}>: Unknown attribute "${prefix}". Did you mean "${suggestion}"?`,
        );
      } else {
        errors.push(`<${tagName}>: Unknown attribute "${prefix}"`);
      }
    }
  }

  for (const [key, value] of Object.entries(regularAttrs)) {
    if (key === "type") continue;
    // Conflict check: dot-notation and regular attribute for the same key
    if (key in dotGroups) {
      const ruleForConflict = getCoercionRule(nodeType, key);
      if (ruleForConflict) {
        const resolved = resolveMixedNotationShorthand(value, ruleForConflict);
        if (resolved.mode === "ignore") {
          continue;
        }
        if (resolved.mode === "merge") {
          result[key] = {
            ...resolved.value,
            ...(result[key] as Record<string, unknown>),
          };
          continue;
        }
      }
      errors.push(
        `<${tagName}>: Attribute "${key}" conflicts with dot-notation attributes (e.g., "${key}.xxx"). Use one or the other, not both`,
      );
      continue;
    }
    const rule = getCoercionRule(nodeType, key);
    if (rule) {
      const coerced = coerceWithRule(value, rule);
      if (coerced.error !== null) {
        errors.push(`<${tagName}>: ${coerced.error}`);
      } else {
        result[key] = coerced.value;
      }
    } else if (UNIVERSAL_ATTRS.has(key)) {
      // Allow universal attributes (e.g., x/y for Layer children)
      result[key] = coerceFallback(value);
    } else {
      // Unknown attribute
      const knownAttrs = getKnownAttributes(nodeType);
      const suggestion = findClosestMatch(key, knownAttrs);
      if (suggestion) {
        errors.push(
          `<${tagName}>: Unknown attribute "${key}". Did you mean "${suggestion}"?`,
        );
      } else {
        errors.push(`<${tagName}>: Unknown attribute "${key}"`);
      }
    }
  }

  // Text content → text property for nodes that support it
  if (textContent !== undefined && def.textContentProperty) {
    if (!(def.textContentProperty in result)) {
      result[def.textContentProperty] = textContent;
    }
  }

  // Child element notation for complex properties
  const childConverter = CHILD_ELEMENT_CONVERTERS[nodeType];
  if (childConverter && childElements.length > 0) {
    childConverter(childElements, result, errors, xmlNode);
  }
  // Children for container nodes
  else if (
    def.childPolicy.kind === "pom-children" &&
    childElements.length > 0
  ) {
    const convertedChildren = childElements
      .map((child) => convertElement(child, errors))
      .filter((child): child is Record<string, unknown> => child !== null);
    result.children = convertedChildren;
  }
  // Leaf nodes that shouldn't have child elements
  else if (
    def.childPolicy.kind !== "pom-children" &&
    !childConverter &&
    childElements.length > 0
  ) {
    errors.push(
      `<${tagName}>: Unexpected child elements. <${tagName}> does not accept child elements`,
    );
  }

  // Zod validation for leaf nodes
  if (def.childPolicy.kind !== "pom-children") {
    validateLeafNode(nodeType, result, errors);
  }

  // Icon: normalize color / bgColor
  if (nodeType === "icon") {
    if (typeof result.color === "string" && !result.color.startsWith("#")) {
      result.color = `#${result.color}`;
    }
    if (typeof result.bgColor === "string" && !result.bgColor.startsWith("#")) {
      result.bgColor = `#${result.bgColor}`;
    }
  }

  // Svg: normalize color and validate svgContent
  if (nodeType === "svg") {
    if (typeof result.color === "string" && !result.color.startsWith("#")) {
      result.color = `#${result.color}`;
    }
    if (result.svgContent === undefined) {
      errors.push("<Svg>: A <svg> child element is required");
    }
  }

  return result;
}

/**
 * XML 文字列を POMNode 配列に変換する。
 *
 * 最上位は `<Slide>` 要素のみが許容される。各 `<Slide>` が 1 つのスライドに
 * 対応し、その子要素がスライドのルート POMNode となる。子要素が複数ある場合は
 * 暗黙的に VStack でラップされる。
 *
 * XML タグは POM ノードタイプにマッピングされ、属性値は Zod スキーマを参照して
 * 適切な型（number, boolean, array, object）に変換される。
 * 未知のタグ名が指定された場合はエラーがスローされる。
 *
 * @example
 * ```typescript
 * import { parseXml, buildPptx } from "@hirokisakabe/pom";
 *
 * const xml = `
 *   <Slide>
 *     <VStack gap="16" padding="32">
 *       <Text fontSize="32" bold="true">売上レポート</Text>
 *     </VStack>
 *   </Slide>
 * `;
 *
 * const nodes = parseXml(xml);
 * const pptx = await buildPptx(nodes, { w: 1280, h: 720 });
 * ```
 */
export function parseXml(xmlString: string): POMNode[] {
  if (!xmlString.trim()) return [];

  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: false,
  });

  const wrappedXml = `<__root__>${xmlString}</__root__>`;
  const parsed: XmlElement[] = parser.parse(wrappedXml) as XmlElement[];

  if (!parsed || parsed.length === 0) return [];

  const rootElement = parsed[0];
  const rootChildren = (rootElement["__root__"] ?? []) as XmlNode[];

  const errors: string[] = [];
  const slideElements = rootChildren.filter(
    (child): child is XmlElement => !isTextNode(child),
  );

  const nodes: POMNode[] = [];
  for (const slideEl of slideElements) {
    const tagName = getTagName(slideEl);
    if (tagName !== "Slide") {
      errors.push(
        `Top-level element must be <Slide>, but got <${tagName}>. Wrap your slide content in <Slide>...</Slide>.`,
      );
      continue;
    }
    if (Object.keys(getAttributes(slideEl)).length > 0) {
      errors.push(`<Slide>: Attributes are not supported`);
    }
    const slideChildren = getChildElements(slideEl);
    if (slideChildren.length === 0) {
      errors.push(`<Slide> must contain at least one child element`);
      continue;
    }
    const converted = slideChildren
      .map((child) => convertElement(child, errors))
      .filter((c): c is Record<string, unknown> => c !== null);
    if (converted.length === 0) continue;
    if (converted.length === 1) {
      nodes.push(converted[0] as POMNode);
    } else {
      nodes.push({
        type: "vstack",
        children: converted,
      } as POMNode);
    }
  }

  if (errors.length > 0) {
    throw new ParseXmlError(errors);
  }

  return nodes;
}
