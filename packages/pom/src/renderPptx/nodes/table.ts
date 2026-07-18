import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import {
  resolveColumnWidths,
  resolveRowHeights,
} from "../../shared/tableUtils.ts";
import {
  asEmu,
  asOoxmlPercent,
  asPt,
  type AddTableCellInput,
  type AddTableRowInput,
  type AddTableRunInput,
  type SourceDashStyle,
} from "@pptx-glimpse/document";
import { pxToEmu, pxToPt } from "../units.ts";
import { getContentArea } from "../utils/contentArea.ts";
import { cleanHex, toColorInput } from "../pptxAuthoring.ts";
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
  ctx.buildContext.pptxAuthoring.registerTable({
    offsetX: asEmu(Math.round(pxToEmu(content.x))),
    offsetY: asEmu(Math.round(pxToEmu(content.y))),
    width: asEmu(Math.round(pxToEmu(Math.max(content.w, 1)))),
    height: asEmu(Math.round(pxToEmu(Math.max(content.h, 1)))),
    columnWidths: resolveColumnWidths(node, content.w).map((width) =>
      asEmu(Math.round(pxToEmu(Math.max(width, 1)))),
    ),
    rows: buildTableRows(node, rowHeights, border),
  });
}

function buildTableRows(
  node: TablePositionedNode,
  rowHeights: number[],
  border:
    | {
        width: ReturnType<typeof asEmu>;
        color: string;
        dash: SourceDashStyle | undefined;
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
        marginLeft: asEmu(0),
        marginRight: asEmu(0),
        marginTop: asEmu(0),
        marginBottom: asEmu(0),
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
  return runs.flatMap((run) => {
    const underline = run.underline ?? cell.underline;
    const subSup = resolveSubSup(run, cell);
    const properties = {
      fontSize: asPt(pxToPt(run.fontSize ?? cell.fontSize ?? 18)),
      fontFace: run.fontFamily ?? cell.fontFamily,
      color: cleanHex(run.color ?? cell.color),
      bold: run.bold ?? cell.bold,
      italic: run.italic ?? cell.italic,
      underline:
        typeof underline === "object"
          ? {
              style: underline.style,
              color: toColorInput(underline.color),
            }
          : Boolean(underline),
      strike: run.strike ?? cell.strike,
      baseline: subSup.subscript
        ? { type: "percent" as const, value: asOoxmlPercent(-40000) }
        : subSup.superscript
          ? { type: "percent" as const, value: asOoxmlPercent(30000) }
          : undefined,
      highlight: toColorInput(run.highlight ?? cell.highlight),
    };
    const lines = run.text.replace(/\r*\n/g, "\n").split("\n");
    return lines.map((line, index) => ({
      text: index === 0 ? line : `\n${line}`,
      properties,
      hyperlink: run.href,
    }));
  });
}

function toTableDash(
  dash: NonNullable<TablePositionedNode["cellBorder"]>["dashType"],
): SourceDashStyle | undefined {
  return dash;
}
