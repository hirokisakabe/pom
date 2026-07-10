/**
 * 見た目属性 (fill / border / shadow / opacity / borderRadius) を
 * pptxgenjs のオプションへ変換する共通 resolver 群。
 *
 * ノードごとに変換ロジックが重複・乖離すると、XML 上は同じ指定でも
 * 描画結果が異なるリスクがあるため、属性値 → pptxgenjs オプションの
 * 純粋変換をここに集約する。
 *
 * 共通化対象の属性カテゴリ:
 * - fill (背景色 + opacity): resolveBackgroundFill / opacityToTransparency
 * - border / line (枠線): hasVisibleBorder / convertBorderLine
 * - shadow (影): convertShadow
 * - borderRadius (角丸): resolveRectRadius
 *
 * 既存 helper との責務境界:
 * - utils/glimpseShape.ts: backgroundGradient を writer 生成 XML の native
 *   gradFill として出力する。
 * - utils/backgroundBorder.ts: 背景色 → 背景画像 → ボーダーの描画順序の
 *   オーケストレーション。個々の属性値の変換は本モジュールに委譲する。
 * - textOptions.ts: テキスト系属性 (font / underline / strike など) の変換。
 */
import type { BorderStyle, ShadowStyle } from "../../types.ts";
import { pxToPt } from "../units.ts";

/**
 * 色文字列から "#" を 1 つ取り除き、pptxgenjs が受け付ける HEX 文字列にする。
 * undefined はそのまま返すため `stripHash(color) ?? fallback` の形で使える。
 */
export function stripHash(color: string | undefined): string | undefined {
  return color?.replace("#", "");
}

/**
 * ShadowStyle を pptxgenjs の shadow オプションに変換する
 * type 未指定時は outer をデフォルトとする
 */
export function convertShadow(shadow: ShadowStyle | undefined):
  | {
      type: "outer" | "inner";
      opacity?: number;
      blur?: number;
      angle?: number;
      offset?: number;
      color?: string;
    }
  | undefined {
  if (!shadow) return undefined;
  return {
    type: shadow.type ?? "outer",
    opacity: shadow.opacity,
    blur: shadow.blur,
    angle: shadow.angle,
    offset: shadow.offset,
    color: shadow.color,
  };
}

/**
 * border が描画対象となる指定 (color / width / dashType のいずれか) を
 * 持つかを判定する
 */
export function hasVisibleBorder(
  border: BorderStyle | undefined,
): border is BorderStyle {
  return Boolean(
    border &&
    (border.color !== undefined ||
      border.width !== undefined ||
      border.dashType !== undefined),
  );
}

export const BORDER_SIDES = ["top", "right", "bottom", "left"] as const;
export type BorderSide = (typeof BORDER_SIDES)[number];

export type PerSideBorders = Partial<Record<BorderSide, BorderStyle>>;

/**
 * 4 辺一律の border と辺ごとの borderTop / borderRight / borderBottom /
 * borderLeft をマージし、描画対象となる辺ごとの BorderStyle を返す。
 *
 * - 辺ごとの指定が 1 つも無い場合は undefined を返し、呼び出し側は
 *   従来の 4 辺一律描画 (shape の line オプション) にフォールバックする
 * - 辺ごとの指定がある場合、各辺は border をベースに辺ごとの指定で
 *   フィールド単位に上書きした BorderStyle になる (辺ごとの指定が優先)
 * - マージ結果が描画対象とならない辺 (指定なし) は結果に含まれない
 */
export function resolvePerSideBorders(style: {
  border?: BorderStyle;
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
}): PerSideBorders | undefined {
  const overrides: Partial<Record<BorderSide, BorderStyle | undefined>> = {
    top: style.borderTop,
    right: style.borderRight,
    bottom: style.borderBottom,
    left: style.borderLeft,
  };

  const hasPerSideOverride = Object.values(overrides).some(hasVisibleBorder);
  if (!hasPerSideOverride) return undefined;

  const result: PerSideBorders = {};
  for (const side of BORDER_SIDES) {
    const merged = { ...style.border, ...overrides[side] };
    if (hasVisibleBorder(merged)) {
      result[side] = merged;
    }
  }
  return result;
}

/**
 * BorderStyle を pptxgenjs の line オプションに変換する
 * width はユーザー入力 px、pptxgenjs の line.width は pt
 *
 * @param fallbackColor color 未指定時に使う色。省略時は color を
 *   undefined のまま渡し pptxgenjs のデフォルトに任せる
 */
export function convertBorderLine(
  border: BorderStyle,
  fallbackColor?: string,
): { color?: string; width?: number; dashType?: BorderStyle["dashType"] } {
  return {
    color: border.color ?? fallbackColor,
    width: border.width !== undefined ? pxToPt(border.width) : undefined,
    dashType: border.dashType,
  };
}

/**
 * ノードの opacity (0-1、1 = 不透明) を pptxgenjs の
 * transparency (0-100、100 = 透明) に変換する
 */
export function opacityToTransparency(
  opacity: number | undefined,
): number | undefined {
  return opacity !== undefined ? (1 - opacity) * 100 : undefined;
}

/**
 * backgroundColor / opacity / 互換用のグラデーション fallback 色から
 * pptxgenjs の fill オプションを解決する
 *
 * gradientMarker は旧 pptxgenjs 経路との互換 helper 用に残している。
 * writer 経路の backgroundGradient は utils/glimpseShape.ts 側で native
 * gradFill に変換する。
 */
export function resolveBackgroundFill(
  backgroundColor: string | undefined,
  opacity: number | undefined,
  gradientMarker: string | undefined,
): { color?: string; transparency?: number } {
  if (gradientMarker) return { color: gradientMarker };
  return {
    color: backgroundColor,
    transparency: opacityToTransparency(opacity),
  };
}

/**
 * borderRadius (px) をノードサイズに対する 0-1 の正規化値
 * (pptxgenjs roundRect の rectRadius) に変換する
 */
export function resolveRectRadius(
  borderRadius: number | undefined,
  w: number,
  h: number,
): number | undefined {
  return borderRadius
    ? Math.min((borderRadius / Math.min(w, h)) * 2, 1)
    : undefined;
}
