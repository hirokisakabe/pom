/** AutoFit strategy が変更を適用できなかった理由 */
export type AutoFitSkipReason =
  /** 調整対象となる属性を持つノードが存在しない */
  | "no-target"
  /** 調整対象はあるが、すべて下限値に達していて縮小余地がない */
  | "already-at-minimum";

/** AutoFit strategy の適用結果 */
export type AutoFitStrategyResult =
  | { changed: true }
  | { changed: false; reason: AutoFitSkipReason };

/**
 * strategy 内部で集計した「変更有無」「調整対象の有無」から共通 result を組み立てる。
 */
export function toStrategyResult(params: {
  changed: boolean;
  sawTarget: boolean;
}): AutoFitStrategyResult {
  if (params.changed) {
    return { changed: true };
  }
  return {
    changed: false,
    reason: params.sawTarget ? "already-at-minimum" : "no-target",
  };
}
