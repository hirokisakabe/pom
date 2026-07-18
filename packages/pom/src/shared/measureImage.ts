import * as fs from "fs";
import { imageSize } from "image-size";
import type { DiagnosticCollector } from "../diagnostics.ts";

type ImageSizeCache = Map<string, { widthPx: number; heightPx: number }>;
type ImageDataCache = Map<string, string>;

/**
 * キャッシュされた画像データ（Base64）を取得する
 * @param src 画像のパス
 * @param cache 画像データキャッシュ
 * @returns Base64形式の画像データ、またはキャッシュがない場合はundefined
 */
export function getImageData(
  src: string,
  cache: ImageDataCache,
): string | undefined {
  return cache.get(src);
}

/**
 * 画像サイズを事前取得してキャッシュする（非同期）
 * HTTPS URLの画像を処理する際に使用
 * @param src 画像のパス（ローカルパス、base64データ、またはHTTPS URL）
 * @param sizeCache 画像サイズキャッシュ
 * @param dataCache 画像データキャッシュ
 * @returns 画像の幅と高さ（px）
 */
export async function prefetchImageSize(
  src: string,
  sizeCache: ImageSizeCache,
  dataCache: ImageDataCache,
  diagnostics: DiagnosticCollector,
): Promise<{
  widthPx: number;
  heightPx: number;
}> {
  // キャッシュにあればそれを返す
  const cached = sizeCache.get(src);
  if (cached) {
    return cached;
  }

  try {
    let buffer: Uint8Array;

    // base64データの場合
    if (src.startsWith("data:")) {
      const base64Data = src.split(",")[1];
      buffer = new Uint8Array(Buffer.from(base64Data, "base64"));
    }
    // HTTPS/HTTP URLの場合
    else if (src.startsWith("https://") || src.startsWith("http://")) {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      buffer = new Uint8Array(arrayBuffer);

      // 画像データを Base64 形式でキャッシュ（PPTX authoring 用）
      const contentType = response.headers.get("content-type") || "image/png";
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      dataCache.set(src, `${contentType};base64,${base64}`);
    }
    // ローカルファイルパスの場合
    else {
      buffer = new Uint8Array(fs.readFileSync(src));
    }

    const dimensions = imageSize(buffer);

    const width = dimensions.width ?? 100; // デフォルト100px
    const height = dimensions.height ?? 100; // デフォルト100px

    const result = {
      widthPx: width,
      heightPx: height,
    };

    // キャッシュに保存
    sizeCache.set(src, result);

    return result;
  } catch (error) {
    // エラーが発生した場合はデフォルトサイズを返す
    diagnostics.add(
      "IMAGE_MEASURE_FAILED",
      `Failed to measure image size for ${src}: ${String(error)}`,
    );
    const result = {
      widthPx: 100,
      heightPx: 100,
    };
    sizeCache.set(src, result);
    return result;
  }
}

/**
 * 画像ファイルのサイズを取得する（同期）
 * 事前にprefetchImageSizeでキャッシュしておくこと
 * @param src 画像のパス（ローカルパス、base64データ、またはHTTPS URL）
 * @param sizeCache 画像サイズキャッシュ
 * @returns 画像の幅と高さ（px）
 */
export function measureImage(
  src: string,
  sizeCache: ImageSizeCache,
  diagnostics: DiagnosticCollector,
): {
  widthPx: number;
  heightPx: number;
} {
  // キャッシュにあればそれを返す
  const cached = sizeCache.get(src);
  if (cached) {
    return cached;
  }

  // キャッシュにない場合（ローカルファイルやbase64のみ同期処理可能）
  try {
    let buffer: Uint8Array;

    // base64データの場合
    if (src.startsWith("data:")) {
      const base64Data = src.split(",")[1];
      buffer = new Uint8Array(Buffer.from(base64Data, "base64"));
    }
    // HTTPS/HTTP URLの場合はキャッシュがないとデフォルト値を返す
    else if (src.startsWith("https://") || src.startsWith("http://")) {
      diagnostics.add(
        "IMAGE_NOT_PREFETCHED",
        `Image size for URL ${src} was not prefetched. Using default size.`,
      );
      return {
        widthPx: 100,
        heightPx: 100,
      };
    }
    // ローカルファイルパスの場合
    else {
      buffer = new Uint8Array(fs.readFileSync(src));
    }

    const dimensions = imageSize(buffer);

    const width = dimensions.width ?? 100; // デフォルト100px
    const height = dimensions.height ?? 100; // デフォルト100px

    const result = {
      widthPx: width,
      heightPx: height,
    };

    // キャッシュに保存
    sizeCache.set(src, result);

    return result;
  } catch (error) {
    // エラーが発生した場合はデフォルトサイズを返す
    diagnostics.add(
      "IMAGE_MEASURE_FAILED",
      `Failed to measure image size for ${src}: ${String(error)}`,
    );
    return {
      widthPx: 100,
      heightPx: 100,
    };
  }
}
