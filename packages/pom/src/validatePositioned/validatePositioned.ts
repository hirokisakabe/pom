import type { BuildContext } from "../buildContext.ts";
import { getNodeDef } from "../registry/index.ts";
import type { PositionedNode } from "../types.ts";

/** 浮動小数点演算とサブピクセル丸めの揺れを誤検知しないための許容量 (px) */
const EPSILON = 0.5;

/**
 * toPositioned 後の絶対座標ツリーを走査し、レイアウト上の問題を
 * Diagnostic (警告) として報告する。ビルドは止めない。
 *
 * - NODE_OUT_OF_BOUNDS: ノードの矩形がスライド境界からはみ出している
 * - NODE_OVERLAP: VStack / HStack 内の兄弟ノード同士が意図せず重なっている
 *
 * 意図的な重なり (Layer 配下・position="absolute"・負 margin / gap・
 * zIndex 明示) は検出対象外とし、誤検知を避ける。
 */
export function validatePositioned(
  node: PositionedNode,
  slideSize: { w: number; h: number },
  ctx: BuildContext,
  slideIndex: number,
): void {
  walk(node, describeNode(node));

  function walk(n: PositionedNode, path: string): boolean {
    // はみ出しの原因に最も近いノードを特定できるよう、子孫がはみ出して
    // いる場合は親 (巻き添えではみ出すコンテナ) の報告を抑制する
    let descendantOutOfBounds = false;

    if (n.type === "vstack" || n.type === "hstack" || n.type === "layer") {
      const children: PositionedNode[] = n.children;
      if (n.type !== "layer") {
        reportSiblingOverlap(n, children, path);
      }
      children.forEach((child, i) => {
        descendantOutOfBounds =
          walk(child, childPath(path, child, i)) || descendantOutOfBounds;
      });
    }

    if (descendantOutOfBounds) return true;
    return reportOutOfBounds(n, path);
  }

  function reportOutOfBounds(n: PositionedNode, path: string): boolean {
    // Line は線分座標 (x1,y1-x2,y2)、Arrow は id 参照ベースのため矩形判定の対象外
    if (n.type === "line" || n.type === "arrow") return false;
    // rotate は renderPptx でのみ適用され、回転後の境界はここでは分からない
    if ("rotate" in n && n.rotate) return false;

    const over: string[] = [];
    if (-n.x > EPSILON) over.push(`left by ${fmt(-n.x)}px`);
    if (-n.y > EPSILON) over.push(`top by ${fmt(-n.y)}px`);
    if (n.x + n.w - slideSize.w > EPSILON) {
      over.push(`right by ${fmt(n.x + n.w - slideSize.w)}px`);
    }
    if (n.y + n.h - slideSize.h > EPSILON) {
      over.push(`bottom by ${fmt(n.y + n.h - slideSize.h)}px`);
    }
    if (over.length === 0) return false;

    ctx.diagnostics.add(
      "NODE_OUT_OF_BOUNDS",
      `slide ${slideIndex + 1}: ${path} (${fmtRect(n)}) extends beyond the slide bounds (${slideSize.w}x${slideSize.h}): ${over.join(", ")}`,
    );
    return true;
  }

  function reportSiblingOverlap(
    n: Extract<PositionedNode, { type: "vstack" | "hstack" }>,
    children: PositionedNode[],
    path: string,
  ): void {
    // 負 gap は重ねるための明示指定 (例: ProcessArrow 風の表現) なので対象外
    if ((n.gap ?? 0) < 0) return;

    const candidates = children
      .map((child, i) => ({ child, i }))
      .filter(({ child }) => !isIntentionalOverlap(child));

    for (let a = 0; a < candidates.length; a++) {
      for (let b = a + 1; b < candidates.length; b++) {
        const { child: ca, i: ia } = candidates[a];
        const { child: cb, i: ib } = candidates[b];
        const w = Math.min(ca.x + ca.w, cb.x + cb.w) - Math.max(ca.x, cb.x);
        const h = Math.min(ca.y + ca.h, cb.y + cb.h) - Math.max(ca.y, cb.y);
        if (w > EPSILON && h > EPSILON) {
          ctx.diagnostics.add(
            "NODE_OVERLAP",
            `slide ${slideIndex + 1}: ${path}: children ${describeChild(ca, ia)} (${fmtRect(ca)}) and ${describeChild(cb, ib)} (${fmtRect(cb)}) overlap by ${fmt(w)}x${fmt(h)}px`,
          );
        }
      }
    }
  }
}

/** 意図的な重なりとして兄弟重なり検査から除外すべき子か */
function isIntentionalOverlap(n: PositionedNode): boolean {
  if (n.position === "absolute") return true;
  if (n.zIndex !== undefined) return true;
  return hasNegativeMargin(n.margin);
}

function hasNegativeMargin(margin: PositionedNode["margin"]): boolean {
  if (margin === undefined) return false;
  if (typeof margin === "number") return margin < 0;
  return [margin.top, margin.right, margin.bottom, margin.left].some(
    (v) => (v ?? 0) < 0,
  );
}

function describeNode(n: PositionedNode): string {
  const tag = getNodeDef(n.type).tagName;
  return n.id ? `<${tag} id="${n.id}">` : `<${tag}>`;
}

function describeChild(n: PositionedNode, index: number): string {
  return `${describeNode(n)}[${index}]`;
}

function childPath(
  parentPath: string,
  child: PositionedNode,
  index: number,
): string {
  return `${parentPath} > ${describeChild(child, index)}`;
}

function fmt(v: number): number {
  return Math.round(v * 10) / 10;
}

function fmtRect(n: { x: number; y: number; w: number; h: number }): string {
  return `x=${fmt(n.x)}, y=${fmt(n.y)}, w=${fmt(n.w)}, h=${fmt(n.h)}`;
}
