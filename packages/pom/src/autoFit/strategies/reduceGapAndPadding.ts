import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";
import { mapBoxSpacing } from "../../shared/boxSpacing.ts";
import type { AutoFitStrategyResult } from "../strategyResult.ts";
import { toStrategyResult } from "../strategyResult.ts";

const MIN_GAP = 2;
const MIN_PADDING = 2;
const MIN_SCALE = 0.25;

/**
 * gap と padding を縮小する。
 */
export function reduceGapAndPadding(
  node: POMNode,
  targetRatio: number,
): AutoFitStrategyResult {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;
  let sawTarget = false;

  walkPOMTree(node, (n) => {
    // gap の縮小（vstack, hstack）
    if ((n.type === "vstack" || n.type === "hstack") && n.gap !== undefined) {
      sawTarget = true;
      const newGap = Math.max(MIN_GAP, Math.round(n.gap * ratio));
      if (newGap !== n.gap) {
        n.gap = newGap;
        changed = true;
      }
    }

    // padding の縮小
    if (n.padding !== undefined) {
      sawTarget = true;
      const result = mapBoxSpacing(n.padding, (v) =>
        Math.max(MIN_PADDING, Math.round(v * ratio)),
      );
      if (result.changed) {
        n.padding = result.value;
        changed = true;
      }
    }
  });

  return toStrategyResult({ changed, sawTarget });
}
