import type { RenderContext } from "../types.ts";
import { rectPxToIn } from "../units.ts";

type GraphicFrameBounds = { x: number; y: number; w: number; h: number };

const TRANSPARENT_MARKER_STYLE = {
  fill: { color: "FFFFFF", transparency: 100 },
  line: { color: "FFFFFF", transparency: 100 },
} as const;

export function addGlimpseGraphicFrameMarker(
  ctx: RenderContext,
  marker: string,
  bounds: GraphicFrameBounds,
): void {
  ctx.slide.addShape(ctx.pptx.ShapeType.rect, {
    ...rectPxToIn({
      ...bounds,
      w: Math.max(bounds.w, 1),
      h: Math.max(bounds.h, 1),
    }),
    ...TRANSPARENT_MARKER_STYLE,
    objectName: marker,
  });
}
