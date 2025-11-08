// renderPptx.ts
// layout(=px) → PptxGenJS(=inch) への最終変換

import PptxGenJS from "pptxgenjs";
import type { Positioned, Text, Image } from "./types";

export const PX_PER_IN = 96;
export const pxToIn = (px: number) => px / PX_PER_IN;
export const pxToPt = (px: number) => (px * 72) / PX_PER_IN;

type SlidePx = { w: number; h: number };

// slidePx は px（例: 1280x720）。未指定なら 13.33x7.5 inch(=16:9)に設定。
export function renderPptx(root: Positioned, slidePx?: SlidePx) {
  const autoSlidePx = slidePx ?? { w: 1280, h: 720 };
  const slideIn = { w: pxToIn(autoSlidePx.w), h: pxToIn(autoSlidePx.h) };

  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: "custom", width: slideIn.w, height: slideIn.h });
  pptx.layout = "custom";

  const slide = pptx.addSlide();

  // すべての描画対象要素（text, image）を収集
  const items: Array<{ p: Positioned; parent?: Positioned }> = [];
  walk(root, (p, parent) => {
    if (p.type === "text" || p.type === "image") {
      items.push({ p, parent });
    }
  });

  // Y座標でソート（上から下の順に描画）
  items.sort((a, b) => a.p.y - b.p.y);

  // ソートした順序で描画
  items.forEach(({ p, parent }) => {
    switch (p.type) {
      case "text": {
        const n = p.node as Text;
        const opts: any = {
          // 既定はインチ数値で渡す
          x: pxToIn(p.x),
          y: pxToIn(p.y),
          w: pxToIn(p.w),
          h: pxToIn(p.h),
          fontSize: pxToPt(n.fontPx ?? 24),
          align: n.alignText ?? "left",
          margin: 0, // 内側余白をゼロにして左右ズレを抑制
        };

        // 横幅いっぱいは % 指定に置換（中央寄せの安定化）
        if (isFullWidth(p, autoSlidePx.w)) {
          opts.x = 0;
          opts.w = "100%";
        }

        // 将来: autoFit, verticalAlign, lineHeight 等はここでオプション化
        slide.addText(n.text ?? "", opts);
        break;
      }
      case "image": {
        const n = p.node as Image;
        slide.addImage({
          path: n.src,
          x: pxToIn(p.x),
          y: pxToIn(p.y),
          w: pxToIn(p.w),
          h: pxToIn(p.h),
        });
        break;
      }
      default:
        // コンテナ系は描画しない
        break;
    }
  });

  return pptx;
}

// ツリー走査（親 Positioned を渡す）
function walk(
  p: Positioned,
  f: (p: Positioned, parent?: Positioned) => void,
  parent?: Positioned,
) {
  f(p, parent);
  p.children?.forEach((ch) => walk(ch, f, p));
}

// 「スライド基準で横いっぱい」判定（px）
function isFullWidth(p: Positioned, slideWpx: number) {
  const EPS = 0.5; // px
  return Math.abs(p.x - 0) <= EPS && Math.abs(p.w - slideWpx) <= EPS;
}
