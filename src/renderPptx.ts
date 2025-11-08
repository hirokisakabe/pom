// layout(=px) → PptxGenJS(=inch) への最終変換

import PptxGenJS from "pptxgenjs";
import type { Positioned, Text, Image, Shape } from "./types";

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

  // すべての描画対象要素（text, image, shape）を収集
  const items: Array<{ p: Positioned; parent?: Positioned }> = [];
  walk(root, (p, parent) => {
    if (p.type === "text" || p.type === "image" || p.type === "shape") {
      items.push({ p, parent });
    }
  });

  // z優先 → y で安定ソート
  items.sort((a, b) => {
    const za = (a.p.node as any)?.z ?? 0;
    const zb = (b.p.node as any)?.z ?? 0;
    if (za !== zb) return za - zb;
    return a.p.y - b.p.y;
  });

  // ソートした順序で描画
  items.forEach(({ p }) => {
    switch (p.type) {
      case "text": {
        const n = p.node as Text;
        const opts: any = {
          x: pxToIn(p.x),
          y: pxToIn(p.y),
          w: pxToIn(p.w),
          h: pxToIn(p.h),
          fontSize: pxToPt(n.fontPx ?? 24),
          align: n.alignText ?? "left",
          valign: n.verticalAlign ?? "top",
          margin: 0,
        };

        // 横幅いっぱいは % 指定に置換（中央寄せの安定化）
        if (isFullWidth(p, autoSlidePx.w)) {
          opts.x = 0;
          opts.w = "100%";
        }

        // 将来: lineHeight / autoFit 等が必要ならここで追加
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

      case "shape": {
        const n = p.node as Shape;

        // 形状マッピング
        const shapeType = mapShapeKind(n.shapeKind);

        // 塗りと枠線
        const fill =
          n.fill?.color != null
            ? {
                color: normalizeColor(n.fill.color),
                // 透明度: 0..1 → 0..100 に変換（PptxGenJS は transparency 0=不透明,100=完全透明）
                ...(typeof n.fill.opacity === "number"
                  ? {
                      transparency: Math.max(
                        0,
                        Math.min(100, (1 - n.fill.opacity) * 100),
                      ),
                    }
                  : {}),
              }
            : undefined;

        const line =
          n.border &&
          (n.border.color || n.border.width != null || n.border.dash)
            ? {
                color: normalizeColor(n.border.color ?? "#000000"),
                width:
                  n.border.width != null ? pxToPt(n.border.width) : undefined,
                dashType: dashMap[n.border.dash ?? "solid"],
              }
            : undefined;

        // 図形本体
        slide.addShape(shapeType, {
          x: pxToIn(p.x),
          y: pxToIn(p.y),
          w: pxToIn(p.w),
          h: pxToIn(p.h),
          fill,
          line,
          rotate: (n.rotate ?? 0) as number,
        });

        // テキストがあれば重ね描き
        if (n.text) {
          slide.addText(n.text, {
            x: pxToIn(p.x),
            y: pxToIn(p.y),
            w: pxToIn(p.w),
            h: pxToIn(p.h),
            shape: shapeType,
            fontSize: pxToPt(n.fontPx ?? 16),
            align: n.alignText ?? "center",
            valign: n.verticalAlign ?? "middle",
            margin: 0,
          });
        }
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

// 図形名の対応
function mapShapeKind(kind: Shape["shapeKind"]): any {
  // PptxGenJS の ShapeType に合うものへ変換
  // 参考：rect, roundRect, ellipse, triangle, diamond, rightArrow, leftArrow, upArrow, downArrow, line, cloud, wedgeRectCallout など
  switch (kind) {
    case "rect":
      return (PptxGenJS as any).ShapeType?.rect ?? "rect";
    case "roundRect":
      return (PptxGenJS as any).ShapeType?.roundRect ?? "roundRect";
    case "circle":
      return (PptxGenJS as any).ShapeType?.ellipse ?? "ellipse";
    case "triangle":
      return (PptxGenJS as any).ShapeType?.triangle ?? "triangle";
    case "diamond":
      return (PptxGenJS as any).ShapeType?.diamond ?? "diamond";
    case "rightArrow":
      return (PptxGenJS as any).ShapeType?.rightArrow ?? "rightArrow";
    case "leftArrow":
      return (PptxGenJS as any).ShapeType?.leftArrow ?? "leftArrow";
    case "upArrow":
      return (PptxGenJS as any).ShapeType?.upArrow ?? "upArrow";
    case "downArrow":
      return (PptxGenJS as any).ShapeType?.downArrow ?? "downArrow";
    case "line":
      return (PptxGenJS as any).ShapeType?.line ?? "line";
    case "cloud":
      return (PptxGenJS as any).ShapeType?.cloud ?? "cloud";
    case "callout":
      // 代表で角丸吹き出しに寄せる
      return (
        (PptxGenJS as any).ShapeType?.wedgeRectCallout ?? "wedgeRectCallout"
      );
    default:
      return (PptxGenJS as any).ShapeType?.rect ?? "rect";
  }
}

const dashMap = {
  solid: "solid",
  dot: "sysDot",
  dash: "dash",
} as const;

// #RGB/#RRGGBB を PptxGenJS 期待形式へ
function normalizeColor(c?: string) {
  if (!c) return undefined;
  // 先頭の # を除去
  const hex = c.startsWith("#") ? c.slice(1) : c;
  if (hex.length === 3) {
    const [r, g, b] = hex.split("");
    return `${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return hex.toUpperCase();
}
