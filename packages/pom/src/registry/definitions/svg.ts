import type { POMNode } from "../../types.ts";
import type { NodeDefinition } from "../types.ts";
import { rasterizeSvgContent } from "../../icons/index.ts";
import { renderSvgNode } from "../../renderPptx/nodes/svg.ts";

export const svgNodeDef: NodeDefinition = {
  type: "svg",
  category: "leaf",
  applyYogaStyle(node, yn) {
    const n = node as Extract<POMNode, { type: "svg" }>;
    const width = n.w ?? 24;
    const height = n.h ?? 24;
    yn.setMeasureFunc(() => ({ width, height }));
  },
  async toPositioned(pom, absoluteX, absoluteY, layout, ctx) {
    const n = pom as Extract<POMNode, { type: "svg" }>;
    const rasterWidth = Math.ceil(layout.width);
    const rasterHeight = Math.ceil(layout.height);
    const iconImageData = await rasterizeSvgContent(
      n.svgContent,
      rasterWidth,
      n.color,
      ctx.iconRasterCache,
      rasterHeight,
    );

    return {
      ...n,
      x: absoluteX,
      y: absoluteY,
      w: layout.width,
      h: layout.height,
      iconImageData,
    };
  },
  render(node, ctx) {
    renderSvgNode(node as Extract<typeof node, { type: "svg" }>, ctx);
  },
};
