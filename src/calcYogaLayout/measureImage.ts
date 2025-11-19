import imageSize from "image-size";
import * as fs from "fs";

/**
 * 画像ファイルのサイズを取得する
 * @param src 画像のパス（ローカルパス、またはbase64データ）
 * @returns 画像の幅と高さ（px）
 */
export function measureImage(src: string): {
  widthPx: number;
  heightPx: number;
} {
  try {
    let buffer: Uint8Array;

    // base64データの場合
    if (src.startsWith("data:")) {
      const base64Data = src.split(",")[1];
      buffer = new Uint8Array(Buffer.from(base64Data, "base64"));
    }
    // ローカルファイルパスの場合
    else {
      buffer = new Uint8Array(fs.readFileSync(src));
    }

    const dimensions = imageSize(buffer);

    const width = dimensions.width ?? 100; // デフォルト100px
    const height = dimensions.height ?? 100; // デフォルト100px

    return {
      widthPx: width,
      heightPx: height,
    };
  } catch (error) {
    // エラーが発生した場合はデフォルトサイズを返す
    console.warn(`Failed to measure image size for ${src}:`, error);
    return {
      widthPx: 100,
      heightPx: 100,
    };
  }
}
