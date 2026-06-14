import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";
import { mapBoxSpacing } from "../../shared/boxSpacing.ts";
import type { AutoFitStrategyResult } from "../strategyResult.ts";
import { toStrategyResult } from "../strategyResult.ts";

const MIN_SCALE = 0.5;

function scaleNumber(value: number, ratio: number, min: number): number {
  return Math.max(min, Math.round(value * ratio));
}

/**
 * 全サイズ関連プロパティを一律スケーリングする（フォールバック）。
 */
export function uniformScale(
  node: POMNode,
  targetRatio: number,
): AutoFitStrategyResult {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;
  let sawTarget = false;

  const scaleRunFontSizes = (runs: { fontSize?: number }[] | undefined) => {
    if (!runs) return;
    for (const run of runs) {
      if (run.fontSize === undefined) continue;
      sawTarget = true;
      const newVal = scaleNumber(run.fontSize, ratio, 8);
      if (newVal !== run.fontSize) {
        run.fontSize = newVal;
        changed = true;
      }
    }
  };

  walkPOMTree(node, (n) => {
    // fontSize
    if ("fontSize" in n && typeof n.fontSize === "number") {
      sawTarget = true;
      const newVal = scaleNumber(n.fontSize, ratio, 8);
      if (newVal !== n.fontSize) {
        (n as { fontSize: number }).fontSize = newVal;
        changed = true;
      }
    }

    // text の <Span fontSize> による run 単位上書きも一緒にスケーリング
    // (shape は runs フィールドを持たない)
    if (n.type === "text") {
      scaleRunFontSizes(n.runs);
    }

    // gap (vstack/hstack)
    if ((n.type === "vstack" || n.type === "hstack") && n.gap !== undefined) {
      sawTarget = true;
      const newVal = scaleNumber(n.gap, ratio, 1);
      if (newVal !== n.gap) {
        n.gap = newVal;
        changed = true;
      }
    }

    // padding
    if (n.padding !== undefined) {
      sawTarget = true;
      const result = mapBoxSpacing(n.padding, (v) => scaleNumber(v, ratio, 1));
      if (result.changed) {
        n.padding = result.value;
        changed = true;
      }
    }

    // table: defaultRowHeight, row.height
    if (n.type === "table") {
      if (n.defaultRowHeight !== undefined) {
        sawTarget = true;
        const newVal = scaleNumber(n.defaultRowHeight, ratio, 16);
        if (newVal !== n.defaultRowHeight) {
          n.defaultRowHeight = newVal;
          changed = true;
        }
      }
      for (const row of n.rows) {
        if (row.height !== undefined) {
          sawTarget = true;
          const newVal = scaleNumber(row.height, ratio, 16);
          if (newVal !== row.height) {
            row.height = newVal;
            changed = true;
          }
        }
      }
    }

    // ul/ol items fontSize と Li 内 <Span fontSize> も一緒にスケーリング
    if (n.type === "ul" || n.type === "ol") {
      for (const item of n.items) {
        if (item.fontSize !== undefined) {
          sawTarget = true;
          const newVal = scaleNumber(item.fontSize, ratio, 8);
          if (newVal !== item.fontSize) {
            item.fontSize = newVal;
            changed = true;
          }
        }
        scaleRunFontSizes(item.runs);
      }
    }

    // icon size
    if (n.type === "icon" && n.size !== undefined) {
      sawTarget = true;
      const newVal = scaleNumber(n.size, ratio, 8);
      if (newVal !== n.size) {
        n.size = newVal;
        changed = true;
      }
    }

    // table cells fontSize と Td 内 <Span fontSize> も一緒にスケーリング
    if (n.type === "table") {
      for (const row of n.rows) {
        for (const cell of row.cells) {
          if (cell.fontSize !== undefined) {
            sawTarget = true;
            const newVal = scaleNumber(cell.fontSize, ratio, 8);
            if (newVal !== cell.fontSize) {
              cell.fontSize = newVal;
              changed = true;
            }
          }
          scaleRunFontSizes(cell.runs);
        }
      }
    }
  });

  return toStrategyResult({ changed, sawTarget });
}
