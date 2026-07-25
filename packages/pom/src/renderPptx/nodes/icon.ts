import { asEmu } from "@pptx-glimpse/document";
import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { toColorInput } from "../glimpseAdapter.ts";
import { pxToEmu } from "../units.ts";
import {
  addGlimpsePicture,
  imageBytesFromSource,
} from "../utils/glimpsePicture.ts";
import {
  addGlimpseShape,
  createShapeBoundsInput,
  createShapeRotationInput,
  noShapeOutline,
  noneShapeFill,
  shapeOutline,
  solidShapeFill,
} from "../utils/glimpseShape.ts";

type IconPositionedNode = Extract<PositionedNode, { type: "icon" }>;

export function renderIconNode(
  node: IconPositionedNode,
  ctx: RenderContext,
): void {
  // variant 指定時は背景図形を描画
  if (node.variant) {
    const isCircle = node.variant.startsWith("circle");
    const isFilled = node.variant.endsWith("-filled");
    const bgColor = node.bgColor ?? "#E0E0E0";
    const colorValue = bgColor.replace(/^#/, "");

    // 背景図形の line のデフォルト: outlined variant は colorValue / 1.5pt 相当 (2px)、
    // filled variant は undefined (枠線なし)。
    const variantDefaultLine = isFilled
      ? undefined
      : { color: colorValue, width: 2 };
    // outline 指定時は variant のデフォルト line とフィールド単位でマージする。
    // outline 側で省略された属性は variant default の値を引き継ぐので、例えば
    // outlined variant に `outline.color` だけ指定すると、太さは 1.5pt のまま
    // 色だけ outline で上書きされる。
    const outlineLine = node.outline
      ? {
          color: node.outline.color ?? variantDefaultLine?.color ?? "FFFFFF",
          width:
            node.outline.size !== undefined
              ? node.outline.size
              : (variantDefaultLine?.width ?? 1),
        }
      : variantDefaultLine;

    const bounds = {
      x: node.bgX ?? node.x,
      y: node.bgY ?? node.y,
      w: node.bgW ?? node.w,
      h: node.bgH ?? node.h,
    };
    const shapeType = isCircle ? "ellipse" : "roundRect";

    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: shapeType },
        ...createShapeBoundsInput(bounds),
        rotation: createShapeRotationInput(node.rotate),
        fill: isFilled ? solidShapeFill(colorValue) : noneShapeFill(),
        outline: outlineLine ? shapeOutline(outlineLine) : noShapeOutline(),
        effects: node.glow
          ? {
              glow: {
                radius: asEmu(Math.round(pxToEmu(node.glow.size ?? 8))),
                color: toColorInput(node.glow.color ?? "FFFFFF")!,
              },
            }
          : undefined,
      },
      bounds,
      {
        fillColor: isFilled ? colorValue : undefined,
        glow: node.glow,
        rectRadius: isCircle ? undefined : 0.1,
      },
    );
  }

  addGlimpsePicture(
    ctx,
    {
      x: node.iconX ?? node.x,
      y: node.iconY ?? node.y,
      w: node.iconW ?? node.w,
      h: node.iconH ?? node.h,
    },
    imageBytesFromSource("", node.iconImageData),
    { rotate: node.rotate },
  );
}
