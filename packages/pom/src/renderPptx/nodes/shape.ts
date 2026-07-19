import {
  asEmu,
  asHundredthPt,
  type AddShapeParagraphInput,
  type AddShapeRunPropertiesInput,
} from "@pptx-glimpse/document";
import type { BorderStyle, PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToPt } from "../units.ts";
import { getContentArea } from "../utils/contentArea.ts";
import { pxToEmu } from "../units.ts";
import {
  createGlimpseShapeRunProperties,
  toColorInput,
} from "../glimpseAdapter.ts";
import {
  cardinalConnectorSites,
  supportsCardinalConnectorSites,
} from "../utils/connectorSites.ts";
import {
  addGlimpseShape,
  createShapeBoundsInput,
  createShapeRotationInput,
  noneShapeFill,
  shapeOutline,
  solidShapeFill,
} from "../utils/glimpseShape.ts";

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

function buildShapeTextProperties(
  node: ShapePositionedNode,
): AddShapeRunPropertiesInput {
  return createGlimpseShapeRunProperties({
    fontFace: node.fontFamily,
    fontSize: node.fontSize,
    color: node.color,
    bold: node.bold,
    italic: node.italic,
    underline: node.underline,
    strike: node.strike,
    subscript: node.subscript,
    superscript: node.superscript,
    highlight: node.highlight,
  });
}

function buildShapeParagraphs(
  node: ShapePositionedNode,
): AddShapeParagraphInput[] | undefined {
  if (!node.text) return undefined;
  const fontSizePx = node.fontSize ?? 24;
  const lineHeight = node.lineHeight ?? 1.3;
  const properties = buildShapeTextProperties(node);
  return node.text
    .replace(/\r*\n/g, "\n")
    .split("\n")
    .map((text) => ({
      properties: {
        align: node.textAlign ?? "center",
        lineSpacing: asHundredthPt(
          Math.round(pxToPt(fontSizePx * lineHeight) * 100),
        ),
      },
      runs: [{ text, properties }],
    }));
}

export function renderShapeNode(
  node: ShapePositionedNode,
  ctx: RenderContext,
): void {
  const lineSpec = resolveShapeLine(node.line, node.outline);
  const boundsPx = getContentArea(node);
  const fillOpacity =
    node.fill?.transparency !== undefined
      ? 1 - node.fill.transparency / 100
      : undefined;

  const handle = addGlimpseShape(
    ctx,
    {
      geometry: { kind: "preset", preset: node.shapeType },
      ...createShapeBoundsInput(boundsPx),
      rotation: createShapeRotationInput(node.rotate),
      fill: node.fill?.color
        ? solidShapeFill(node.fill.color)
        : noneShapeFill(),
      outline: shapeOutline(lineSpec),
      effects: node.glow
        ? {
            glow: {
              radius: asEmu(Math.round(pxToEmu(node.glow.size ?? 8))),
              color: toColorInput(node.glow.color ?? "FFFFFF")!,
            },
          }
        : undefined,
      body: node.text
        ? {
            anchor: "middle",
          }
        : undefined,
      paragraphs: buildShapeParagraphs(node),
    },
    boundsPx,
    {
      fillColor: node.fill?.color,
      fillOpacity,
      glow: node.glow,
      shadow: node.shadow,
      dashType: lineSpec?.dashType,
    },
  );
  if (
    node.id &&
    ctx.idNodeMap.get(node.id) === node &&
    supportsCardinalConnectorSites(node.shapeType)
  ) {
    ctx.connectorTargetMap.set(node.id, {
      handle,
      bounds: boundsPx,
      sites: cardinalConnectorSites(boundsPx, node.rotate),
    });
  }
}
