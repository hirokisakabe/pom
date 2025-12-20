import type { ChartNode, ChartType, ChartData } from "../types";
import type { Chart, CommonChart, ChartType as PptxChartType } from "./types";
import { ptToPx, normalizeColor } from "./units";

/**
 * pptxtojsonのchartType から POMのChartType へのマッピング
 * 3Dチャートは2D相当として扱う
 */
const CHART_TYPE_MAP: Record<PptxChartType, ChartType | null> = {
  barChart: "bar",
  bar3DChart: "bar",
  lineChart: "line",
  line3DChart: "line",
  pieChart: "pie",
  pie3DChart: "pie",
  areaChart: "area",
  area3DChart: "area",
  doughnutChart: "doughnut",
  radarChart: "radar",
  // サポートされていないチャートタイプ
  scatterChart: null,
  bubbleChart: null,
  surfaceChart: null,
  surface3DChart: null,
  stockChart: null,
};

/**
 * pptxtojsonのchartTypeをPOMのChartTypeに変換
 * サポートされていない場合はnullを返す
 */
function mapChartType(chartType: PptxChartType): ChartType | null {
  return CHART_TYPE_MAP[chartType];
}

/**
 * CommonChartかどうかをチェック
 */
function isCommonChart(chart: Chart): chart is CommonChart {
  return (
    chart.chartType !== "scatterChart" && chart.chartType !== "bubbleChart"
  );
}

/**
 * pptxtojsonのChart要素をPOMのChartNodeに変換
 * scatter/bubbleチャートはサポートされていないためnullを返す
 * 位置情報は含まない（convertSlide で処理）
 */
export function convertChart(element: Chart): ChartNode | null {
  // scatter/bubbleチャートはサポートされていない
  if (!isCommonChart(element)) {
    return null;
  }

  const pomChartType = mapChartType(element.chartType);
  if (pomChartType === null) {
    return null;
  }

  // データの変換
  // pptxtojson: { key: string, values: { x: string, y: number }[], xlabels: { [key]: string } }
  // pom: { name?: string, labels: string[], values: number[] }
  const data: ChartData[] = element.data.map((item) => {
    const labels = item.values.map((v) => v.x);
    const values = item.values.map((v) => v.y);

    return {
      name: item.key || undefined,
      labels,
      values,
    };
  });

  const result: ChartNode = {
    type: "chart",
    chartType: pomChartType,
    data,
    w: ptToPx(element.width),
    h: ptToPx(element.height),
  };

  // チャートの色
  if (element.colors && element.colors.length > 0) {
    result.chartColors = element.colors.map(normalizeColor);
  }

  // radarチャートのスタイル
  if (pomChartType === "radar") {
    result.radarStyle = "standard";
  }

  return result;
}
