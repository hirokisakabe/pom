import type { NodeDefinition } from "../types.ts";
import { renderChartNode } from "../../renderPptx/nodes/chart.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const chartNodeDef: NodeDefinition = {
  ...getNodeMetadata("chart"),
  render(node, ctx) {
    renderChartNode(node as Extract<typeof node, { type: "chart" }>, ctx);
  },
};
