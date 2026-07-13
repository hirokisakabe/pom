import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import {
  resolveColumnWidths,
  resolveRowHeights,
} from "../../shared/tableUtils.ts";
import {
  asEmu,
  asPt,
  type AddTableCellInput,
  type AddTableRowInput,
  type AddTableRunInput,
} from "@pptx-glimpse/document";
import { pxToEmu, pxToPt } from "../units.ts";
import { getContentArea } from "../utils/contentArea.ts";
import { addGlimpseGraphicFrameMarker } from "../utils/glimpseGraphicFrame.ts";
import { cleanHex, type TableRunCompatibility } from "../glimpseTextBoxes.ts";
import { resolveSubSup } from "../textOptions.ts";

type TablePositionedNode = Extract<PositionedNode, { type: "table" }>;

export function renderTableNode(
  node: TablePositionedNode,
  ctx: RenderContext,
): void {
  const content = getContentArea(node);
  const rowHeights = resolveRowHeights(node);
  const border = node.cellBorder
    ? {
        width: asEmu(Math.round(pxToEmu(node.cellBorder.width ?? 1 / 0.75))),
        color: cleanHex(node.cellBorder.color) ?? "000000",
        dash: toTableDash(node.cellBorder.dashType),
      }
    : undefined;
  const marker = ctx.buildContext.glimpseTextBoxes.registerTable(
    {
      offsetX: asEmu(Math.round(pxToEmu(content.x))),
      offsetY: asEmu(Math.round(pxToEmu(content.y))),
      width: asEmu(Math.round(pxToEmu(Math.max(content.w, 1)))),
      height: asEmu(Math.round(pxToEmu(Math.max(content.h, 1)))),
      columnWidths: resolveColumnWidths(node, content.w).map((width) =>
        asEmu(Math.round(pxToEmu(Math.max(width, 1)))),
      ),
      rows: buildTableRows(node, rowHeights, border),
    },
    {
      runProperties: buildTableRunCompatibility(node),
      borderDash: node.cellBorder?.dashType,
    },
  );
  addGlimpseGraphicFrameMarker(ctx, marker, content);
}

function buildTableRunCompatibility(
  node: TablePositionedNode,
): TableRunCompatibility[] {
  return node.rows.flatMap((row) =>
    row.cells.flatMap((cell) => {
      const runs = cell.runs?.length ? cell.runs : [{ text: cell.text }];
      return runs.map((run) => {
        const underline = run.underline ?? cell.underline;
        const subSup = resolveSubSup(run, cell);
        return {
          strike: run.strike ?? cell.strike,
          baseline: subSup.subscript
            ? "subscript"
            : subSup.superscript
              ? "superscript"
              : undefined,
          highlight: run.highlight ?? cell.highlight,
          underlineStyle:
            typeof underline === "object"
              ? (underline.style ?? "sng")
              : undefined,
          underlineColor:
            typeof underline === "object" ? underline.color : undefined,
        } satisfies TableRunCompatibility;
      });
    }),
  );
}

function buildTableRows(
  node: TablePositionedNode,
  rowHeights: number[],
  border:
    | {
        width: ReturnType<typeof asEmu>;
        color: string;
        dash: "solid" | "dash" | "dot" | "dashDot" | undefined;
      }
    | undefined,
): AddTableRowInput[] {
  const columnCount = node.columns.length;
  const continuationCells = new Set<string>();
  return node.rows.map((row, rowIndex) => {
    const cells: AddTableCellInput[] = Array.from({ length: columnCount });
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      if (continuationCells.has(`${rowIndex}:${columnIndex}`)) {
        cells[columnIndex] = {};
      }
    }

    let columnIndex = 0;
    for (const cell of row.cells) {
      while (cells[columnIndex] !== undefined) columnIndex += 1;
      cells[columnIndex] = {
        runs: buildTableRuns(cell),
        fill: cleanHex(cell.backgroundColor),
        align: cell.textAlign ?? "left",
        borders: border
          ? { top: border, right: border, bottom: border, left: border }
          : undefined,
        colspan: cell.colspan,
        rowspan: cell.rowspan,
      };
      const colspan = cell.colspan ?? 1;
      const rowspan = cell.rowspan ?? 1;
      for (let y = rowIndex; y < rowIndex + rowspan; y += 1) {
        for (let x = columnIndex; x < columnIndex + colspan; x += 1) {
          if (x === columnIndex && y === rowIndex) continue;
          continuationCells.add(`${y}:${x}`);
          if (y === rowIndex) cells[x] = {};
        }
      }
      columnIndex += colspan;
    }

    for (let index = 0; index < cells.length; index += 1) {
      if (cells[index] === undefined) cells[index] = {};
    }
    return {
      height: asEmu(
        Math.round(pxToEmu(Math.max(rowHeights[rowIndex] ?? 0, 1))),
      ),
      cells,
    };
  });
}

function buildTableRuns(
  cell: TablePositionedNode["rows"][number]["cells"][number],
): AddTableRunInput[] {
  const runs = cell.runs?.length ? cell.runs : [{ text: cell.text }];
  return runs.map((run) => ({
    text: run.text,
    properties: {
      fontSize: asPt(pxToPt(run.fontSize ?? cell.fontSize ?? 18)),
      fontFace: run.fontFamily ?? cell.fontFamily,
      color: cleanHex(run.color ?? cell.color),
      bold: run.bold ?? cell.bold,
      italic: run.italic ?? cell.italic,
      underline: Boolean(run.underline ?? cell.underline),
    },
    hyperlink: run.href,
  }));
}

function toTableDash(
  dash: NonNullable<TablePositionedNode["cellBorder"]>["dashType"],
): "solid" | "dash" | "dot" | "dashDot" | undefined {
  if (dash === "solid" || dash === "dash" || dash === "dashDot") return dash;
  if (dash === "sysDot") return "dot";
  return dash ? "dash" : undefined;
}
