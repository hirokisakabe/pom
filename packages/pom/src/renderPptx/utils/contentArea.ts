import {
  resolveBoxSpacing,
  type BoxSpacingInput,
} from "../../shared/boxSpacing.ts";

interface ContentArea {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * ノードの padding を考慮したコンテンツ描画領域を計算する。
 * background/border はノード全体の領域 (node.x/y/w/h) に描画し、
 * コンテンツはこの関数で返される領域に描画する。
 */
export function getContentArea(node: {
  x: number;
  y: number;
  w: number;
  h: number;
  padding?: BoxSpacingInput;
}): ContentArea {
  if (node.padding === undefined) {
    return { x: node.x, y: node.y, w: node.w, h: node.h };
  }

  const { top, right, bottom, left } = resolveBoxSpacing(node.padding);

  return {
    x: node.x + left,
    y: node.y + top,
    w: Math.max(0, node.w - left - right),
    h: Math.max(0, node.h - top - bottom),
  };
}
