/**
 * ポイント(pt)からピクセル(px)への変換
 * pptxtojsonはpt単位で出力する
 * 変換式: pt × 4/3 = px (96 DPI基準)
 */
export function ptToPx(pt: number): number {
  return pt * (4 / 3);
}

/**
 * カラーコードの正規化
 * "#FF0000" → "FF0000"
 * pomでは#なしの16進数カラーコードを使用する
 */
export function normalizeColor(color: string): string {
  if (color.startsWith("#")) {
    return color.slice(1).toUpperCase();
  }
  return color.toUpperCase();
}
