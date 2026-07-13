import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { asEmu } from "@pptx-glimpse/document";
import { pxToEmu } from "../units.ts";
import { getContentArea } from "../utils/contentArea.ts";
import { addGlimpseGraphicFrameMarker } from "../utils/glimpseGraphicFrame.ts";

type ChartPositionedNode = Extract<PositionedNode, { type: "chart" }>;

const DEFAULT_BAR_CHART_COLORS = [
  "C0504D",
  "4F81BD",
  "9BBB59",
  "8064A2",
  "4BACC6",
  "F79646",
  "628FC6",
  "C86360",
  "C0504D",
  "4F81BD",
  "9BBB59",
  "8064A2",
  "4BACC6",
  "F79646",
  "628FC6",
  "C86360",
];
const DEFAULT_PIE_CHART_COLORS = [
  "5DA5DA",
  "FAA43A",
  "60BD68",
  "F17CB0",
  "B2912F",
  "B276B2",
  "DECF3F",
  "F15854",
  "A7A7A7",
  "5DA5DA",
  "FAA43A",
  "60BD68",
  "F17CB0",
  "B2912F",
  "B276B2",
  "DECF3F",
  "F15854",
  "A7A7A7",
];

export function renderChartNode(
  node: ChartPositionedNode,
  ctx: RenderContext,
): void {
  // sparkline モードは bar / line / area のみ対応。pie / doughnut / radar は
  // 元々凡例 / 軸の概念が異なるため sparkline=true でも通常描画にフォールバックする。
  const isSparkline =
    node.sparkline === true &&
    (node.chartType === "bar" ||
      node.chartType === "line" ||
      node.chartType === "area");

  const content = getContentArea(node);
  const series = normalizeChartSeries(node.data);
  const chartColors =
    node.chartColors ??
    (node.chartType === "pie" || node.chartType === "doughnut"
      ? DEFAULT_PIE_CHART_COLORS
      : DEFAULT_BAR_CHART_COLORS);
  const pointColors =
    chartColors.length > 0 &&
    (node.chartType === "pie" ||
      node.chartType === "doughnut" ||
      (node.chartType === "bar" &&
        node.data.length === 1 &&
        node.chartColors !== undefined &&
        node.chartColors.length > 1))
      ? node.data[0]?.values.map(
          (_value, index) => chartColors[index % chartColors.length],
        )
      : undefined;
  const marker = ctx.buildContext.glimpseTextBoxes.registerChart(
    {
      chartType: node.chartType,
      series: series.map((item, index) => ({
        name: item.name,
        categories: item.labels,
        values: item.values,
        color: chartColors[index % chartColors.length],
      })),
      offsetX: asEmu(Math.round(pxToEmu(content.x))),
      offsetY: asEmu(Math.round(pxToEmu(content.y))),
      width: asEmu(Math.round(pxToEmu(Math.max(content.w, 1)))),
      height: asEmu(Math.round(pxToEmu(Math.max(content.h, 1)))),
      title:
        !isSparkline && node.showTitle
          ? node.title || "Chart Title"
          : undefined,
      showLegend: isSparkline ? false : (node.showLegend ?? false),
      radarStyle: node.chartType === "radar" ? node.radarStyle : undefined,
      categoryAxis: isSparkline
        ? { hidden: true, lineVisible: false, gridLinesVisible: false }
        : undefined,
      valueAxis: isSparkline
        ? { hidden: true, lineVisible: false, gridLinesVisible: false }
        : undefined,
      plotLayout: isSparkline ? { x: 0, y: 0, width: 1, height: 1 } : undefined,
    },
    { pointColors },
  );
  addGlimpseGraphicFrameMarker(ctx, marker, content);
}

/**
 * glimpse の native writer は全系列で同じ category 軸と同じ点数を要求する。
 * pptxgenjs が受理していた不揃いな入力も生成を継続できるよう、位置ベースで
 * category を共有し、欠けた値を 0 で補う。
 */
function normalizeChartSeries(data: ChartPositionedNode["data"]) {
  const pointCount = Math.max(
    0,
    ...data.flatMap((series) => [series.labels.length, series.values.length]),
  );
  const categories = Array.from(
    { length: pointCount },
    (_, index) =>
      data.find((series) => series.labels[index] !== undefined)?.labels[
        index
      ] ?? "",
  );
  return data.map((series) => ({
    name: series.name,
    labels: categories,
    values: Array.from(
      { length: pointCount },
      (_, index) => series.values[index] ?? 0,
    ),
  }));
}
