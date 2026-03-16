import { XMLParser } from "fast-xml-parser";
import { z } from "zod";
import type { POMNode } from "../types.ts";
import {
  inputTextNodeSchema,
  inputUlNodeSchema,
  inputOlNodeSchema,
  inputLiNodeSchema,
  inputImageNodeSchema,
  inputTableNodeSchema,
  inputShapeNodeSchema,
  inputChartNodeSchema,
  inputTimelineNodeSchema,
  inputMatrixNodeSchema,
  inputTreeNodeSchema,
  inputFlowNodeSchema,
  inputProcessArrowNodeSchema,
  inputPyramidNodeSchema,
  inputLineNodeSchema,
  inputBaseNodeSchema,
} from "./inputSchema.ts";
import {
  alignItemsSchema,
  justifyContentSchema,
  shadowStyleSchema,
  processArrowStepSchema,
  pyramidLevelSchema,
  timelineItemSchema,
  matrixAxisSchema,
  matrixQuadrantsSchema,
  matrixItemSchema,
  flowNodeItemSchema,
  flowConnectionSchema,
  chartDataSchema,
  tableColumnSchema,
  tableCellSchema,
} from "../types.ts";

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
const TAG_TO_TYPE: Record<string, string> = {
  Text: "text",
  Image: "image",
  Table: "table",
  Shape: "shape",
  Chart: "chart",
  Timeline: "timeline",
  Matrix: "matrix",
  Tree: "tree",
  Flow: "flow",
  ProcessArrow: "processArrow",
  Pyramid: "pyramid",
  Ul: "ul",
  Ol: "ol",
  Line: "line",
  Box: "box",
  VStack: "vstack",
  HStack: "hstack",
  Layer: "layer",
};

// Reverse mapping: node type → tag name
const TYPE_TO_TAG: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_TO_TYPE).map(([tag, type]) => [type, tag]),
);

// ===== Node schemas for property type coercion =====
// Extract shape from ZodObject schemas for property type lookup.
// Use Record<string, z.ZodTypeAny> directly to avoid Zod v4 type issues.
type ShapeRecord = Record<string, z.ZodTypeAny>;

function extractShape(schema: z.ZodTypeAny): ShapeRecord {
  return (schema as unknown as { shape: ShapeRecord }).shape;
}

const leafNodeShapes: Record<string, ShapeRecord> = {
  text: extractShape(inputTextNodeSchema),
  image: extractShape(inputImageNodeSchema),
  table: extractShape(inputTableNodeSchema),
  shape: extractShape(inputShapeNodeSchema),
  chart: extractShape(inputChartNodeSchema),
  timeline: extractShape(inputTimelineNodeSchema),
  matrix: extractShape(inputMatrixNodeSchema),
  tree: extractShape(inputTreeNodeSchema),
  flow: extractShape(inputFlowNodeSchema),
  processArrow: extractShape(inputProcessArrowNodeSchema),
  pyramid: extractShape(inputPyramidNodeSchema),
  line: extractShape(inputLineNodeSchema),
  ul: extractShape(inputUlNodeSchema),
  ol: extractShape(inputOlNodeSchema),
};

const containerShapes: Record<string, ShapeRecord> = {
  box: extractShape(
    inputBaseNodeSchema.extend({ shadow: shadowStyleSchema.optional() }),
  ),
  vstack: extractShape(
    inputBaseNodeSchema.extend({
      gap: z.number().optional(),
      alignItems: alignItemsSchema.optional(),
      justifyContent: justifyContentSchema.optional(),
    }),
  ),
  hstack: extractShape(
    inputBaseNodeSchema.extend({
      gap: z.number().optional(),
      alignItems: alignItemsSchema.optional(),
      justifyContent: justifyContentSchema.optional(),
    }),
  ),
  layer: extractShape(inputBaseNodeSchema),
};

const CONTAINER_TYPES = new Set(["box", "vstack", "hstack", "layer"]);
const TEXT_CONTENT_NODES = new Set(["text", "shape"]);
// Attributes allowed on any node (e.g., x/y for Layer children positioning)
const UNIVERSAL_ATTRS = new Set(["x", "y"]);

// ===== Validation helpers =====
function getKnownAttributes(nodeType: string): string[] {
  const shape = leafNodeShapes[nodeType] ?? containerShapes[nodeType];
  if (!shape) return [];
  return Object.keys(shape).filter((k) => k !== "type");
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
  const shape = childElementShapes[tagName];
  if (!shape) return [];
  return Object.keys(shape);
}

// ===== Leaf node Zod validation schemas =====
const leafNodeValidationSchemas: Record<string, z.ZodTypeAny> = {
  text: inputTextNodeSchema,
  image: inputImageNodeSchema,
  table: inputTableNodeSchema,
  shape: inputShapeNodeSchema,
  chart: inputChartNodeSchema,
  timeline: inputTimelineNodeSchema,
  matrix: inputMatrixNodeSchema,
  tree: inputTreeNodeSchema,
  flow: inputFlowNodeSchema,
  processArrow: inputProcessArrowNodeSchema,
  pyramid: inputPyramidNodeSchema,
  line: inputLineNodeSchema,
  ul: inputUlNodeSchema,
  ol: inputOlNodeSchema,
};

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
const CHILD_ELEMENT_PROPS: Record<string, Set<string>> = {
  flow: new Set(["nodes", "connections"]),
  table: new Set(["columns", "rows"]),
  chart: new Set(["data"]),
  timeline: new Set(["items"]),
  matrix: new Set(["axes", "items", "quadrants"]),
  processArrow: new Set(["steps"]),
  pyramid: new Set(["levels"]),
  tree: new Set(["data"]),
  ul: new Set(["items"]),
  ol: new Set(["items"]),
};

function validateLeafNode(
  nodeType: string,
  result: Record<string, unknown>,
  errors: string[],
): void {
  const schema = leafNodeValidationSchemas[nodeType];
  if (!schema) return;
  const tagName = TYPE_TO_TAG[nodeType] ?? nodeType;
  const childProps = CHILD_ELEMENT_PROPS[nodeType];
  const parseResult = schema.safeParse(result);
  if (!parseResult.success) {
    const seen = new Set<string>();
    for (const issue of parseResult.error.issues) {
      // Skip only top-level missing child-element properties (path.length === 1)
      // Nested issues (e.g., data.children[0].label) must still be reported
      if (
        childProps &&
        issue.path.length === 1 &&
        childProps.has(String(issue.path[0])) &&
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
  [tagName: string]: XmlNode[] | Record<string, string>;
  ":@"?: Record<string, string>;
}

// ===== Zod schema introspection (Zod v4 compatible) =====
// Zod internal _def structure varies by version. Access via unknown to avoid type errors.
type ZodDef = Record<string, unknown>;

function getDef(schema: z.ZodTypeAny): ZodDef {
  return schema._def as unknown as ZodDef;
}

function getPropertySchema(
  nodeType: string,
  propertyName: string,
): z.ZodTypeAny | undefined {
  const shape = leafNodeShapes[nodeType] ?? containerShapes[nodeType];
  if (!shape) return undefined;
  return shape[propertyName];
}

function getZodType(schema: z.ZodTypeAny): string {
  const def = getDef(schema);
  return (def.type ?? def.typeName ?? "") as string;
}

function unwrapSchema(schema: z.ZodTypeAny): z.ZodTypeAny {
  const typeName = getZodType(schema);
  const def = getDef(schema);
  switch (typeName) {
    case "optional":
    case "default":
    case "nullable":
      return unwrapSchema(def.innerType as z.ZodTypeAny);
    case "lazy":
      return unwrapSchema((def.getter as () => z.ZodTypeAny)());
    case "pipe":
      return unwrapSchema(def.in as z.ZodTypeAny);
    default:
      return schema;
  }
}

function resolveZodTypeName(schema: z.ZodTypeAny): string {
  return getZodType(unwrapSchema(schema));
}

/**
 * Normalize a relaxed JSON-like string so that unquoted keys become valid JSON.
 * e.g. `{top:24,bottom:24}` → `{"top":24,"bottom":24}`
 */
function normalizeJsonLike(value: string): string {
  return value.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');
}

/**
 * Try to parse a JSON string, normalizing unquoted keys if needed.
 */
function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    const normalized = normalizeJsonLike(value);
    return JSON.parse(normalized);
  }
}

// ===== Value coercion =====
// Returns { value, error } — if error is non-null, coercion failed.
function coerceValue(
  value: string,
  schema: z.ZodTypeAny,
): { value: unknown; error: string | null } {
  const unwrapped = unwrapSchema(schema);
  const typeName = getZodType(unwrapped);
  const def = getDef(unwrapped);

  switch (typeName) {
    case "number": {
      const num = Number(value);
      if (isNaN(num)) {
        return {
          value: undefined,
          error: `Cannot convert "${value}" to number`,
        };
      }
      return { value: num, error: null };
    }
    case "boolean":
      if (value !== "true" && value !== "false") {
        return {
          value: undefined,
          error: `Cannot convert "${value}" to boolean (expected "true" or "false")`,
        };
      }
      return { value: value === "true", error: null };
    case "string":
    case "enum":
      return { value, error: null };
    case "literal": {
      const values = def.values as unknown[] | undefined;
      const singleValue = def.value;
      return { value: values?.[0] ?? singleValue, error: null };
    }
    case "array":
    case "object":
    case "record":
    case "tuple":
      try {
        return { value: tryParseJson(value), error: null };
      } catch {
        return {
          value: undefined,
          error: `Cannot parse JSON value: "${value}"`,
        };
      }
    case "union": {
      const options = def.options as z.ZodTypeAny[];
      return { value: coerceUnionValue(value, options), error: null };
    }
    default:
      return { value: coerceFallback(value), error: null };
  }
}

function coerceUnionValue(value: string, options: z.ZodTypeAny[]): unknown {
  const typeNames = options.map((opt) => resolveZodTypeName(opt));

  // Try boolean
  if (
    (value === "true" || value === "false") &&
    typeNames.includes("boolean")
  ) {
    return value === "true";
  }

  // Try number
  if (typeNames.includes("number")) {
    const num = Number(value);
    if (!isNaN(num) && value !== "") {
      return num;
    }
  }

  // Try literal
  for (let i = 0; i < options.length; i++) {
    if (typeNames[i] === "literal") {
      const unwrapped = unwrapSchema(options[i]);
      const def = getDef(unwrapped);
      const values = def.values as unknown[] | undefined;
      const singleValue = def.value;
      const litVal = values?.[0] ?? singleValue;
      if (litVal != null && `${litVal as string | number}` === value)
        return litVal;
    }
  }

  // Try JSON parse for objects/arrays
  if (
    typeNames.some((t) => ["array", "object", "record", "tuple"].includes(t))
  ) {
    if (value.startsWith("{") || value.startsWith("[")) {
      try {
        return tryParseJson(value);
      } catch {
        /* ignore */
      }
    }
  }

  // Fallback to string
  return value;
}

function coerceFallback(value: string): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  const num = Number(value);
  if (value !== "" && !isNaN(num)) return num;
  if (value.startsWith("{") || value.startsWith("[")) {
    try {
      return tryParseJson(value);
    } catch {
      /* ignore */
    }
  }
  return value;
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
      attrs[attrName] = value;
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

// ===== Child element schemas for type coercion =====
const childElementShapes: Record<string, ShapeRecord> = {
  ProcessArrowStep: extractShape(processArrowStepSchema),
  PyramidLevel: extractShape(pyramidLevelSchema),
  TimelineItem: extractShape(timelineItemSchema),
  MatrixAxes: extractShape(matrixAxisSchema),
  MatrixQuadrants: extractShape(matrixQuadrantsSchema),
  MatrixItem: extractShape(matrixItemSchema),
  FlowNode: extractShape(flowNodeItemSchema),
  FlowConnection: extractShape(flowConnectionSchema),
  TableColumn: extractShape(tableColumnSchema),
  TableCell: extractShape(tableCellSchema),
  Li: extractShape(inputLiNodeSchema),
};

function coerceChildAttrs(
  parentTagName: string,
  tagName: string,
  attrs: Record<string, string>,
  errors: string[],
): Record<string, unknown> {
  const shape = childElementShapes[tagName];
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attrs)) {
    if (shape && shape[key]) {
      const coerced = coerceValue(value, shape[key]);
      if (coerced.error !== null) {
        errors.push(`<${parentTagName}>.<${tagName}>: ${coerced.error}`);
      } else {
        result[key] = coerced.value;
      }
    } else if (shape) {
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
  const dataShape = extractShape(chartDataSchema);
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
      const nameSchema = dataShape.name;
      if (nameSchema) {
        const coerced = coerceValue(attrs.name, nameSchema);
        if (coerced.error !== null) {
          errors.push(`<Chart>.<ChartSeries>: ${coerced.error}`);
        } else {
          series.name = coerced.value;
        }
      } else {
        series.name = attrs.name;
      }
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
      case "TableColumn":
        columns.push(
          coerceChildAttrs("Table", tag, getAttributes(child), errors),
        );
        break;
      case "TableRow": {
        const rowAttrs = getAttributes(child);
        const cells: Record<string, unknown>[] = [];
        for (const cellEl of getChildElements(child)) {
          const cellTag = getTagName(cellEl);
          if (cellTag !== "TableCell") {
            errors.push(
              `Unknown child element <${cellTag}> inside <TableRow>. Expected: <TableCell>`,
            );
            continue;
          }
          const cellAttrs = coerceChildAttrs(
            "TableRow",
            cellTag,
            getAttributes(cellEl),
            errors,
          );
          const cellText = getTextContent(cellEl);
          if (cellText !== undefined && !("text" in cellAttrs)) {
            cellAttrs.text = cellText;
          }
          cells.push(cellAttrs);
        }
        const row: Record<string, unknown> = { cells };
        if (rowAttrs.height !== undefined) {
          const h = Number(rowAttrs.height);
          if (isNaN(h)) {
            errors.push(
              `Cannot convert "${rowAttrs.height}" to number in <TableRow> "height" attribute`,
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
          `Unknown child element <${tag}> inside <Table>. Expected: <TableColumn> or <TableRow>`,
        );
    }
  }
  if (columns.length > 0) {
    result.columns = columns;
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
    const textContent = getTextContent(child);
    if (textContent !== undefined && !("text" in attrs)) {
      attrs.text = textContent;
    }
    items.push(attrs);
  }
  result.items = items;
}

const CHILD_ELEMENT_CONVERTERS: Record<string, ChildElementConverter> = {
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
};

// ===== Node conversion =====
function convertElement(
  node: XmlElement,
  errors: string[],
): Record<string, unknown> | null {
  const tagName = getTagName(node);
  const nodeType = TAG_TO_TYPE[tagName];
  const attrs = getAttributes(node);
  const childElements = getChildElements(node);
  const textContent = getTextContent(node);

  if (nodeType) {
    return convertPomNode(
      nodeType,
      tagName,
      attrs,
      childElements,
      textContent,
      errors,
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
): Record<string, unknown> {
  const result: Record<string, unknown> = { type: nodeType };

  for (const [key, value] of Object.entries(attrs)) {
    if (key === "type") continue;
    const propSchema = getPropertySchema(nodeType, key);
    if (propSchema) {
      const coerced = coerceValue(value, propSchema);
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
  if (textContent !== undefined && TEXT_CONTENT_NODES.has(nodeType)) {
    if (!("text" in result)) {
      result.text = textContent;
    }
  }

  // Child element notation for complex properties
  const childConverter = CHILD_ELEMENT_CONVERTERS[nodeType];
  if (childConverter && childElements.length > 0) {
    childConverter(childElements, result, errors);
  }
  // Children for container nodes
  else if (CONTAINER_TYPES.has(nodeType) && childElements.length > 0) {
    const convertedChildren = childElements
      .map((child) => convertElement(child, errors))
      .filter((child): child is Record<string, unknown> => child !== null);
    if (nodeType === "box") {
      if (childElements.length !== 1) {
        errors.push(
          `<Box> must have exactly 1 child element, but got ${childElements.length}`,
        );
      }
      if (convertedChildren.length > 0) {
        result.children = convertedChildren[0];
      }
    } else {
      result.children = convertedChildren;
    }
  }
  // Leaf nodes that shouldn't have child elements
  else if (
    !CONTAINER_TYPES.has(nodeType) &&
    !childConverter &&
    childElements.length > 0
  ) {
    errors.push(
      `<${tagName}>: Unexpected child elements. <${tagName}> does not accept child elements`,
    );
  }

  // Zod validation for leaf nodes
  if (!CONTAINER_TYPES.has(nodeType)) {
    validateLeafNode(nodeType, result, errors);
  }

  return result;
}

/**
 * XML 文字列を POMNode 配列に変換する。
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
 *   <VStack gap="16" padding="32">
 *     <Text fontPx="32" bold="true">売上レポート</Text>
 *   </VStack>
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
    trimValues: true,
  });

  const wrappedXml = `<__root__>${xmlString}</__root__>`;
  const parsed: XmlElement[] = parser.parse(wrappedXml) as XmlElement[];

  if (!parsed || parsed.length === 0) return [];

  const rootElement = parsed[0];
  const rootChildren = (rootElement["__root__"] ?? []) as XmlNode[];

  const errors: string[] = [];
  const nodes = rootChildren
    .filter((child): child is XmlElement => !isTextNode(child))
    .map((child) => convertElement(child, errors))
    .filter(
      (child): child is Record<string, unknown> => child !== null,
    ) as POMNode[];

  if (errors.length > 0) {
    throw new ParseXmlError(errors);
  }

  return nodes;
}
