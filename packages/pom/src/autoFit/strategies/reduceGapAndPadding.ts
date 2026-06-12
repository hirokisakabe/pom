import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";
import { mapBoxSpacing } from "../../shared/boxSpacing.ts";

const MIN_GAP = 2;
const MIN_PADDING = 2;
const MIN_SCALE = 0.25;

/**
 * gap と padding を縮小する。
 * @returns 変更があった場合 true
 */
export function reduceGapAndPadding(
  node: POMNode,
  targetRatio: number,
): boolean {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;

  walkPOMTree(node, (n) => {
    // gap の縮小（vstack, hstack）
    if ((n.type === "vstack" || n.type === "hstack") && n.gap !== undefined) {
      const newGap = Math.max(MIN_GAP, Math.round(n.gap * ratio));
      if (newGap !== n.gap) {
        n.gap = newGap;
        changed = true;
      }
    }

    // padding の縮小
    if (n.padding !== undefined) {
      const result = mapBoxSpacing(n.padding, (v) =>
        Math.max(MIN_PADDING, Math.round(v * ratio)),
      );
      if (result.changed) {
        n.padding = result.value;
        changed = true;
      }
    }
  });

  return changed;
}
