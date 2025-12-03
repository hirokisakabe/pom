import { calcYogaLayout } from "./calcYogaLayout/calcYogaLayout";
import { renderPptx } from "./renderPptx/renderPptx";
import { toPositioned } from "./toPositioned/toPositioned";
import { POMNode, PositionedNode, MasterSlideOptions } from "./types";

function replacePlaceholders(
  node: POMNode,
  pageNumber: number,
  totalPages: number,
  date: string,
): POMNode {
  if (node.type === "text") {
    return {
      ...node,
      text: node.text
        .replace(/\{\{page\}\}/g, String(pageNumber))
        .replace(/\{\{totalPages\}\}/g, String(totalPages))
        .replace(/\{\{date\}\}/g, date),
    };
  }

  if (node.type === "box") {
    return {
      ...node,
      children: replacePlaceholders(
        node.children,
        pageNumber,
        totalPages,
        date,
      ),
    };
  }

  if (node.type === "vstack" || node.type === "hstack") {
    return {
      ...node,
      children: node.children.map((child) =>
        replacePlaceholders(child, pageNumber, totalPages, date),
      ),
    };
  }

  return node;
}

function composePage(
  content: POMNode,
  master: MasterSlideOptions | undefined,
  pageNumber: number,
  totalPages: number,
): POMNode {
  if (!master) {
    return content;
  }

  const date =
    master.date?.format === "locale"
      ? new Date().toLocaleDateString()
      : new Date().toISOString().split("T")[0].replace(/-/g, "/");

  const children: POMNode[] = [];

  // ヘッダーを追加
  if (master.header) {
    children.push(
      replacePlaceholders(master.header, pageNumber, totalPages, date),
    );
  }

  // コンテンツを追加
  children.push(content);

  // フッターを追加
  if (master.footer) {
    children.push(
      replacePlaceholders(master.footer, pageNumber, totalPages, date),
    );
  }

  // ページ番号を追加
  if (master.pageNumber) {
    const pageNumberNode: POMNode = {
      type: "text",
      text: String(pageNumber),
      fontPx: 12,
      alignText: master.pageNumber.position,
    };
    children.push(pageNumberNode);
  }

  return {
    type: "vstack",
    w: "100%",
    h: "100%",
    alignItems: "stretch",
    justifyContent: "start",
    children,
  };
}

export async function buildPptx(
  nodes: POMNode[],
  slideSize: { w: number; h: number },
  options?: { master?: MasterSlideOptions },
) {
  const positionedPages: PositionedNode[] = [];
  const totalPages = nodes.length;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const composedNode = composePage(node, options?.master, i + 1, totalPages);
    await calcYogaLayout(composedNode, slideSize);
    const positioned = toPositioned(composedNode);
    positionedPages.push(positioned);
  }

  const pptx = renderPptx(positionedPages, slideSize);

  return pptx;
}
