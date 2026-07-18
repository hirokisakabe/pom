import type { POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { measureText } from "../../calcYogaLayout/measureText.ts";
import { measureFontLineHeightRatio } from "../../calcYogaLayout/fontLoader.ts";
import type { BuildContext } from "../../buildContext.ts";
import { renderUlNode, renderOlNode } from "../../renderPptx/nodes/list.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

function applyListYogaStyle(
  node: POMNode,
  yn: YogaNode,
  yoga: Yoga,
  ctx: BuildContext,
) {
  const n = node as Extract<POMNode, { type: "ul" | "ol" }>;
  const combinedText = n.items.map((item) => item.text).join("\n");
  const baseFontSizePx = n.fontSize ?? 24;
  // Li 単位の fontSize 上書きと、Li 内 <Span fontSize="..."> による run 単位
  // 上書きを両方考慮した最大値で計測する。単一 fontSize でしか計測できない
  // 制約に対する保守的な見積もりで、横方向は過剰評価になるが縦方向 clipping
  // を防ぐ。
  const fontSizePx = Math.max(
    baseFontSizePx,
    ...n.items.flatMap((item) => [
      item.fontSize ?? baseFontSizePx,
      ...(item.runs?.map(
        (r) => r.fontSize ?? item.fontSize ?? baseFontSizePx,
      ) ?? []),
    ]),
  );
  const fontFamily = n.fontFamily ?? "Noto Sans JP";
  const fontWeight = n.bold ? "bold" : "normal";
  const spacingMultiple = n.lineHeight ?? 1.3;

  const fontMetricsRatio = measureFontLineHeightRatio(fontWeight);
  const lineHeight = fontMetricsRatio * spacingMultiple;

  // バレット/番号の互換インデント幅（27pt = 36px @96dpi）
  const bulletIndentPx = 36;

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

    const textMaxWidthPx = Math.max(0, maxWidthPx - bulletIndentPx);

    const { widthPx, heightPx } = measureText(
      combinedText,
      textMaxWidthPx,
      {
        fontFamily,
        fontSizePx,
        lineHeight,
        fontWeight,
      },
      ctx.textMeasurementMode,
    );

    return {
      width: widthPx + bulletIndentPx,
      height: heightPx,
    };
  });
}

export const ulNodeDef: NodeDefinition = {
  ...getNodeMetadata("ul"),
  applyYogaStyle: applyListYogaStyle,
  render(node, ctx) {
    renderUlNode(node as Extract<typeof node, { type: "ul" }>, ctx);
  },
};

export const olNodeDef: NodeDefinition = {
  ...getNodeMetadata("ol"),
  applyYogaStyle: applyListYogaStyle,
  render(node, ctx) {
    renderOlNode(node as Extract<typeof node, { type: "ol" }>, ctx);
  },
};
