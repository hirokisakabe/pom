import type { TableNode, TableRow, TableCell, TableColumn } from "../types";
import type { Table, TableCell as PptxTableCell } from "./types";
import { ptToPx, normalizeColor } from "./units";
import { extractPlainText } from "./parseHtml";

/**
 * pptxtojsonのTableCell要素をPOMのTableCellに変換
 */
function convertCell(cell: PptxTableCell): TableCell {
  const result: TableCell = {
    text: extractPlainText(cell.text),
  };

  if (cell.fontColor) {
    result.color = normalizeColor(cell.fontColor);
  }

  if (cell.fontBold) {
    result.bold = true;
  }

  if (cell.fillColor) {
    result.backgroundColor = normalizeColor(cell.fillColor);
  }

  return result;
}

/**
 * pptxtojsonのTable要素をPOMのTableNodeに変換
 */
export function convertTable(element: Table): TableNode {
  // 列幅の変換
  const columns: TableColumn[] = element.colWidths.map((width) => ({
    width: ptToPx(width),
  }));

  // 行データの変換
  const rows: TableRow[] = element.data.map((rowCells, rowIndex) => {
    const cells: TableCell[] = rowCells.map((cell) => convertCell(cell));

    const row: TableRow = { cells };

    // 行の高さ
    if (element.rowHeights && element.rowHeights[rowIndex]) {
      row.height = ptToPx(element.rowHeights[rowIndex]);
    }

    return row;
  });

  return {
    type: "table",
    columns,
    rows,
    w: ptToPx(element.width),
    h: ptToPx(element.height),
  };
}
