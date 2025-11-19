import { createCanvas } from "canvas";

type MeasureOptions = {
  fontFamily: string;
  fontSizePx: number;
  fontWeight?: "normal" | "bold" | number;
  lineHeight?: number;
};

const canvas = createCanvas(1, 1);
const ctx = canvas.getContext("2d");

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
  applyFontStyle(opts);

  const words = splitForWrap(text);
  const lines: { widthPx: number }[] = [];

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

  const lineHeightRatio = opts.lineHeight ?? 1.3;
  const lineHeightPx = opts.fontSizePx * lineHeightRatio;
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
