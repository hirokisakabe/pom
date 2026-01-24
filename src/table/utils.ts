import type { TableNode } from "../types.ts";

export const DEFAULT_TABLE_ROW_HEIGHT = 32;
export const DEFAULT_TABLE_COLUMN_WIDTH = 100;

export function calcTableIntrinsicSize(node: TableNode) {
  const width = node.columns.reduce(
    (sum, column) => sum + (column.width ?? DEFAULT_TABLE_COLUMN_WIDTH),
    0,
  );
  const height = resolveRowHeights(node).reduce((sum, h) => sum + h, 0);

  return { width, height };
}

export function resolveRowHeights(node: TableNode) {
  const fallbackRowHeight = node.defaultRowHeight ?? DEFAULT_TABLE_ROW_HEIGHT;
  return node.rows.map((row) => row.height ?? fallbackRowHeight);
}

/**
 * テーブルの各カラム幅を解決する
 * - 幅が指定されているカラムはその値を使用
 * - 幅が未指定のカラムは、残りの幅を均等分割
 *
 * @param node テーブルノード
 * @param tableWidth テーブル全体の幅（レイアウト計算後の確定値）
 */
export function resolveColumnWidths(
  node: TableNode,
  tableWidth: number,
): number[] {
  const specifiedTotal = node.columns.reduce(
    (sum, col) => sum + (col.width ?? 0),
    0,
  );
  const unspecifiedCount = node.columns.filter(
    (col) => col.width === undefined,
  ).length;

  // 未指定カラムがない場合、または未指定カラムに割り当てる幅を計算
  const remainingWidth = Math.max(0, tableWidth - specifiedTotal);
  const widthPerUnspecified =
    unspecifiedCount > 0 ? remainingWidth / unspecifiedCount : 0;

  return node.columns.map((col) => col.width ?? widthPerUnspecified);
}
