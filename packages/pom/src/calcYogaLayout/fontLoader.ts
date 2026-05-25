/**
 * opentype.js を使用したフォント読み込みモジュール
 * Node.js とブラウザ両方で動作する
 */

import type { Font } from "opentype.js";
import * as opentypeModule from "opentype.js";
import { NOTO_SANS_JP_REGULAR_BASE64 } from "./fonts/notoSansJPRegular.ts";
import { NOTO_SANS_JP_BOLD_BASE64 } from "./fonts/notoSansJPBold.ts";

// opentype.js 2.0 は ESM ビルドで named export のみを提供する一方、
// CJS UMD ビルドでは module.exports = factory() の動的構造のため
// Node ESM から取り込むと named exports が静的解析できない。
// どちらの形でも動くよう default プロパティを優先して unwrap する。
const opentype = (
  opentypeModule as unknown as { default?: typeof opentypeModule }
).default ?? opentypeModule;

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
function getFont(weight: "normal" | "bold"): Font {
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

/** バンドル済みフォント名の一覧 */
const BUNDLED_FONT_NAMES = new Set(["Noto Sans JP"]);

/**
 * 指定されたフォントがバンドル済みかどうかを判定する
 */
export function isBundledFont(fontFamily: string): boolean {
  return BUNDLED_FONT_NAMES.has(fontFamily);
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

/**
 * フォントの自然な行高さ比率を取得する
 *
 * PowerPoint の lineHeight はフォントサイズではなく、
 * フォントメトリクス（ascent + descent）に対する倍率として適用される。
 * この関数は fontSizePx に対する自然な行高さの比率を返す。
 *
 * - USE_TYPO_METRICS (fsSelection bit 7) が設定されている場合:
 *   sTypoAscender, sTypoDescender, sTypoLineGap を使用
 * - 設定されていない場合:
 *   usWinAscent, usWinDescent を使用
 *
 * @param weight フォントウェイト
 * @returns fontSizePx に対する行高さの比率（例: 1.448）
 */
export function measureFontLineHeightRatio(weight: "normal" | "bold"): number {
  const font = getFont(weight);
  const upm = font.unitsPerEm;
  const os2 = font.tables?.os2;

  if (!os2) {
    return 1.0;
  }

  const useTypoMetrics = Boolean(os2.fsSelection & (1 << 7));

  if (useTypoMetrics) {
    return (os2.sTypoAscender - os2.sTypoDescender + os2.sTypoLineGap) / upm;
  }

  return (os2.usWinAscent + os2.usWinDescent) / upm;
}
