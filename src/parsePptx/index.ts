import * as pptxtojson from "pptxtojson";
import type { POMNode, VStackNode } from "../types";
import type { ParsedPptx, ParsePptxOptions, Element, Slide } from "./types";
import { ptToPx } from "./units";
import { convertText } from "./convertText";
import { convertImage } from "./convertImage";
import { convertShape } from "./convertShape";
import { convertTable } from "./convertTable";
import { convertChart } from "./convertChart";

export type { ParsedPptx, ParsePptxOptions };

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
 * スライドをPOMNodeに変換
 * 各スライドはVStackとして返す
 */
function convertSlide(
  slide: Slide,
  slideWidth: number,
  slideHeight: number,
): POMNode {
  const children: POMNode[] = [];

  // 要素をorder順にソート
  const sortedElements = [...slide.elements]
    .filter(isSupported)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  for (const element of sortedElements) {
    const node = convertElement(element);
    if (node) {
      children.push(node);
    }
  }

  // VStackでラップして返す
  const result: VStackNode = {
    type: "vstack",
    w: slideWidth,
    h: slideHeight,
    children,
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
  const result = await pptxtojson.parse(arrayBuffer, {
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
