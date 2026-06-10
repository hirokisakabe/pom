import type { POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { measureText } from "../../calcYogaLayout/measureText.ts";
import type { BuildContext } from "../../buildContext.ts";
import { renderTextNode } from "../../renderPptx/nodes/text.ts";

export const textNodeDef: NodeDefinition = {
  type: "text",
  category: "leaf",
  applyYogaStyle(node: POMNode, yn: YogaNode, yoga: Yoga, ctx: BuildContext) {
    const n = node as Extract<POMNode, { type: "text" }>;
    const text = n.text;
    const fontSizePx = n.fontSize ?? 24;
    const fontFamily = n.fontFamily ?? "Noto Sans JP";
    const fontWeight = n.bold ? "bold" : "normal";
    const lineHeight = 1.3;
    const letterSpacingPx = n.letterSpacing;

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
          letterSpacingPx,
        },
        ctx.textMeasurementMode,
      );

      return { width: widthPx, height: heightPx };
    });
  },
  render(node, ctx) {
    renderTextNode(node as Extract<typeof node, { type: "text" }>, ctx);
  },
};
