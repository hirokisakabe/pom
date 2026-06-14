import type {
  PositionedNode,
  TextGlow,
  TextOutline,
  Underline,
  UnderlineStyle,
} from "../types.ts";
import { pxToIn, pxToPt } from "./units.ts";
import { getContentAreaIn } from "./utils/contentArea.ts";
import { measureFontVerticalMetricsRatio } from "../calcYogaLayout/fontLoader.ts";

type TextNode = Extract<PositionedNode, { type: "text" }>;

/**
 * underline プロパティを pptxgenjs 形式に変換する
 */
export function convertUnderline(
  underline: Underline | undefined,
): { style?: UnderlineStyle; color?: string } | undefined {
  if (underline === undefined) return undefined;
  if (underline === false) return undefined;
  if (underline === true) return { style: "sng" };
  return {
    style: underline.style,
    color: underline.color,
  };
}

/**
 * strike プロパティを pptxgenjs 形式に変換する
 */
export function convertStrike(
  strike: boolean | undefined,
): "sngStrike" | undefined {
  if (strike) return "sngStrike";
  return undefined;
}

/**
 * glow プロパティを pptxgenjs 形式に変換する
 * size はユーザー入力 px、pptxgenjs の glow.size は pt。
 * pptxgenjs は省略時デフォルトを Object.assign で合成するため undefined を
 * 渡すとデフォルトが消える。ここで pom 側のデフォルトを確定させる。
 */
export function convertGlow(
  glow: TextGlow | undefined,
): { size: number; opacity: number; color: string } | undefined {
  if (glow === undefined) return undefined;
  return {
    size: pxToPt(glow.size ?? 8),
    opacity: glow.opacity ?? 0.75,
    color: glow.color ?? "FFFFFF",
  };
}

/**
 * outline プロパティを pptxgenjs 形式に変換する
 * size はユーザー入力 px、pptxgenjs の outline.size は pt
 */
export function convertOutline(
  outline: TextOutline | undefined,
): { size: number; color: string } | undefined {
  if (outline === undefined) return undefined;
  return {
    size: pxToPt(outline.size ?? 1),
    color: outline.color ?? "FFFFFF",
  };
}

/**
 * 行内でグリフ ink が上下中央に来るようにするための描画 y 補正量 (px)
 *
 * レンダラ (LibreOffice / PowerPoint) は固定行送り (spcPts) のとき
 * baseline を「行下端 − winDescent × fontSize」に置くため、グリフ ink
 * (typoAscender + typoDescender) は行内で下寄りになり、同じ gap でも
 * テキスト上側の視覚余白が広く下側が狭く見える (#846)。
 * baseline の実位置と「ink を行内中央に置いたときの baseline 位置」の
 * 差分を返し、呼び出し側でテキストフレームをその分だけ上へずらす。
 */
export function calcGlyphCenteringShiftPx(
  fontSizePx: number,
  lineHeight: number,
  fontWeight: "normal" | "bold",
): number {
  const lineHeightPx = fontSizePx * lineHeight;
  const metrics = measureFontVerticalMetricsRatio(fontWeight);
  const baselineFromTopPx = lineHeightPx - metrics.winDescent * fontSizePx;
  const inkHeightPx =
    (metrics.typoAscender + metrics.typoDescender) * fontSizePx;
  const centeredBaselineFromTopPx =
    (lineHeightPx - inkHeightPx) / 2 + metrics.typoAscender * fontSizePx;
  return baselineFromTopPx - centeredBaselineFromTopPx;
}

export function createTextOptions(node: TextNode) {
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;

  const area = getContentAreaIn(node);
  const glyphShiftPx = calcGlyphCenteringShiftPx(
    fontSizePx,
    lineHeight,
    node.bold ? "bold" : "normal",
  );

  return {
    ...area,
    y: area.y - pxToIn(glyphShiftPx),
    fontSize: pxToPt(fontSizePx),
    fontFace: fontFamily,
    align: node.textAlign ?? "left",
    valign: "top" as const,
    margin: 0,
    // 行送りを固定値 (spcPts) で指定する。倍率指定 (spcPct) はレンダラがフォント
    // メトリクスに対する倍率として解釈するため、計測高さ (行数 × fontSize ×
    // lineHeight) と実描画の行高さが一致せず、グリフがボックスからはみ出して
    // 上下余白が非対称になる (#846)
    lineSpacing: pxToPt(fontSizePx * lineHeight),
    rotate: node.rotate,
    color: node.color,
    bold: node.bold,
    italic: node.italic,
    underline: convertUnderline(node.underline),
    strike: convertStrike(node.strike),
    subscript: node.subscript,
    superscript: node.superscript,
    highlight: node.highlight,
    glow: convertGlow(node.glow),
    outline: convertOutline(node.outline),
    // letterSpacing はユーザー入力 px、pptxgenjs の charSpacing は pt
    charSpacing:
      node.letterSpacing !== undefined ? pxToPt(node.letterSpacing) : undefined,
  };
}
