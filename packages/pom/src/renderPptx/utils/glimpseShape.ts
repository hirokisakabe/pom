import {
  asEmu,
  asOoxmlAngle,
  type AddShapeFillInput,
  type AddShapeInput,
  type AddShapeOutlineInput,
  type SourceArrowEndpoint,
  type SourceDashStyle,
} from "@pptx-glimpse/document";
import type { BorderStyle, ShadowStyle, TextGlow } from "../../types.ts";
import { parseGradient } from "../../shared/gradient.ts";
import {
  toColorInput,
  type CustomGeometryXmlInput,
} from "../glimpseTextBoxes.ts";
import { pxToEmu, rectPxToIn } from "../units.ts";
import type { RenderContext } from "../types.ts";

type ShapeBoundsPx = { x: number; y: number; w: number; h: number };

export type GlimpseShapeStyleOptions = {
  fillColor?: string;
  fillOpacity?: number;
  backgroundGradient?: string;
  outlineGradient?: string;
  glow?: TextGlow;
  shadow?: ShadowStyle;
  rectRadius?: number;
  dashType?: BorderStyle["dashType"];
  flipH?: boolean;
  flipV?: boolean;
  zeroWidth?: boolean;
  zeroHeight?: boolean;
  customGeometry?: CustomGeometryXmlInput;
};

const TRANSPARENT_MARKER_STYLE = {
  fill: { color: "FFFFFF", transparency: 100 },
  line: { color: "FFFFFF", transparency: 100 },
} as const;

function positiveEmu(valuePx: number) {
  return asEmu(Math.max(1, Math.round(pxToEmu(valuePx))));
}

export function createShapeBoundsInput(bounds: ShapeBoundsPx) {
  return {
    offsetX: asEmu(Math.round(pxToEmu(bounds.x))),
    offsetY: asEmu(Math.round(pxToEmu(bounds.y))),
    width: positiveEmu(bounds.w),
    height: positiveEmu(bounds.h),
  };
}

export function createShapeRotationInput(rotate: number | undefined) {
  return rotate !== undefined
    ? asOoxmlAngle(Math.round(rotate * 60000))
    : undefined;
}

export function solidShapeFill(
  color: string | undefined,
): AddShapeFillInput | undefined {
  const clean = toColorInput(color);
  return clean ? { kind: "solid", color: clean } : undefined;
}

export function noneShapeFill(): AddShapeFillInput {
  return { kind: "none" };
}

function gradientFallbackColor(value: string): string | undefined {
  const gradient = parseGradient(value);
  return gradient?.value.stops[0]?.color;
}

export function backgroundShapeFill(
  backgroundColor: string | undefined,
  backgroundGradient: string | undefined,
): AddShapeFillInput | undefined {
  if (backgroundGradient) {
    const color = gradientFallbackColor(backgroundGradient);
    return solidShapeFill(color);
  }
  return solidShapeFill(backgroundColor);
}

function dashStyle(
  dashType: BorderStyle["dashType"],
): SourceDashStyle | undefined {
  return dashType as SourceDashStyle | undefined;
}

export function shapeOutline(
  border: BorderStyle | undefined,
  fallbackColor?: string,
): AddShapeOutlineInput | undefined {
  if (!border) return undefined;
  const fill = solidShapeFill(border.color ?? fallbackColor);
  if (
    border.width === undefined &&
    fill === undefined &&
    border.dashType === undefined
  ) {
    return undefined;
  }
  return {
    width:
      border.width !== undefined
        ? asEmu(Math.round(pxToEmu(border.width)))
        : undefined,
    fill,
    dash: dashStyle(border.dashType),
  };
}

export function noShapeOutline(): AddShapeOutlineInput {
  return { fill: noneShapeFill() };
}

export function arrowEndpoint(
  type:
    "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle" | undefined,
): SourceArrowEndpoint | undefined {
  if (type === undefined || type === "none") return undefined;
  return { type, width: "med", length: "med" };
}

export function addGlimpseShape(
  ctx: RenderContext,
  input: AddShapeInput,
  markerBounds: ShapeBoundsPx,
  options?: GlimpseShapeStyleOptions & { name?: string },
): void {
  const marker = ctx.buildContext.glimpseTextBoxes.registerShape(input, {
    ...options,
    zeroWidth: markerBounds.w === 0,
    zeroHeight: markerBounds.h === 0,
  });
  ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
    ...rectPxToIn({
      ...markerBounds,
      w: Math.max(markerBounds.w, 1),
      h: Math.max(markerBounds.h, 1),
    }),
    ...TRANSPARENT_MARKER_STYLE,
    objectName: marker,
  });
}
