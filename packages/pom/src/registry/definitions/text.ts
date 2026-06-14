import type { POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { measureText } from "../../calcYogaLayout/measureText.ts";
import type { BuildContext } from "../../buildContext.ts";
import { renderTextNode } from "../../renderPptx/nodes/text.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

export const textNodeDef: NodeDefinition = {
  ...getNodeMetadata("text"),
  applyYogaStyle(node: POMNode, yn: YogaNode, yoga: Yoga, ctx: BuildContext) {
    const n = node as Extract<POMNode, { type: "text" }>;
    const text = n.text;
    const baseFontSizePx = n.fontSize ?? 24;
    // runs に fontSize override がある場合は最大値で計測する（描画は run 単位で
    // 各自の fontSize が適用されるが、計測関数は単一 fontSize しか扱えないので
    // 最大値を採用して縦方向の clipping を防ぐ。
    // 横方向は最大値だと過剰評価になるが、典型ケース (大きな数字 + 小さい単位)
    // では小さい unit 部分が短く影響は軽微で、安全側に倒す）
    const fontSizePx = Math.max(
      baseFontSizePx,
      ...(n.runs?.map((r) => r.fontSize ?? baseFontSizePx) ?? []),
    );
    const fontFamily = n.fontFamily ?? "Noto Sans JP";
    const fontWeight = n.bold ? "bold" : "normal";
    const lineHeight = n.lineHeight ?? 1.3;
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
