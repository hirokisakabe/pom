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

  const scale = (current: number) =>
    Math.max(MIN_FONT_SIZE, Math.round(current * ratio));

  const scaleRuns = (runs: { fontSize?: number }[] | undefined) => {
    if (!runs) return;
    for (const run of runs) {
      if (run.fontSize === undefined) continue;
      sawTarget = true;
      const newSize = scale(run.fontSize);
      if (newSize !== run.fontSize) {
        run.fontSize = newSize;
        changed = true;
      }
    }
  };

  walkPOMTree(node, (n) => {
    if (
      n.type === "text" ||
      n.type === "shape" ||
      n.type === "ul" ||
      n.type === "ol"
    ) {
      if (n.fontSize !== undefined) {
        sawTarget = true;
        const newSize = scale(n.fontSize);
        if (newSize !== n.fontSize) {
          n.fontSize = newSize;
          changed = true;
        }
      }
    }

    // text の <Span fontSize> による run 単位上書きも一緒に縮小する
    // (shape は runs フィールドを持たない)
    if (n.type === "text") {
      scaleRuns(n.runs);
    }

    // ul/ol の li 要素の fontSize と <Span fontSize> による run 単位上書きも縮小
    if (n.type === "ul" || n.type === "ol") {
      for (const item of n.items) {
        if (item.fontSize !== undefined) {
          sawTarget = true;
          const newSize = scale(item.fontSize);
          if (newSize !== item.fontSize) {
            item.fontSize = newSize;
            changed = true;
          }
        }
        scaleRuns(item.runs);
      }
    }

    // table セルの fontSize と <Span fontSize> による run 単位上書きも縮小
    if (n.type === "table") {
      for (const row of n.rows) {
        for (const cell of row.cells) {
          if (cell.fontSize !== undefined) {
            sawTarget = true;
            const newSize = scale(cell.fontSize);
            if (newSize !== cell.fontSize) {
              cell.fontSize = newSize;
              changed = true;
            }
          }
          scaleRuns(cell.runs);
        }
      }
    }
  });

  return toStrategyResult({ changed, sawTarget });
}
