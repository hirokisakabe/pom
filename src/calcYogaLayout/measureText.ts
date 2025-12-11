import { createCanvas } from "canvas";

type MeasureOptions = {
  fontFamily: string;
  fontSizePx: number;
  fontWeight?: "normal" | "bold" | number;
  lineHeight?: number;
};

export type TextMeasurementMode = "canvas" | "fallback" | "auto";

const canvas = createCanvas(1, 1);
const ctx = canvas.getContext("2d");

// フォント利用可否のキャッシュ
const fontAvailabilityCache = new Map<string, boolean>();

/**
 * 指定されたフォントが利用可能かどうかをチェックする
 * 既知のフォントと未知のフォントで同じ幅になるかチェックし、
 * 同じなら「フォントが利用できない」と判定する
 */
function isFontAvailable(fontFamily: string, fontSizePx: number): boolean {
  const cacheKey = `${fontFamily}:${fontSizePx}`;
  const cached = fontAvailabilityCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  // テスト文字列（日本語と英語を含む）
  const testString = "あいうABC123";

  // 存在しないフォント名でテスト
  const nonExistentFont = "NonExistentFont_12345_XYZ";

  ctx.font = `${fontSizePx}px "${fontFamily}"`;
  const targetWidth = ctx.measureText(testString).width;

  ctx.font = `${fontSizePx}px "${nonExistentFont}"`;
  const fallbackWidth = ctx.measureText(testString).width;

  // 幅が同じなら、フォントが利用できない（フォールバックされている）
  const isAvailable = Math.abs(targetWidth - fallbackWidth) > 0.1;

  fontAvailabilityCache.set(cacheKey, isAvailable);
  return isAvailable;
}

/**
 * 文字がCJK（日本語・中国語・韓国語）文字かどうかを判定する
 */
function isCJKChar(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return false;

  // CJK統合漢字
  if (code >= 0x4e00 && code <= 0x9fff) return true;
  // CJK統合漢字拡張A
  if (code >= 0x3400 && code <= 0x4dbf) return true;
  // CJK統合漢字拡張B-F
  if (code >= 0x20000 && code <= 0x2ebef) return true;
  // ひらがな
  if (code >= 0x3040 && code <= 0x309f) return true;
  // カタカナ
  if (code >= 0x30a0 && code <= 0x30ff) return true;
  // 全角英数字・記号
  if (code >= 0xff00 && code <= 0xffef) return true;
  // CJK記号
  if (code >= 0x3000 && code <= 0x303f) return true;

  return false;
}

/**
 * フォールバック計算で文字の幅を推定する
 * - CJK文字: 1em（= fontSizePx）
 * - 英数字・半角記号: 0.5em
 */
function estimateCharWidth(char: string, fontSizePx: number): number {
  if (isCJKChar(char)) {
    return fontSizePx; // 1em
  }
  return fontSizePx * 0.5; // 0.5em
}

/**
 * フォールバック計算でテキスト幅を推定する
 */
function estimateTextWidth(text: string, fontSizePx: number): number {
  let width = 0;
  for (const char of text) {
    width += estimateCharWidth(char, fontSizePx);
  }
  return width;
}

// 現在のテキスト計測モード
let currentMode: TextMeasurementMode = "auto";

/**
 * テキスト計測モードを設定する
 */
export function setTextMeasurementMode(mode: TextMeasurementMode): void {
  currentMode = mode;
}

/**
 * 現在のテキスト計測モードを取得する
 */
export function getTextMeasurementMode(): TextMeasurementMode {
  return currentMode;
}

/**
 * テキストを折り返し付きでレイアウトし、そのサイズを測定する
 */
export function measureText(
  text: string,
  maxWidthPx: number,
  opts: MeasureOptions,
): {
  widthPx: number;
  heightPx: number;
} {
  const { fontFamily, fontSizePx } = opts;

  // 計測方法を決定
  const shouldUseFallback = (() => {
    switch (currentMode) {
      case "canvas":
        return false;
      case "fallback":
        return true;
      case "auto":
        return !isFontAvailable(fontFamily, fontSizePx);
    }
  })();

  if (shouldUseFallback) {
    return measureTextFallback(text, maxWidthPx, opts);
  }

  return measureTextCanvas(text, maxWidthPx, opts);
}

/**
 * canvas を使ったテキスト計測
 */
function measureTextCanvas(
  text: string,
  maxWidthPx: number,
  opts: MeasureOptions,
): {
  widthPx: number;
  heightPx: number;
} {
  applyFontStyle(opts);

  // まず改行で段落に分割
  const paragraphs = text.split("\n");
  const lines: { widthPx: number }[] = [];

  for (const paragraph of paragraphs) {
    // 空の段落（連続した改行）も1行としてカウント
    if (paragraph === "") {
      lines.push({ widthPx: 0 });
      continue;
    }

    const words = splitForWrap(paragraph);

    let current = "";
    let currentWidth = 0;

    for (const word of words) {
      const candidate = current ? current + word : word;
      const w = ctx.measureText(candidate).width;

      if (w <= maxWidthPx || !current) {
        // まだ詰められる
        current = candidate;
        currentWidth = w;
      } else {
        // 折り返す
        lines.push({ widthPx: currentWidth });
        current = word;
        currentWidth = ctx.measureText(word).width;
      }
    }

    if (current) {
      lines.push({ widthPx: currentWidth });
    }
  }

  const lineHeightRatio = opts.lineHeight ?? 1.3;
  const lineHeightPx = opts.fontSizePx * lineHeightRatio;
  const widthPx = lines.length ? Math.max(...lines.map((l) => l.widthPx)) : 0;
  const heightPx = lines.length * lineHeightPx;

  // 端数切り上げ＋余裕分 10px を足す
  return { widthPx: widthPx + 10, heightPx };
}

/**
 * フォールバック計算を使ったテキスト計測
 */
function measureTextFallback(
  text: string,
  maxWidthPx: number,
  opts: MeasureOptions,
): {
  widthPx: number;
  heightPx: number;
} {
  const { fontSizePx } = opts;

  // まず改行で段落に分割
  const paragraphs = text.split("\n");
  const lines: { widthPx: number }[] = [];

  for (const paragraph of paragraphs) {
    // 空の段落（連続した改行）も1行としてカウント
    if (paragraph === "") {
      lines.push({ widthPx: 0 });
      continue;
    }

    const words = splitForWrap(paragraph);

    let current = "";
    let currentWidth = 0;

    for (const word of words) {
      const candidate = current ? current + word : word;
      const w = estimateTextWidth(candidate, fontSizePx);

      if (w <= maxWidthPx || !current) {
        // まだ詰められる
        current = candidate;
        currentWidth = w;
      } else {
        // 折り返す
        lines.push({ widthPx: currentWidth });
        current = word;
        currentWidth = estimateTextWidth(word, fontSizePx);
      }
    }

    if (current) {
      lines.push({ widthPx: currentWidth });
    }
  }

  const lineHeightRatio = opts.lineHeight ?? 1.3;
  const lineHeightPx = fontSizePx * lineHeightRatio;
  const widthPx = lines.length ? Math.max(...lines.map((l) => l.widthPx)) : 0;
  const heightPx = lines.length * lineHeightPx;

  // 端数切り上げ＋余裕分 10px を足す
  return { widthPx: widthPx + 10, heightPx };
}

function applyFontStyle(opts: MeasureOptions) {
  const { fontFamily, fontSizePx, fontWeight = "normal" } = opts;
  ctx.font = `${fontWeight} ${fontSizePx}px "${fontFamily}"`;
}

// ラップ用の分割ロジック
// - 英文: 空白で分割しつつ、空白も行末に残す
// - 日本語: とりあえず 1 文字ずつ（必要なら賢くする）
function splitForWrap(text: string): string[] {
  // 超雑実装：全角ひらがな・カタカナ・漢字が多そうなら 1 文字ずつ、それ以外は空白区切り
  const hasCJK = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(
    text,
  );

  if (hasCJK) {
    return Array.from(text); // 1 glyph ≒ 1 文字として扱う
  }

  // 英文用：単語 + 後続スペースをトークンにする
  const tokens: string[] = [];
  const re = /(\S+\s*|\s+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    tokens.push(m[0]);
  }
  return tokens;
}
