import type { POMNode } from "../types.ts";
import { TAG_TO_TYPE } from "./parseXml.ts";

const TYPE_TO_TAG: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_TO_TYPE).map(([tag, type]) => [type, tag]),
);

const SKIP_KEYS = new Set(["type", "children", "runs", "svgContent"]);

const CONTAINER_TYPES = new Set(["vstack", "hstack", "layer"]);

function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
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

  const attrStr = serializeAttrs(nodeRecord);
  return `${indent}<${tag}${attrStr} />`;
}

/**
 * POMNode 配列を XML 文字列に変換する。
 *
 * parseXml の逆操作として機能するが、変換は非可逆（インラインフォーマットタグや
 * child element 記法は正規化された属性形式に変換される）。
 * ただし意味論的等価であれば問題なし。
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
