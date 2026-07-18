import type { POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { measureText } from "../../calcYogaLayout/measureText.ts";
import type { BuildContext } from "../../buildContext.ts";
import { renderShapeNode } from "../../renderPptx/nodes/shape.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const shapeNodeDef: NodeDefinition = {
  ...getNodeMetadata("shape"),
  applyYogaStyle(node: POMNode, yn: YogaNode, yoga: Yoga, ctx: BuildContext) {
    const n = node as Extract<POMNode, { type: "shape" }>;
    if (n.text) {
      const text = n.text;
      const fontSizePx = n.fontSize ?? 24;
      const fontFamily = n.fontFamily ?? "Noto Sans JP";
      const fontWeight = n.bold ? "bold" : "normal";
      const lineHeight = n.lineHeight ?? 1.3;

      yn.setMeasureFunc((width, widthMode) => {
        const maxWidthPx = (() => {
          switch (widthMode) {
            case yoga.MEASURE_MODE_UNDEFINED:
              return Number.POSITIVE_INFINITY;
            case yoga.MEASURE_MODE_EXACTLY:
            case yoga.MEASURE_MODE_AT_MOST:
              return width;
            default:
              return Number.POSITIVE_INFINITY;
          }
        })();

        const { widthPx, heightPx } = measureText(
          text,
          maxWidthPx,
          {
            fontFamily,
            fontSizePx,
            lineHeight,
            fontWeight,
          },
          ctx.textMeasurementMode,
          ctx.fontRegistry,
        );

        return { width: widthPx, height: heightPx };
      });
    }
  },
  render(node, ctx) {
    renderShapeNode(node as Extract<typeof node, { type: "shape" }>, ctx);
  },
};
