// すべて px で計算。emit 時に inch へ変換する。

import {
  Node,
  Text,
  Image,
  Box,
  VStack,
  HStack,
  Constraints,
  Positioned,
  Px,
  Length,
  Spacing,
  Align,
  Shape, // ← 追加
} from "./types";

// ---------- utils ----------

type TRBL = { top: Px; right: Px; bottom: Px; left: Px };

function clamp(v: number, min?: number, max?: number) {
  if (min != null) v = Math.max(v, min);
  if (max != null) v = Math.min(v, max);
  return v;
}

// テスト可能にするためexportするが、内部APIとして扱う
export function resolveLength(v: Length | undefined, parent: Px): Px {
  if (v == null || v === "max") return parent;
  if (typeof v === "string" && v.endsWith("%"))
    return (parent * parseFloat(v)) / 100;
  return v as Px; // 型アサーションで解決
}

export function toTRBL(sp?: Spacing): TRBL {
  if (sp == null) return { top: 0, right: 0, bottom: 0, left: 0 };
  if (typeof sp === "number")
    return { top: sp, right: sp, bottom: sp, left: sp };
  return {
    top: sp.top ?? 0,
    right: sp.right ?? 0,
    bottom: sp.bottom ?? 0,
    left: sp.left ?? 0,
  };
}

// 親の content box（padding 除去後）
function contentBoxSize(
  node: { w?: Length; h?: Length; padding?: Spacing },
  c: Constraints,
) {
  const pad = toTRBL(node.padding);
  const w = resolveLength(node.w, c.w);
  const h = resolveLength(node.h, c.h);
  return {
    pad,
    contentW: Math.max(0, w - (pad.left + pad.right)),
    contentH: Math.max(0, h - (pad.top + pad.bottom)),
    outerW: w,
    outerH: h,
  };
}

// ---------- public API ----------

export function layout(root: Node, slide: Constraints): Positioned {
  const rel = layoutRel(root, slide);
  absolutize(rel, 0, 0);
  return rel;
}

export function absolutize(p: Positioned, ax: number, ay: number) {
  p.x += ax;
  p.y += ay;
  p.children?.forEach((ch) => absolutize(ch, p.x, p.y));
}

// ---------- measure helpers ----------

export function measureTextPx(
  text: string = "",
  fontPx = 24,
  maxW?: Px,
  lineHeight?: number,
) {
  const charPx = fontPx * 0.6; // 近似
  const lh = lineHeight ?? fontPx * 1.2; // 近似行高
  if (maxW == null) {
    const w = text.replace(/\n/g, "").length * charPx;
    const lines = Math.max(1, text.split("\n").length);
    const h = lines * lh;
    return { w, h };
  }
  let widthPx = 0,
    maxLinePx = 0,
    lines = 1;
  for (const ch of text) {
    if (ch === "\n" || widthPx + charPx > maxW) {
      maxLinePx = Math.max(maxLinePx, widthPx);
      widthPx = 0;
      lines++;
      if (ch === "\n") continue;
    }
    widthPx += charPx;
  }
  maxLinePx = Math.max(maxLinePx, widthPx);
  const w = Math.min(maxW, maxLinePx);
  const h = lines * lh;
  return { w, h };
}

// ---------- node layouts ----------

function layoutRel(node: Node, c: Constraints): Positioned {
  switch (node.type) {
    case "text":
      return layoutText(node, c);
    case "image":
      return layoutImage(node, c);
    case "box":
      return layoutBox(node, c);
    case "vstack":
      return layoutStack(node, c, "v");
    case "hstack":
      return layoutStack(node, c, "h");
    case "shape":
      return layoutShape(node, c); // ← 追加
  }
}

function layoutText(node: Text, c: Constraints): Positioned {
  const { pad, contentW, contentH, outerW, outerH } = contentBoxSize(node, c);

  // 中央寄せはボックス幅を親幅に（誤差吸収）
  const wantFull =
    node.alignText === "center" && (node.w == null || node.w === "max");
  const maxW = wantFull ? contentW : resolveLength(node.w ?? "max", contentW);

  const { w: mw, h: mh } = measureTextPx(
    node.text,
    node.fontPx ?? 24,
    maxW,
    node.lineHeight,
  );
  const W = clamp(wantFull ? contentW : mw, node.minW, node.maxW);
  const H = clamp(
    node.h ? resolveLength(node.h, contentH) : mh,
    node.minH,
    node.maxH,
  );

  // 内側パディング考慮（Text自体は padding 分を外枠に持つ）
  const w = node.w ? resolveLength(node.w, c.w) : W + pad.left + pad.right;
  const h = node.h ? resolveLength(node.h, c.h) : H + pad.top + pad.bottom;

  // Textは相対原点に置く
  return { type: "text", node, x: 0, y: 0, w, h };
}

function layoutImage(node: Image, c: Constraints): Positioned {
  const { pad, contentW, contentH } = contentBoxSize(node, c);
  const ar = node.aspectRatio ?? 16 / 9;

  // 幅優先
  let innerW = resolveLength(node.w ?? "max", contentW);
  let innerH = node.h != null ? resolveLength(node.h, contentH) : innerW / ar;

  if (node.h != null && node.w == null) {
    innerH = resolveLength(node.h, contentH);
    innerW = innerH * ar;
  }

  const w = innerW + pad.left + pad.right;
  const h = innerH + pad.top + pad.bottom;

  return { type: "image", node, x: 0, y: 0, w, h };
}

function layoutShape(node: Shape, c: Constraints): Positioned {
  // Shape は w/h が無ければ内容テキストで自動採寸。無ければデフォルトサイズ。
  const pad = toTRBL(node.padding);
  const contentWAvail = Math.max(0, c.w - (pad.left + pad.right));
  const contentHAvail = Math.max(0, c.h - (pad.top + pad.bottom));

  // テキストがあれば採寸
  const hasText = !!node.text && node.text.length > 0;
  const measured = hasText
    ? measureTextPx(node.text!, node.fontPx ?? 16, contentWAvail)
    : { w: 0, h: 0 };

  // 内側サイズ決定
  let innerW =
    node.w != null
      ? resolveLength(node.w, c.w) - (pad.left + pad.right)
      : hasText
        ? measured.w
        : Math.min(120, contentWAvail); // デフォルト幅

  let innerH =
    node.h != null
      ? resolveLength(node.h, c.h) - (pad.top + pad.bottom)
      : hasText
        ? measured.h
        : Math.min(60, contentHAvail); // デフォルト高

  innerW = Math.max(0, innerW);
  innerH = Math.max(0, innerH);

  // 折り返しを考慮して再採寸（w が既定で高さが未指定のとき）
  if (hasText && node.w != null && node.h == null) {
    const re = measureTextPx(node.text!, node.fontPx ?? 16, innerW);
    innerH = re.h;
  }

  // 最小最大制約
  const outerW = clamp(innerW + pad.left + pad.right, node.minW, node.maxW);
  const outerH = clamp(innerH + pad.top + pad.bottom, node.minH, node.maxH);

  return { type: "shape", node, x: 0, y: 0, w: outerW, h: outerH };
}

function layoutBox(node: Box, c: Constraints): Positioned {
  const { pad, contentW, contentH, outerW, outerH } = contentBoxSize(node, c);

  let child: Positioned | undefined;
  if (node.children?.length) {
    child = layoutRel(node.children[0], { w: contentW, h: contentH });
    if (node.align === "stretch") child.w = contentW; // 横 stretch
  }

  const w = node.w ? outerW : (child?.w ?? 0) + pad.left + pad.right;
  const h = node.h ? outerH : (child?.h ?? 0) + pad.top + pad.bottom;

  if (child) {
    // 横方向の揃え
    child.x =
      pad.left +
      (node.align === "center"
        ? (contentW - child.w) / 2
        : node.align === "end"
          ? contentW - child.w
          : 0);
    // 縦方向は上寄せ
    child.y = pad.top;
  }

  return {
    type: "box",
    node,
    x: 0,
    y: 0,
    w,
    h,
    children: child ? [child] : undefined,
  };
}

function layoutStack(
  node: VStack | HStack,
  c: Constraints,
  axis: "v" | "h",
): Positioned {
  const { pad } = { pad: toTRBL(node.padding) };
  const wAvail = resolveLength(node.w, c.w);
  const hAvail = resolveLength(node.h, c.h);
  const contentW = Math.max(0, wAvail - (pad.left + pad.right));
  const contentH = Math.max(0, hAvail - (pad.top + pad.bottom));

  const gap = node.gap ?? 0;
  const children: Positioned[] = [];
  let mainSum = 0;

  for (const ch of node.children ?? []) {
    const p = layoutRel(ch, { w: contentW, h: contentH });
    children.push(p);
    mainSum += axis === "v" ? p.h : p.w;
  }

  const gaps = Math.max(0, children.length - 1) * gap;
  const mainSize = mainSum + gaps;
  const free = (axis === "v" ? contentH : contentW) - mainSize;

  const justify = node.justify ?? "start";
  const align = (node.alignItems ?? "start") as Align;

  const mainOffset =
    justify === "center"
      ? Math.max(0, free / 2)
      : justify === "end"
        ? Math.max(0, free)
        : justify === "spaceBetween" && children.length > 1
          ? 0
          : 0;

  // spaceBetween は gap を再計算
  const effGap =
    justify === "spaceBetween" && children.length > 1
      ? Math.max(0, (axis === "v" ? contentH : contentW) - mainSum) /
        (children.length - 1)
      : gap;

  // 交差軸方向の最大サイズを先に計算（VStackなら子の最大幅、HStackなら子の最大高さ）
  const crossMax =
    children.length > 0
      ? Math.max(...children.map((c) => (axis === "v" ? c.w : c.h)))
      : 0;

  // HStackでnode.h未指定の場合、alignItems計算にはcrossMaxを使う
  const alignBaseH = axis === "h" && !node.h ? crossMax : contentH;
  const alignBaseW = axis === "v" && !node.w ? crossMax : contentW;

  let run = mainOffset;
  for (const p of children) {
    if (axis === "v") {
      if (align === "stretch") p.w = contentW;
      const xOff =
        align === "center"
          ? (alignBaseW - p.w) / 2
          : align === "end"
            ? alignBaseW - p.w
            : 0;
      p.x = pad.left + xOff;
      p.y = pad.top + run;
      run += p.h + effGap;
    } else {
      if (align === "stretch") p.h = contentH;
      const yOff =
        align === "center"
          ? (alignBaseH - p.h) / 2
          : align === "end"
            ? alignBaseH - p.h
            : 0;
      p.x = pad.left + run;
      p.y = pad.top + yOff;
      run += p.w + effGap;
    }
  }

  const w = node.w
    ? wAvail
    : (axis === "v" ? crossMax : mainSize) + pad.left + pad.right;
  const h = node.h
    ? hAvail
    : (axis === "v" ? mainSize : crossMax) + pad.top + pad.bottom;

  return { type: node.type, node, x: 0, y: 0, w, h, children };
}
