import type { POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { measureImage, getImageData } from "../../shared/measureImage.ts";
import type { BuildContext } from "../../buildContext.ts";
import { renderImageNode } from "../../renderPptx/nodes/image.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const imageNodeDef: NodeDefinition = {
  ...getNodeMetadata("image"),
  applyYogaStyle(node: POMNode, yn: YogaNode, _yoga: Yoga, ctx: BuildContext) {
    const n = node as Extract<POMNode, { type: "image" }>;
    const src = n.src;

    yn.setMeasureFunc(() => {
      const { widthPx, heightPx } = measureImage(
        src,
        ctx.imageSizeCache,
        ctx.diagnostics,
      );
      return { width: widthPx, height: heightPx };
    });
  },
  toPositioned(pom, absoluteX, absoluteY, layout, ctx) {
    const n = pom as Extract<POMNode, { type: "image" }>;
    const imageData = getImageData(n.src, ctx.imageDataCache);
    return {
      ...n,
      x: absoluteX,
      y: absoluteY,
      w: layout.width,
      h: layout.height,
      imageData,
    };
  },
  render(node, ctx) {
    renderImageNode(node as Extract<typeof node, { type: "image" }>, ctx);
  },
  collectImageSources(node) {
    const n = node as Extract<POMNode, { type: "image" }>;
    return [n.src];
  },
};
