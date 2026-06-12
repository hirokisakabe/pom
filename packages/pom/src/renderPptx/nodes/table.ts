import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import {
  resolveColumnWidths,
  resolveRowHeights,
} from "../../shared/tableUtils.ts";
import { pxToIn, pxToPt, rectPxToIn } from "../units.ts";
import { convertUnderline, convertStrike } from "../textOptions.ts";
import { getContentArea } from "../utils/contentArea.ts";

type TablePositionedNode = Extract<PositionedNode, { type: "table" }>;

export function renderTableNode(
  node: TablePositionedNode,
  ctx: RenderContext,
): void {
  const tableRows = node.rows.map((row) =>
    row.cells.map((cell) => {
      const cellFontFace = cell.fontFamily;
      const cellOptions: Record<string, unknown> = {
        fontSize: pxToPt(cell.fontSize ?? 18),
        fontFace: cellFontFace,
        color: cell.color,
        bold: cell.bold,
        italic: cell.italic,
        underline: convertUnderline(cell.underline),
        strike: convertStrike(cell.strike),
        highlight: cell.highlight,
        align: cell.textAlign ?? "left",
        fill: cell.backgroundColor
          ? { color: cell.backgroundColor }
          : undefined,
        colspan: cell.colspan,
        rowspan: cell.rowspan,
      };

      if (cell.runs && cell.runs.length > 0) {
        const textItems = cell.runs.map((run) => ({
          text: run.text,
          options: {
            fontSize: pxToPt(cell.fontSize ?? 18),
            fontFace: run.fontFamily ?? cellFontFace,
            color: run.color ?? cell.color,
            bold: run.bold ?? cell.bold,
            italic: run.italic ?? cell.italic,
            underline: convertUnderline(run.underline ?? cell.underline),
            strike: convertStrike(run.strike ?? cell.strike),
            highlight: run.highlight ?? cell.highlight,
            ...(run.href ? { hyperlink: { url: run.href } } : {}),
          },
        }));
        return {
          text: textItems,
          options: {
            align: cell.textAlign ?? "left",
            fill: cell.backgroundColor
              ? { color: cell.backgroundColor }
              : undefined,
            colspan: cell.colspan,
            rowspan: cell.rowspan,
          },
        };
      }

      return {
        text: cell.text,
        options: cellOptions,
      };
    }),
  );

  const content = getContentArea(node);
  const tableOptions: Record<string, unknown> = {
    ...rectPxToIn(content),
    colW: resolveColumnWidths(node, content.w).map((width) => pxToIn(width)),
    rowH: resolveRowHeights(node).map((height) => pxToIn(height)),
    margin: 0,
  };

  if (node.cellBorder) {
    tableOptions.border = {
      color: node.cellBorder.color ?? "000000",
      pt:
        node.cellBorder.width !== undefined ? pxToPt(node.cellBorder.width) : 1,
      type: node.cellBorder.dashType ?? "solid",
    };
  }

  ctx.slide.addTable(tableRows, tableOptions);
}
