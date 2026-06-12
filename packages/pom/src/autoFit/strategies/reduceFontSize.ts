import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";
import type { AutoFitStrategyResult } from "../strategyResult.ts";
import { toStrategyResult } from "../strategyResult.ts";

const MIN_FONT_SIZE = 10;
const MIN_SCALE = 0.6;

/**
 * テキスト系ノードの fontSize を縮小する。
 * 対象: text, ul, ol, shape
 */
export function reduceFontSize(
  node: POMNode,
  targetRatio: number,
): AutoFitStrategyResult {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;
  let sawTarget = false;

  walkPOMTree(node, (n) => {
    if (
      n.type === "text" ||
      n.type === "shape" ||
      n.type === "ul" ||
      n.type === "ol"
    ) {
      if (n.fontSize !== undefined) {
        sawTarget = true;
        const newSize = Math.max(MIN_FONT_SIZE, Math.round(n.fontSize * ratio));
        if (newSize !== n.fontSize) {
          n.fontSize = newSize;
          changed = true;
        }
      }
    }

    // ul/ol の li 要素の fontSize も縮小
    if (n.type === "ul" || n.type === "ol") {
      for (const item of n.items) {
        if (item.fontSize !== undefined) {
          sawTarget = true;
          const newSize = Math.max(
            MIN_FONT_SIZE,
            Math.round(item.fontSize * ratio),
          );
          if (newSize !== item.fontSize) {
            item.fontSize = newSize;
            changed = true;
          }
        }
      }
    }

    // table セルの fontSize も縮小
    if (n.type === "table") {
      for (const row of n.rows) {
        for (const cell of row.cells) {
          if (cell.fontSize !== undefined) {
            sawTarget = true;
            const newSize = Math.max(
              MIN_FONT_SIZE,
              Math.round(cell.fontSize * ratio),
            );
            if (newSize !== cell.fontSize) {
              cell.fontSize = newSize;
              changed = true;
            }
          }
        }
      }
    }
  });

  return toStrategyResult({ changed, sawTarget });
}
