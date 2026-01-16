/**
 * opentype.js を使用したフォント読み込みモジュール
 * Node.js とブラウザ両方で動作する
 */

import opentype, { Font } from "opentype.js";
import { NOTO_SANS_JP_REGULAR_BASE64 } from "./fonts/notoSansJPRegular.js";
import { NOTO_SANS_JP_BOLD_BASE64 } from "./fonts/notoSansJPBold.js";

// フォントキャッシュ
const fontCache = new Map<string, Font>();

/**
 * Base64 文字列を ArrayBuffer に変換する
 * Node.js とブラウザ両方で動作する
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  // Node.js 環境
  if (typeof Buffer !== "undefined") {
    const buffer = Buffer.from(base64, "base64");
    return buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    );
  }
  // ブラウザ環境
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * フォントを取得する（キャッシュ付き）
 * @param weight フォントウェイト ("normal" or "bold")
 * @returns opentype.js の Font オブジェクト
 */
export function getFont(weight: "normal" | "bold"): Font {
  const cacheKey = weight;

  // キャッシュがあればそれを返す
  const cached = fontCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Base64 データを選択
  const base64 =
    weight === "bold" ? NOTO_SANS_JP_BOLD_BASE64 : NOTO_SANS_JP_REGULAR_BASE64;

  // ArrayBuffer に変換してパース
  const buffer = base64ToArrayBuffer(base64);
  const font = opentype.parse(buffer);

  // キャッシュに保存
  fontCache.set(cacheKey, font);

  return font;
}

/**
 * 指定したテキストの幅を計測する
 * @param text 計測するテキスト
 * @param fontSizePx フォントサイズ（ピクセル）
 * @param weight フォントウェイト
 * @returns テキスト幅（ピクセル）
 */
export function measureTextWidth(
  text: string,
  fontSizePx: number,
  weight: "normal" | "bold",
): number {
  const font = getFont(weight);
  return font.getAdvanceWidth(text, fontSizePx, { kerning: true });
}
