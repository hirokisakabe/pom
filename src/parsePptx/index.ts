import { createRequire } from "module";
import type { POMNode, BoxNode, HStackNode, VStackNode } from "../types";
import type { ParsedPptx, ParsePptxOptions, Element, Slide } from "./types";
import { ptToPx } from "./units";
import { convertText } from "./convertText";
import { convertImage } from "./convertImage";
import { convertShape } from "./convertShape";
import { convertTable } from "./convertTable";
import { convertChart } from "./convertChart";

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
 * 行グループ化の閾値（px）
 * top座標がこの値以内なら同じ行として扱う
 */
const ROW_THRESHOLD_TOP = 20;

/**
 * 要素Aが要素Bを完全に包含しているかチェック
 * 背景シェイプの検出に使用
 */
function containsElement(
  container: ElementWithPosition,
  contained: ElementWithPosition,
): boolean {
  return (
    container.left <= contained.left &&
    container.top <= contained.top &&
    container.left + container.width >= contained.left + contained.width &&
    container.top + container.height >= contained.top + contained.height
  );
}

/**
 * 背景と思われる要素をフィルタリング
 * 他の要素を完全に包含している大きな要素は背景とみなしてスキップ
 */
function filterBackgroundElements(
  elements: ElementWithPosition[],
): ElementWithPosition[] {
  const backgroundIndices = new Set<number>();

  for (let i = 0; i < elements.length; i++) {
    for (let j = 0; j < elements.length; j++) {
      if (i === j) continue;

      // elements[i] が elements[j] を包含しているかチェック
      if (containsElement(elements[i], elements[j])) {
        // 包含している要素を背景としてマーク
        backgroundIndices.add(i);
        break;
      }
    }
  }

  return elements.filter((_, index) => !backgroundIndices.has(index));
}

/**
 * 要素を行にグループ化
 * top座標が近い要素を同じ行としてグループ化する
 *
 * 戦略:
 * 1. 背景要素（他を包含する要素）をフィルタリング
 * 2. top座標を主基準とし、同じtopの要素を同じ行にグループ化
 */
function groupIntoRows(
  elements: ElementWithPosition[],
): ElementWithPosition[][] {
  if (elements.length === 0) return [];

  // 背景要素をフィルタリング
  const filteredElements = filterBackgroundElements(elements);

  // top座標でソート
  const sorted = [...filteredElements].sort((a, b) => a.top - b.top);

  const rows: ElementWithPosition[][] = [];

  for (const el of sorted) {
    const lastRow = rows[rows.length - 1];

    if (!lastRow) {
      rows.push([el]);
      continue;
    }

    // 行の最小top座標と比較
    const rowMinTop = Math.min(...lastRow.map((e) => e.top));

    if (el.top - rowMinTop > ROW_THRESHOLD_TOP) {
      // 新しい行を開始
      rows.push([el]);
    } else {
      // 既存の行に追加
      lastRow.push(el);
    }
  }

  // 各行をX座標でソート
  for (const row of rows) {
    row.sort((a, b) => a.left - b.left);
  }

  return rows;
}

/**
 * スライドをPOMNodeに変換
 * 行グループ化アルゴリズムを使用して、絶対位置を相対位置に変換
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

  // 行にグループ化
  const rows = groupIntoRows(elementsWithPosition);

  // VStack + HStack 構造を生成
  let prevRowBottom = 0;
  const vstackChildren: POMNode[] = [];

  for (const row of rows) {
    const rowTop = row[0].top;
    const paddingTop = Math.max(0, rowTop - prevRowBottom);

    // 行内の要素を処理
    let prevRight = 0;
    const rowChildren: BoxNode[] = [];

    for (const el of row) {
      const paddingLeft = Math.max(0, el.left - prevRight);
      prevRight = el.left + el.width;

      const box: BoxNode = {
        type: "box",
        padding: { left: paddingLeft },
        w: el.width,
        h: el.height,
        children: el.node,
      };

      rowChildren.push(box);
    }

    // 行のbottomを更新
    prevRowBottom = Math.max(...row.map((el) => el.top + el.height));

    if (rowChildren.length === 1) {
      // 単一要素の場合は HStack 不要
      const singleBox = rowChildren[0];
      const existingPadding =
        typeof singleBox.padding === "object" ? singleBox.padding : {};
      singleBox.padding = {
        ...existingPadding,
        top: paddingTop,
      };
      vstackChildren.push(singleBox);
    } else {
      // 複数要素の場合は HStack でラップ
      const hstack: HStackNode = {
        type: "hstack",
        children: rowChildren,
      };

      const rowBox: BoxNode = {
        type: "box",
        padding: { top: paddingTop },
        children: hstack,
      };

      vstackChildren.push(rowBox);
    }
  }

  // VStackでラップして返す
  const result: VStackNode = {
    type: "vstack",
    w: slideWidth,
    h: slideHeight,
    children: vstackChildren,
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
