import type { BorderStyle, PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToPt } from "../units.ts";
import { convertUnderline, convertStrike } from "../textOptions.ts";
import { getContentAreaIn } from "../utils/contentArea.ts";
import { convertBorderLine, convertShadow } from "../utils/visualStyle.ts";

type ShapePositionedNode = Extract<PositionedNode, { type: "shape" }>;

/**
 * outline (Text と同じ書式の `outline.size` / `outline.color`) と
 * 既存 `line` 属性 (`line.color` / `line.width` / `line.dashType`) を
 * 1 つの BorderStyle にマージする。
 *
 * フィールド単位のマージで、`outline` の指定があるフィールドは `line` を
 * 上書きするが、`outline` 側で省略されたフィールドは `line` の値を引き継ぎ、
 * `line` にも値が無い場合は Text outline と同じ既定値 (`width: 1pt 相当` /
 * `color: FFFFFF`) を採用する。`dashType` は `outline` に対応フィールドが
 * 無いため `line.dashType` をそのまま使う。
 */
function resolveShapeLine(
  line: BorderStyle | undefined,
  outline: { size?: number; color?: string } | undefined,
): BorderStyle | undefined {
  if (!outline) return line;
  return {
    color: outline.color ?? line?.color ?? "FFFFFF",
    width: outline.size ?? line?.width ?? 1,
    dashType: line?.dashType,
  };
}

export function renderShapeNode(
  node: ShapePositionedNode,
  ctx: RenderContext,
): void {
  const lineSpec = resolveShapeLine(node.line, node.outline);
  const glowMarker = node.glow
    ? ctx.buildContext.glowEffects.register(node.glow)
    : undefined;

  const shapeOptions = {
    ...getContentAreaIn(node),
    fill: node.fill
      ? {
          color: node.fill.color,
          transparency: node.fill.transparency,
        }
      : undefined,
    line: lineSpec ? convertBorderLine(lineSpec) : undefined,
    shadow: convertShadow(node.shadow),
    rotate: node.rotate,
    objectName: glowMarker,
  };

  if (node.text) {
    const fontSizePx = node.fontSize ?? 24;
    const lineHeight = node.lineHeight ?? 1.3;
    // テキストがある場合：addTextでshapeを指定
    ctx.slide.addText(node.text, {
      ...shapeOptions,
      shape: node.shapeType,
      fontSize: pxToPt(fontSizePx),
      fontFace: node.fontFamily ?? "Noto Sans JP",
      color: node.color,
      bold: node.bold,
      italic: node.italic,
      underline: convertUnderline(node.underline),
      strike: convertStrike(node.strike),
      subscript: node.subscript,
      superscript: node.superscript,
      highlight: node.highlight,
      align: node.textAlign ?? "center",
      valign: "middle" as const,
      // Text と同じく行送りを固定値 (spcPts) で指定し、計測高さ
      // (行数 × fontSize × lineHeight) と実描画の行高さを一致させる (#846)。
      // valign middle のためテキストブロックは枠内中央に配置され、
      // Text のような描画 y 補正は不要
      lineSpacing: pxToPt(fontSizePx * lineHeight),
    });
  } else {
    // テキストがない場合：addShapeを使用
    ctx.slide.addShape(node.shapeType, shapeOptions);
  }
}
