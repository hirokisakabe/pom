import type { POMNode } from "../../types.ts";
import { walkPOMTree } from "../../shared/walkTree.ts";

const MIN_FONT_SIZE = 10;
const MIN_SCALE = 0.6;

/**
 * テキスト系ノードの fontSize を縮小する。
 * 対象: text, ul, ol, shape
 * @returns 変更があった場合 true
 */
export function reduceFontSize(node: POMNode, targetRatio: number): boolean {
  const ratio = Math.max(targetRatio, MIN_SCALE);
  let changed = false;

  walkPOMTree(node, (n) => {
    switch (n.type) {
      case "text":
      case "shape":
      case "ul":
      case "ol": {
        if (n.fontSize !== undefined) {
          const newSize = Math.max(
            MIN_FONT_SIZE,
            Math.round(n.fontSize * ratio),
          );
          if (newSize !== n.fontSize) {
            n.fontSize = newSize;
            changed = true;
          }
        }
        break;
      }
      default:
        break;
    }

    // ul/ol の li 要素の fontSize も縮小
    if (n.type === "ul" || n.type === "ol") {
      for (const item of n.items) {
        if (item.fontSize !== undefined) {
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

  return changed;
}
