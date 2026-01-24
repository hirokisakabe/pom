import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn } from "../units.ts";

type ChartPositionedNode = Extract<PositionedNode, { type: "chart" }>;

export function renderChartNode(
  node: ChartPositionedNode,
  ctx: RenderContext,
): void {
  const chartData = node.data.map((d) => ({
    name: d.name,
    labels: d.labels,
    values: d.values,
  }));

  const chartOptions: Record<string, unknown> = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    showLegend: node.showLegend ?? false,
    showTitle: node.showTitle ?? false,
    title: node.title,
    chartColors: node.chartColors,
  };

  // radar専用オプション
  if (node.chartType === "radar" && node.radarStyle) {
    chartOptions.radarStyle = node.radarStyle;
  }

  ctx.slide.addChart(node.chartType, chartData, chartOptions);
}
