import { createRequire } from "module";
import type { POMNode, HStackNode, VStackNode } from "../types";
import type { ParsedPptx, ParsePptxOptions, Element, Slide } from "./types";
import { ptToPx } from "./units";
import { convertText } from "./convertText";
import { convertImage } from "./convertImage";
import { convertShape } from "./convertShape";
import { convertTable } from "./convertTable";
import { convertChart } from "./convertChart";
import { measureText } from "../calcYogaLayout/measureText";

export type { ParsedPptx, ParsePptxOptions };

// ESM/CJS互換性のため、createRequireを使用してpptxtojsonをインポート
// pptxtojsonはUMD形式を提供しており、ESMインポートでは問題が発生する環境がある
const require = createRequire(import.meta.url);

type ParseFn = (
  file: ArrayBuffer,
  options?: { slideFactor?: number; fontsizeFactor?: number },
) => Promise<{ slides: Slide[]; size: { width: number; height: number } }>;

type PptxtojsonModule = {
  parse?: ParseFn;
  default?: { parse?: ParseFn };
};

const pptxtojson: PptxtojsonModule = require("pptxtojson") as PptxtojsonModule;

function getParseFn(): ParseFn {
  if (typeof pptxtojson.parse === "function") {
    return pptxtojson.parse;
  }
  if (pptxtojson.default && typeof pptxtojson.default.parse === "function") {
    return pptxtojson.default.parse;
  }
  throw new Error("pptxtojson.parse function not found");
}

/**
 * サポートされる要素タイプ
 */
const SUPPORTED_ELEMENT_TYPES = ["text", "image", "shape", "table", "chart"];

/**
 * 要素がサポートされているかチェック
 */
function isSupported(element: Element): boolean {
  return SUPPORTED_ELEMENT_TYPES.includes(element.type);
}

/**
 * pptxtojsonの要素をPOMNodeに変換
 */
function convertElement(element: Element): POMNode | null {
  switch (element.type) {
    case "text":
      return convertText(element);
    case "image":
      return convertImage(element);
    case "shape":
      return convertShape(element);
    case "table":
      return convertTable(element);
    case "chart":
      return convertChart(element);
    case "group":
      // グループ内の要素をフラット化して返す（最初の要素のみ）
      // 注: グループ全体を適切に処理するには追加の実装が必要
      return null;
    case "diagram":
      // diagramはフラット化してshapeとして扱う可能性があるが、
      // 現時点では未対応
      return null;
    default:
      return null;
  }
}

/**
 * 位置情報を持つ要素
 */
type ElementWithPosition = {
  element: Element;
  node: POMNode;
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * 包含関係ツリーのノード
 */
type ContainmentTreeNode = {
  element: ElementWithPosition;
  children: ContainmentTreeNode[];
};

/**
 * 行グループ化の閾値（px）
 * top座標がこの値以内なら同じ行として扱う
 */
const ROW_THRESHOLD_TOP = 20;

/**
 * POMNode の実際のコンテンツサイズを計測
 * measureText を使ってテキストの実際のサイズを取得する
 */
function measureNodeSize(
  node: POMNode,
  originalWidth: number,
  originalHeight: number,
): { width: number; height: number } {
  if (node.type === "text") {
    const { widthPx, heightPx } = measureText(node.text, originalWidth, {
      fontFamily: node.fontFamily ?? "sans-serif",
      fontSizePx: node.fontPx ?? 16,
      fontWeight: node.bold ? "bold" : "normal",
      lineHeight: 1.2,
    });
    return { width: widthPx, height: heightPx };
  }

  if (node.type === "shape" && node.text) {
    const { widthPx, heightPx } = measureText(node.text, originalWidth, {
      fontFamily: "sans-serif",
      fontSizePx: node.fontPx ?? 16,
      fontWeight: node.bold ? "bold" : "normal",
      lineHeight: 1.2,
    });
    return { width: widthPx, height: heightPx };
  }

  // Image, Table, Chart, テキストなしShape は元のサイズを使用
  return { width: originalWidth, height: originalHeight };
}

/**
 * 要素Aが要素Bを完全に包含しているかチェック
 * order（Z順序）も考慮: 背面の要素（order小）が前面の要素（order大）を包含する関係のみ許可
 */
function containsElement(
  container: ElementWithPosition,
  contained: ElementWithPosition,
): boolean {
  // order チェック: container は contained より背面（order が小さい）でなければならない
  const containerOrder = container.element.order ?? 0;
  const containedOrder = contained.element.order ?? 0;
  if (containerOrder >= containedOrder) {
    return false;
  }

  // 位置による完全包含チェック
  return (
    container.left <= contained.left &&
    container.top <= contained.top &&
    container.left + container.width >= contained.left + contained.width &&
    container.top + container.height >= contained.top + contained.height
  );
}

/**
 * 要素の面積を計算
 */
function getArea(el: ElementWithPosition): number {
  return el.width * el.height;
}

/**
 * 各要素の直接の親を決定
 * 親 = その要素を包含する要素のうち、最も面積が小さいもの
 */
function findDirectParents(
  elements: ElementWithPosition[],
): Map<ElementWithPosition, ElementWithPosition | null> {
  const directParent = new Map<
    ElementWithPosition,
    ElementWithPosition | null
  >();

  for (const el of elements) {
    // この要素を包含する全ての要素を収集
    const containers = elements.filter(
      (other) => other !== el && containsElement(other, el),
    );

    if (containers.length === 0) {
      // 親なし（ルート要素）
      directParent.set(el, null);
    } else {
      // 最小面積の包含要素を親とする
      const smallestContainer = containers.reduce((a, b) =>
        getArea(a) < getArea(b) ? a : b,
      );
      directParent.set(el, smallestContainer);
    }
  }

  return directParent;
}

/**
 * 包含関係ツリーを構築
 */
function buildContainmentTree(
  elements: ElementWithPosition[],
): ContainmentTreeNode[] {
  if (elements.length === 0) return [];

  const directParent = findDirectParents(elements);

  // ルート要素（親がない要素）を収集
  const roots = elements.filter((el) => directParent.get(el) === null);

  // 再帰的にツリーを構築
  function buildNode(element: ElementWithPosition): ContainmentTreeNode {
    const children = elements
      .filter((el) => directParent.get(el) === element)
      .map(buildNode);
    return { element, children };
  }

  return roots.map(buildNode);
}

/**
 * 要素から背景色を取得
 */
function getBackgroundColor(el: ElementWithPosition): string | undefined {
  if (el.element.type !== "shape") {
    return undefined;
  }
  const fill = el.element.fill;
  if (fill && fill.type === "color") {
    // #RRGGBB → RRGGBB
    return fill.value.replace("#", "").toUpperCase();
  }
  return undefined;
}

/**
 * 行内の要素間のgapを計算
 * 連続する要素間の最小距離を返す
 */
function calculateRowGap(row: ElementWithPosition[]): number {
  if (row.length < 2) return 0;

  let minGap = Infinity;
  for (let i = 0; i < row.length - 1; i++) {
    const current = row[i];
    const next = row[i + 1];
    const measured = measureNodeSize(
      current.node,
      current.width,
      current.height,
    );
    const gap = next.left - (current.left + measured.width);
    if (gap > 0 && gap < minGap) {
      minGap = gap;
    }
  }
  return minGap === Infinity ? 0 : Math.round(minGap);
}

/**
 * 行間のgapを計算
 */
function calculateVGap(rows: ElementWithPosition[][]): number {
  if (rows.length < 2) return 0;

  let minGap = Infinity;
  for (let i = 0; i < rows.length - 1; i++) {
    const currentRow = rows[i];
    const nextRow = rows[i + 1];

    // 現在の行の最下端を計算
    const currentBottom = Math.max(
      ...currentRow.map((el) => {
        const measured = measureNodeSize(el.node, el.width, el.height);
        return el.top + measured.height;
      }),
    );
    // 次の行の最上端
    const nextTop = Math.min(...nextRow.map((el) => el.top));
    const gap = nextTop - currentBottom;
    if (gap > 0 && gap < minGap) {
      minGap = gap;
    }
  }
  return minGap === Infinity ? 0 : Math.round(minGap);
}

/**
 * 複数の要素を行グループ化してVStack/HStack構造に変換
 * gap を使用してシンプルな構造を生成
 */
function arrangeElements(elements: ElementWithPosition[]): POMNode {
  if (elements.length === 0) {
    return { type: "vstack", children: [] };
  }

  if (elements.length === 1) {
    return elements[0].node;
  }

  // top座標でソート
  const sorted = [...elements].sort((a, b) => a.top - b.top);

  const rows: ElementWithPosition[][] = [];

  for (const el of sorted) {
    const lastRow = rows[rows.length - 1];

    if (!lastRow) {
      rows.push([el]);
      continue;
    }

    const rowMinTop = Math.min(...lastRow.map((e) => e.top));

    if (el.top - rowMinTop > ROW_THRESHOLD_TOP) {
      rows.push([el]);
    } else {
      lastRow.push(el);
    }
  }

  // 各行をX座標でソート
  for (const row of rows) {
    row.sort((a, b) => a.left - b.left);
  }

  // 行間のgapを計算
  const vGap = calculateVGap(rows);

  // 各行をPOMNodeに変換
  const vstackChildren: POMNode[] = [];

  for (const row of rows) {
    if (row.length === 1) {
      // 単一要素はそのまま追加
      vstackChildren.push(row[0].node);
    } else {
      // 複数要素はHStackで配置
      const hGap = calculateRowGap(row);
      const hstack: HStackNode = {
        type: "hstack",
        w: "max",
        gap: hGap > 0 ? hGap : undefined,
        alignItems: "center",
        children: row.map((el) => el.node),
      };
      vstackChildren.push(hstack);
    }
  }

  if (vstackChildren.length === 1) {
    return vstackChildren[0];
  }

  return {
    type: "vstack",
    w: "max",
    gap: vGap > 0 ? vGap : undefined,
    children: vstackChildren,
  };
}

/**
 * 包含関係ツリーノードをPOMNodeに変換
 */
function convertTreeNodeToPOM(node: ContainmentTreeNode): POMNode {
  const { element, children } = node;

  if (children.length === 0) {
    // 葉ノード: そのまま返す
    return element.node;
  }

  // 子がある場合
  const backgroundColor = getBackgroundColor(element);

  // 子要素の位置情報を親基準の相対座標に変換
  const childElements: ElementWithPosition[] = children.map((child) => ({
    ...child.element,
    left: child.element.left - element.left, // 親基準に変換
    top: child.element.top - element.top, // 親基準に変換
    node: convertTreeNodeToPOM(child),
  }));

  const arrangedChildren = arrangeElements(childElements);

  // 親要素が背景色を持つ場合、BoxでラップしてbackgroundColorを設定
  // 背景Boxは子要素の配置基準となるため、元のサイズを維持
  if (backgroundColor) {
    return {
      type: "box",
      w: element.width,
      h: element.height,
      backgroundColor,
      children: arrangedChildren,
    };
  }

  // 背景色がない場合、親要素のノードと子をどう扱うか
  // 親がテキストなしshapeなら子だけ返す、そうでなければVStackで並べる
  const parentHasContent =
    element.element.type === "shape" && element.element.content;

  if (!parentHasContent) {
    // 親はただの包含枠なので、子だけ返す
    return arrangedChildren;
  }

  // 親にもコンテンツがある場合、親のノードと子をVStackで並べる
  return {
    type: "vstack",
    children: [element.node, arrangedChildren],
  };
}

/**
 * スライドをPOMNodeに変換
 * 包含関係ツリーアルゴリズムを使用して、レイヤー構造を正しく表現
 */
function convertSlide(
  slide: Slide,
  slideWidth: number,
  slideHeight: number,
): POMNode {
  // サポートされている要素のみ抽出し、order順にソート
  const supportedElements = [...slide.elements]
    .filter(isSupported)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 各要素をPOMNodeに変換し、位置情報を保持
  const elementsWithPosition: ElementWithPosition[] = [];
  for (const element of supportedElements) {
    const node = convertElement(element);
    if (node) {
      elementsWithPosition.push({
        element,
        node,
        left: ptToPx(element.left),
        top: ptToPx(element.top),
        width: ptToPx(element.width),
        height: ptToPx(element.height),
      });
    }
  }

  if (elementsWithPosition.length === 0) {
    return {
      type: "vstack",
      w: slideWidth,
      h: slideHeight,
      children: [],
    };
  }

  // 包含関係ツリーを構築
  const containmentTree = buildContainmentTree(elementsWithPosition);

  // ルートノードをPOMNodeに変換
  const rootPOMNodes: ElementWithPosition[] = containmentTree.map(
    (treeNode) => ({
      ...treeNode.element,
      node: convertTreeNodeToPOM(treeNode),
    }),
  );

  // ルートノードを配置
  const arrangedContent = arrangeElements(rootPOMNodes);

  // VStackでラップして返す
  const result: VStackNode = {
    type: "vstack",
    w: slideWidth,
    h: slideHeight,
    children:
      arrangedContent.type === "vstack"
        ? arrangedContent.children
        : [arrangedContent],
  };

  return result;
}

/**
 * PPTXファイルを解析してPOMNode[]に変換
 *
 * @param data - PPTXファイルのバイナリデータ
 * @param options - 解析オプション
 * @returns ParsedPptx - 解析結果
 *
 * @example
 * ```typescript
 * import { parsePptx } from "@hirokisakabe/pom";
 * import fs from "fs";
 *
 * const data = new Uint8Array(fs.readFileSync("presentation.pptx"));
 * const result = await parsePptx(data);
 *
 * console.log(`スライド数: ${result.slides.length}`);
 * console.log(`サイズ: ${result.metadata.slideWidth}x${result.metadata.slideHeight}`);
 * ```
 */
export async function parsePptx(
  data: Uint8Array,
  options?: ParsePptxOptions,
): Promise<ParsedPptx> {
  // Uint8ArrayをArrayBufferに変換
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;

  // pptxtojsonでパース
  const parse = getParseFn();
  const result = await parse(arrayBuffer, {
    slideFactor: options?.slideFactor,
    fontsizeFactor: options?.fontsizeFactor,
  });

  // スライドサイズをpxに変換
  const slideWidth = ptToPx(result.size.width);
  const slideHeight = ptToPx(result.size.height);

  // 各スライドをPOMNodeに変換
  const slides: POMNode[] = result.slides.map((slide) =>
    convertSlide(slide, slideWidth, slideHeight),
  );

  // 画像を収集
  const images = new Map<string, Uint8Array>();
  // 注: pptxtojsonは画像をBase64文字列として提供するため、
  // 必要に応じてUint8Arrayに変換して保存する実装が必要

  return {
    slides,
    images,
    metadata: {
      slideWidth,
      slideHeight,
    },
  };
}
