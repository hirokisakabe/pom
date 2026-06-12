export const PX_PER_IN = 96;

export const pxToIn = (px: number) => px / PX_PER_IN;

export const pxToPt = (px: number) => (px * 72) / PX_PER_IN;

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
