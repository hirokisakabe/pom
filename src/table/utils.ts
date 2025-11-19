import type { TableNode } from "../types";

export const DEFAULT_TABLE_ROW_HEIGHT = 32;

export function calcTableIntrinsicSize(node: TableNode) {
  const width = node.columns.reduce((sum, column) => sum + column.width, 0);
  const height = resolveRowHeights(node).reduce((sum, h) => sum + h, 0);

  return { width, height };
}

export function resolveRowHeights(node: TableNode) {
  const fallbackRowHeight = node.defaultRowHeight ?? DEFAULT_TABLE_ROW_HEIGHT;
  return node.rows.map((row) => row.height ?? fallbackRowHeight);
}
