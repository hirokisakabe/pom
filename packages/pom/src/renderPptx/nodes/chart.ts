import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { getContentAreaIn } from "../utils/contentArea.ts";

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

  // sparkline モードは bar / line / area のみ対応。pie / doughnut / radar は
  // 元々凡例 / 軸の概念が異なるため sparkline=true でも通常描画にフォールバックする。
  const isSparkline =
    node.sparkline === true &&
    (node.chartType === "bar" ||
      node.chartType === "line" ||
      node.chartType === "area");

  const chartOptions: Record<string, unknown> = {
    ...getContentAreaIn(node),
    showLegend: isSparkline ? false : (node.showLegend ?? false),
    showTitle: isSparkline ? false : (node.showTitle ?? false),
    title: isSparkline ? undefined : node.title,
    chartColors: node.chartColors,
  };

  // radar専用オプション
  if (node.chartType === "radar" && node.radarStyle) {
    chartOptions.radarStyle = node.radarStyle;
  }

  // sparkline モード: 凡例 / 軸 / グリッド線 / マージンをすべて非表示にし、
  // プロット領域をチャート領域いっぱいに広げて小寸法でも視認できるようにする
  if (isSparkline) {
    chartOptions.catAxisHidden = true;
    chartOptions.valAxisHidden = true;
    chartOptions.catAxisLineShow = false;
    chartOptions.valAxisLineShow = false;
    chartOptions.showCatAxisTitle = false;
    chartOptions.showValAxisTitle = false;
    chartOptions.catGridLine = { style: "none" };
    chartOptions.valGridLine = { style: "none" };
    chartOptions.chartArea = {
      fill: { type: "solid", color: "FFFFFF", transparency: 100 },
      border: { color: "FFFFFF", pt: 0 },
      roundedCorners: false,
    };
    chartOptions.plotArea = {
      fill: { type: "solid", color: "FFFFFF", transparency: 100 },
      border: { color: "FFFFFF", pt: 0 },
    };
    chartOptions.layout = { x: 0, y: 0, w: 1, h: 1 };
  }

  ctx.slide.addChart(node.chartType, chartData, chartOptions);
}
