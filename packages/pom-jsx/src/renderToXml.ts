import type { ReactNode } from "./types.ts";

function escapeXmlDouble(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeXmlSingle(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;");
}

function buildAttrString(props: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (key === "children") continue;
    if (value === undefined || value === null || value === false) continue;
    if (typeof value === "object") {
      parts.push(`${key}='${escapeXmlSingle(JSON.stringify(value))}'`);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      parts.push(`${key}="${escapeXmlDouble(String(value))}"`);
    }
  }
  return parts.length > 0 ? " " + parts.join(" ") : "";
}

function normalizeChildren(children: unknown): ReactNode[] {
  if (children === undefined || children === null) return [];
  if (Array.isArray(children)) {
    return children.flatMap((c: unknown) => normalizeChildren(c));
  }
  return [children as ReactNode];
}

function nodeToXml(node: ReactNode): string {
  if (node === null || node === undefined || node === false || node === true) {
    return "";
  }
  if (typeof node === "string") return escapeXmlDouble(node);
  if (typeof node === "number") return String(node);
  if (Array.isArray(node))
    return node.map((n: ReactNode) => nodeToXml(n)).join("");

  const { type, props } = node;

  if (type === "__Fragment__") {
    return normalizeChildren(props.children).map(nodeToXml).join("");
  }

  const attrStr = buildAttrString(props);
  const children = normalizeChildren(props.children);

  if (children.length === 0) {
    return `<${type}${attrStr} />`;
  }

  return `<${type}${attrStr}>${children.map(nodeToXml).join("")}</${type}>`;
}

export function renderToXml(element: ReactNode): string {
  return nodeToXml(element);
}
