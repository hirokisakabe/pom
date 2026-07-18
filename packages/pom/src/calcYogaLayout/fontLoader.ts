/**
 * opentype.js を使用したフォント読み込みモジュール
 * Node.js とブラウザ両方で動作する
 */

import type { Font } from "opentype.js";
import * as opentypeModule from "opentype.js";
import { NOTO_SANS_JP_REGULAR_BASE64 } from "./fonts/notoSansJPRegular.ts";
import { NOTO_SANS_JP_BOLD_BASE64 } from "./fonts/notoSansJPBold.ts";

export interface FontInput {
  name?: string;
  data: ArrayBuffer | Uint8Array;
  weight?: "normal" | "bold" | number;
}

type FontWeight = "normal" | "bold";
type FontFaces = Partial<Record<FontWeight, Font>>;

// opentype.js 2.0 は ESM ビルドで named export のみを提供する一方、
// CJS UMD ビルドでは module.exports = factory() の動的構造のため
// Node ESM から取り込むと named exports が静的解析できない。
// どちらの形でも動くよう default プロパティを優先して unwrap する。
const opentype =
  (opentypeModule as unknown as { default?: typeof opentypeModule }).default ??
  opentypeModule;

// フォントキャッシュ
const fontCache = new Map<string, Font>();

function normalizeFamilyName(fontFamily: string): string {
  return fontFamily.trim().toLocaleLowerCase();
}

function normalizeWeight(weight: FontInput["weight"], font?: Font): FontWeight {
  if (weight === "bold" || (typeof weight === "number" && weight >= 600)) {
    return "bold";
  }
  if (weight === "normal" || typeof weight === "number") {
    return "normal";
  }

  const metadataWeight = (
    font?.tables?.os2 as { usWeightClass?: unknown } | undefined
  )?.usWeightClass;
  if (typeof metadataWeight === "number") {
    return metadataWeight >= 600 ? "bold" : "normal";
  }

  const subfamilyNames = getLocalizedNames(font, "fontSubfamily");
  return subfamilyNames.some((name) => /\bbold\b/i.test(name))
    ? "bold"
    : "normal";
}

function getLocalizedNames(font: Font | undefined, key: string): string[] {
  const results = new Set<string>();
  const collectStrings = (value: unknown): void => {
    if (typeof value === "string") {
      if (value.length > 0) results.add(value);
      return;
    }
    if (!value || typeof value !== "object") return;
    for (const child of Object.values(value)) collectStrings(child);
  };
  const visit = (value: unknown): void => {
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if (key in record) collectStrings(record[key]);
    for (const child of Object.values(record)) visit(child);
  };

  visit(font?.names);
  return [...results];
}

function toArrayBuffer(data: ArrayBuffer | Uint8Array): ArrayBuffer {
  if (data instanceof ArrayBuffer) return data;
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

/** build ごとに独立した custom font face の registry。 */
export class FontRegistry {
  readonly #families = new Map<string, FontFaces>();

  constructor(inputs: readonly FontInput[] = []) {
    for (const input of inputs) {
      const font = opentype.parse(toArrayBuffer(input.data));
      const weight = normalizeWeight(input.weight, font);
      const familyNames = new Set([
        ...(input.name ? [input.name] : []),
        ...getLocalizedNames(font, "fontFamily"),
        ...getLocalizedNames(font, "preferredFamily"),
      ]);

      for (const familyName of familyNames) {
        const key = normalizeFamilyName(familyName);
        if (!key) continue;
        const faces = this.#families.get(key) ?? {};
        faces[weight] = font;
        this.#families.set(key, faces);
      }
    }
  }

  hasFont(fontFamily: string, weight: FontWeight): boolean {
    return this.resolve(fontFamily, weight) !== undefined;
  }

  measureTextWidth(
    text: string,
    fontFamily: string,
    fontSizePx: number,
    weight: FontWeight,
  ): number | undefined {
    return this.resolve(fontFamily, weight)?.getAdvanceWidth(text, fontSizePx, {
      kerning: true,
    });
  }

  private resolve(fontFamily: string, weight: FontWeight): Font | undefined {
    const faces = this.#families.get(normalizeFamilyName(fontFamily));
    if (!faces) return undefined;
    if (weight === "bold") return faces.bold ?? faces.normal;
    return faces.normal;
  }
}

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
const BUNDLED_FONT_NAMES = new Set([normalizeFamilyName("Noto Sans JP")]);

/**
 * 指定されたフォントがバンドル済みかどうかを判定する
 */
export function isBundledFont(fontFamily: string): boolean {
  return BUNDLED_FONT_NAMES.has(normalizeFamilyName(fontFamily));
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
 * フォントの縦方向メトリクスを fontSizePx に対する比率で取得する
 *
 * - typoAscender / typoDescender: グリフ ink のおおよその上端・下端
 *   (descender は正の値に符号反転して返す)
 * - winDescent: レンダラが固定行送り (spcPts) のときに行下端から
 *   baseline までの距離として確保する descent
 *
 * バンドル外フォント使用時もバンドルフォント (Noto Sans JP) の値を
 * 近似値として使う想定 (テキスト幅計測と同じ方針)。
 *
 * @param weight フォントウェイト
 * @returns 各メトリクスの fontSizePx に対する比率
 */
export function measureFontVerticalMetricsRatio(weight: "normal" | "bold"): {
  typoAscender: number;
  typoDescender: number;
  winDescent: number;
} {
  const font = getFont(weight);
  const upm = font.unitsPerEm;
  const os2 = font.tables?.os2;

  if (!os2) {
    // メトリクスが取れない場合は Noto Sans JP 相当の値で近似する
    return { typoAscender: 0.88, typoDescender: 0.12, winDescent: 0.288 };
  }

  return {
    typoAscender: os2.sTypoAscender / upm,
    typoDescender: -os2.sTypoDescender / upm,
    winDescent: os2.usWinDescent / upm,
  };
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
