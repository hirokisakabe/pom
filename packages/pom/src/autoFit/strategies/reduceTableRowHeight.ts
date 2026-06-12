import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";
import type { AutoFitStrategyResult } from "../strategyResult.ts";
import { toStrategyResult } from "../strategyResult.ts";

const MIN_ROW_HEIGHT = 20;
const MIN_SCALE = 0.5;

/**
 * テーブルの defaultRowHeight と各行の height を縮小する。
 */
export function reduceTableRowHeight(
  node: POMNode,
  targetRatio: number,
): AutoFitStrategyResult {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;
  let sawTarget = false;

  walkPOMTree(node, (n) => {
    if (n.type !== "table") return;

    if (n.defaultRowHeight !== undefined) {
      sawTarget = true;
      const newHeight = Math.max(
        MIN_ROW_HEIGHT,
        Math.round(n.defaultRowHeight * ratio),
      );
      if (newHeight !== n.defaultRowHeight) {
        n.defaultRowHeight = newHeight;
        changed = true;
      }
    }

    for (const row of n.rows) {
      if (row.height !== undefined) {
        sawTarget = true;
        const newHeight = Math.max(
          MIN_ROW_HEIGHT,
          Math.round(row.height * ratio),
        );
        if (newHeight !== row.height) {
          row.height = newHeight;
          changed = true;
        }
      }
    }
  });

  return toStrategyResult({ changed, sawTarget });
}
