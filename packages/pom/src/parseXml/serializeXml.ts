import type { POMNode } from "../types.ts";
import { TAG_TO_TYPE } from "./parseXml.ts";

const TYPE_TO_TAG: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_TO_TYPE).map(([tag, type]) => [type, tag]),
);

// runs と svgContent は専用の直列化パスで処理する
const SKIP_KEYS = new Set(["type", "children", "runs", "svgContent"]);

// runs によるインライン装飾を child element として直列化するノードタイプ
const INLINE_CONTENT_TYPES = new Set(["text", "shape"]);

const CONTAINER_TYPES = new Set(["vstack", "hstack", "layer"]);

interface TextRun {
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
}

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeXmlContent(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function serializePrimitive(value: string | number | boolean): string {
  if (typeof value === "string") return escapeAttrValue(value);
  if (typeof value === "number") return String(value);
  return value ? "true" : "false";
}

function serializeAttrs(node: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(node)) {
    if (SKIP_KEYS.has(key) || value === undefined) continue;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(
        value as Record<string, unknown>,
      )) {
        if (subValue !== undefined) {
          parts.push(
            `${key}.${subKey}="${serializePrimitive(subValue as string | number | boolean)}"`,
          );
        }
      }
    } else if (Array.isArray(value)) {
      parts.push(`${key}="${escapeAttrValue(JSON.stringify(value))}"`);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      parts.push(`${key}="${serializePrimitive(value)}"`);
    }
  }
  return parts.length > 0 ? " " + parts.join(" ") : "";
}

function serializeRun(run: TextRun): string {
  let content = escapeXmlContent(run.text);

  if (run.href) {
    content = `<A href="${escapeAttrValue(run.href)}">${content}</A>`;
  }
  if (run.highlight) {
    content = `<Mark color="${escapeAttrValue(run.highlight)}">${content}</Mark>`;
  }
  const spanAttrs: string[] = [];
  if (run.color) spanAttrs.push(`color="${escapeAttrValue(run.color)}"`);
  if (run.fontFamily)
    spanAttrs.push(`fontFamily="${escapeAttrValue(run.fontFamily)}"`);
  if (run.letterSpacing !== undefined)
    spanAttrs.push(`letterSpacing="${run.letterSpacing}"`);
  if (spanAttrs.length > 0) {
    content = `<Span ${spanAttrs.join(" ")}>${content}</Span>`;
  }
  if (run.strike) content = `<S>${content}</S>`;
  if (run.underline) content = `<U>${content}</U>`;
  if (run.italic) content = `<I>${content}</I>`;
  if (run.bold) content = `<B>${content}</B>`;
  return content;
}

function serializeRuns(runs: TextRun[]): string {
  return runs.map(serializeRun).join("");
}

function serializeNode(node: POMNode, depth: number): string {
  const indent = "  ".repeat(depth);
  const tag = TYPE_TO_TAG[node.type];
  const nodeRecord = node as Record<string, unknown>;

  if (CONTAINER_TYPES.has(node.type)) {
    const children = (nodeRecord.children as POMNode[]) ?? [];
    const attrStr = serializeAttrs(nodeRecord);
    if (children.length === 0) {
      return `${indent}<${tag}${attrStr} />`;
    }
    const childrenStr = children
      .map((c) => serializeNode(c, depth + 1))
      .join("\n");
    return `${indent}<${tag}${attrStr}>\n${childrenStr}\n${indent}</${tag}>`;
  }

  if (node.type === "svg") {
    const svgContent = (nodeRecord.svgContent as string) ?? "";
    const attrStr = serializeAttrs(nodeRecord);
    return `${indent}<${tag}${attrStr}>\n${svgContent}\n${indent}</${tag}>`;
  }

  // Text / Shape: runs があればインライン child element として直列化し装飾を保持する
  if (
    INLINE_CONTENT_TYPES.has(node.type) &&
    Array.isArray(nodeRecord.runs) &&
    (nodeRecord.runs as unknown[]).length > 0
  ) {
    const runs = nodeRecord.runs as TextRun[];
    // runs がある場合、text は runs から復元できるため属性からも除外する
    const attrsWithoutText = { ...nodeRecord, text: undefined };
    const attrStr = serializeAttrs(attrsWithoutText);
    const inlineContent = serializeRuns(runs);
    return `${indent}<${tag}${attrStr}>${inlineContent}</${tag}>`;
  }

  const attrStr = serializeAttrs(nodeRecord);
  return `${indent}<${tag}${attrStr} />`;
}

/**
 * POMNode 配列を XML 文字列に変換する。
 *
 * parseXml の逆操作として機能する。runs（インライン装飾）は B/I/A/U/S/Mark/Span
 * タグとして child element に直列化されるため、テキストの装飾情報も保持される。
 *
 * @example
 * ```typescript
 * import { parseXml, serializeXml } from "@hirokisakabe/pom";
 *
 * const nodes = parseXml(xml);
 * // ... ノードの並び替えなど ...
 * const newXml = serializeXml(nodes);
 * ```
 */
export function serializeXml(nodes: POMNode[]): string {
  return nodes
    .map((node) => `<Slide>\n${serializeNode(node, 1)}\n</Slide>`)
    .join("\n");
}
