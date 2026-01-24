import { createRequire } from "module";
const require = createRequire(import.meta.url);
const imageSize = require("image-size") as typeof import("image-size").default;
import * as fs from "fs";

/**
 * 画像サイズのキャッシュ（事前取得した画像サイズを保持）
 */
const imageSizeCache = new Map<string, { widthPx: number; heightPx: number }>();

/**
 * 画像データのキャッシュ（Base64形式、リモート画像用）
 */
const imageDataCache = new Map<string, string>();

/**
 * キャッシュされた画像データ（Base64）を取得する
 * @param src 画像のパス
 * @returns Base64形式の画像データ、またはキャッシュがない場合はundefined
 */
export function getImageData(src: string): string | undefined {
  return imageDataCache.get(src);
}

/**
 * 画像サイズを事前取得してキャッシュする（非同期）
 * HTTPS URLの画像を処理する際に使用
 * @param src 画像のパス（ローカルパス、base64データ、またはHTTPS URL）
 * @returns 画像の幅と高さ（px）
 */
export async function prefetchImageSize(src: string): Promise<{
  widthPx: number;
  heightPx: number;
}> {
  // キャッシュにあればそれを返す
  const cached = imageSizeCache.get(src);
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

      // 画像データをBase64形式でキャッシュ（pptxgenjs用）
      const contentType = response.headers.get("content-type") || "image/png";
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      imageDataCache.set(src, `${contentType};base64,${base64}`);
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
    imageSizeCache.set(src, result);

    return result;
  } catch (error) {
    // エラーが発生した場合はデフォルトサイズを返す
    console.warn(`Failed to measure image size for ${src}:`, error);
    const result = {
      widthPx: 100,
      heightPx: 100,
    };
    imageSizeCache.set(src, result);
    return result;
  }
}

/**
 * 画像ファイルのサイズを取得する（同期）
 * 事前にprefetchImageSizeでキャッシュしておくこと
 * @param src 画像のパス（ローカルパス、base64データ、またはHTTPS URL）
 * @returns 画像の幅と高さ（px）
 */
export function measureImage(src: string): {
  widthPx: number;
  heightPx: number;
} {
  // キャッシュにあればそれを返す
  const cached = imageSizeCache.get(src);
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
      console.warn(
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
    imageSizeCache.set(src, result);

    return result;
  } catch (error) {
    // エラーが発生した場合はデフォルトサイズを返す
    console.warn(`Failed to measure image size for ${src}:`, error);
    return {
      widthPx: 100,
      heightPx: 100,
    };
  }
}
