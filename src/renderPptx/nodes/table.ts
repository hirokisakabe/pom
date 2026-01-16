import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { resolveColumnWidths, resolveRowHeights } from "../../table/utils";
import { pxToIn, pxToPt } from "../units";

type TablePositionedNode = Extract<PositionedNode, { type: "table" }>;

export function renderTableNode(
  node: TablePositionedNode,
  ctx: RenderContext,
): void {
  const tableRows = node.rows.map((row) =>
    row.cells.map((cell) => {
      const cellOptions = {
        fontSize: pxToPt(cell.fontPx ?? 18),
        color: cell.color,
        bold: cell.bold,
        align: cell.alignText ?? "left",
        fill: cell.backgroundColor
          ? { color: cell.backgroundColor }
          : undefined,
      };

      return {
        text: cell.text,
        options: cellOptions,
      };
    }),
  );

  const tableOptions = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    colW: resolveColumnWidths(node, node.w).map((width) => pxToIn(width)),
    rowH: resolveRowHeights(node).map((height) => pxToIn(height)),
    margin: 0,
  };

  ctx.slide.addTable(tableRows, tableOptions);
}
