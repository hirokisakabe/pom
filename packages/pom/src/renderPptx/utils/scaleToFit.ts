import type { DiagnosticCollector } from "../../diagnostics.ts";
import type { RenderContext } from "../types.ts";
import { getContentArea } from "./contentArea.ts";

const MIN_SCALE_THRESHOLD = 0.5;

/**
 * 割り当てサイズと固有サイズからスケール係数を計算する。
 *
 * - scaleFactor = min(allocatedW / intrinsicW, allocatedH / intrinsicH, 1.0)
 * - scaleFactor < MIN_SCALE_THRESHOLD の場合、閾値でクランプして diagnostics に記録
 */
export function calcScaleFactor(
  allocatedW: number,
  allocatedH: number,
  intrinsicW: number,
  intrinsicH: number,
  nodeType: string,
  diagnostics: DiagnosticCollector,
): number {
  if (intrinsicW <= 0 || intrinsicH <= 0) return 1.0;

  const scaleX = allocatedW / intrinsicW;
  const scaleY = allocatedH / intrinsicH;
  let scaleFactor = Math.min(scaleX, scaleY, 1.0);

  if (scaleFactor < MIN_SCALE_THRESHOLD) {
    diagnostics.add(
      "SCALE_BELOW_THRESHOLD",
      `${nodeType} node: scale factor ${scaleFactor.toFixed(2)} is below threshold ${MIN_SCALE_THRESHOLD}. Content may overflow.`,
    );
    scaleFactor = MIN_SCALE_THRESHOLD;
  }

  return scaleFactor;
}

/**
 * scaleToFit 系 diagram renderer (timeline / matrix / flow / processArrow /
 * pyramid / tree) の共通前処理。padding を除いたコンテンツ領域と、
 * 固有サイズに対するスケール係数をまとめて解決する。
 *
 * diagnostics のラベルには node.type を使うため、renderer ごとに
 * ノードタイプ文字列を手書きする必要がない。
 */
export function resolveScaledContentArea(
  node: Parameters<typeof getContentArea>[0] & { type: string },
  intrinsic: { width: number; height: number },
  ctx: RenderContext,
): { content: ReturnType<typeof getContentArea>; scaleFactor: number } {
  const content = getContentArea(node);
  const scaleFactor = calcScaleFactor(
    content.w,
    content.h,
    intrinsic.width,
    intrinsic.height,
    node.type,
    ctx.buildContext.diagnostics,
  );
  return { content, scaleFactor };
}
