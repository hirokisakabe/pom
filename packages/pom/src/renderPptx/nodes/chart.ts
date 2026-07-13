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
  const chartColors =
    node.chartColors ??
    (node.chartType === "pie" || node.chartType === "doughnut"
      ? DEFAULT_PIE_CHART_COLORS
      : DEFAULT_BAR_CHART_COLORS);
  const marker = ctx.buildContext.glimpseTextBoxes.registerChart(
    {
      chartType: node.chartType,
      series: node.data.map((series, index) => ({
        name: series.name,
        categories: series.labels,
        values: series.values,
        color: chartColors[index % chartColors.length],
      })),
      offsetX: asEmu(Math.round(pxToEmu(content.x))),
      offsetY: asEmu(Math.round(pxToEmu(content.y))),
      width: asEmu(Math.round(pxToEmu(content.w))),
      height: asEmu(Math.round(pxToEmu(content.h))),
      title: !isSparkline && node.showTitle ? node.title : undefined,
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
    { pointColors: chartColors },
  );
  addGlimpseGraphicFrameMarker(ctx, marker, content);
}
