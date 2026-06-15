export const PX_PER_IN = 96;
export const EMU_PER_IN = 914400;

export const pxToIn = (px: number) => px / PX_PER_IN;

export const pxToPt = (px: number) => (px * 72) / PX_PER_IN;

/**
 * px を DrawingML の EMU (English Metric Unit) に変換する。
 * 1 inch = 914400 EMU、96 DPI 基準で 1 px = 9525 EMU。
 * `<a:glow rad="...">` など EMU を直接埋め込む XML 後処理で使う。
 */
export const pxToEmu = (px: number) => (px * EMU_PER_IN) / PX_PER_IN;

/**
 * px 単位の矩形を pptxgenjs の位置オプション (inch 単位の x/y/w/h) に
 * まとめて変換する。addShape / addText 等のオプションへ spread して使う。
 */
export const rectPxToIn = (rect: {
  x: number;
  y: number;
  w: number;
  h: number;
}) => ({
  x: pxToIn(rect.x),
  y: pxToIn(rect.y),
  w: pxToIn(rect.w),
  h: pxToIn(rect.h),
});
