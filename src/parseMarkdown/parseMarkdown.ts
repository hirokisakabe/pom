import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Root, Content } from "mdast";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function extractTextContent(node: Content): string {
  switch (node.type) {
    case "text":
      return node.value;
    case "emphasis":
    case "strong":
    case "delete":
    case "link":
      return node.children.map(extractTextContent).join("");
    case "inlineCode":
      return node.value;
    default:
      return "";
  }
}

function convertNode(node: Content): string {
  switch (node.type) {
    case "heading": {
      const text = node.children.map(extractTextContent).join("");
      const fontPxMap: Record<number, number> = {
        1: 40,
        2: 32,
        3: 28,
      };
      const fontPx = fontPxMap[node.depth] ?? 24;
      return `<Text fontPx="${fontPx}" bold="true">${escapeXml(text)}</Text>`;
    }
    case "paragraph": {
      const text = node.children.map(extractTextContent).join("");
      return `<Text>${escapeXml(text)}</Text>`;
    }
    case "list": {
      const tag = node.ordered ? "Ol" : "Ul";
      const items = node.children
        .map((li) => {
          const text = li.children
            .map((child) => {
              if (child.type === "paragraph") {
                return child.children.map(extractTextContent).join("");
              }
              return "";
            })
            .join("");
          return `<Li>${escapeXml(text)}</Li>`;
        })
        .join("\n    ");
      return `<${tag}>\n    ${items}\n  </${tag}>`;
    }
    case "html": {
      const pomMatch = node.value.match(/^<pom>([\s\S]*)<\/pom>$/);
      if (pomMatch) {
        return pomMatch[1].trim();
      }
      return "";
    }
    case "thematicBreak":
      return "";
    default:
      return "";
  }
}

/**
 * Markdown 文字列を POM XML 文字列に変換する。
 *
 * - `---` によるスライド分割
 * - 見出し（h1〜h3）→ `<Text fontPx="..." bold="true">`
 * - テキスト段落 → `<Text>`
 * - 箇条書き（ul）→ `<Ul><Li>...</Li></Ul>`
 * - 番号付きリスト（ol）→ `<Ol><Li>...</Li></Ol>`
 * - `<pom>...</pom>` ブロックのパススルー
 */
export function parseMarkdown(md: string): string {
  const processor = unified().use(remarkParse);
  const tree: Root = processor.parse(md);

  // Split nodes by thematic breaks (---)
  const slides: Content[][] = [[]];
  for (const node of tree.children) {
    if (node.type === "thematicBreak") {
      slides.push([]);
    } else {
      slides[slides.length - 1].push(node);
    }
  }

  const xmlSlides = slides
    .filter((slideNodes) => slideNodes.length > 0)
    .map((slideNodes) => {
      const children = slideNodes.map(convertNode).filter((xml) => xml !== "");
      return children.length > 0
        ? `<VStack gap="16" padding="32">\n  ${children.join("\n  ")}\n</VStack>`
        : "";
    })
    .filter((xml) => xml !== "");

  return xmlSlides.join("\n");
}
