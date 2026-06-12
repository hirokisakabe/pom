import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { rectPxToIn } from "../units.ts";

type SvgPositionedNode = Extract<PositionedNode, { type: "svg" }>;

export function renderSvgNode(
  node: SvgPositionedNode,
  ctx: RenderContext,
): void {
  ctx.slide.addImage({
    data: node.iconImageData,
    ...rectPxToIn(node),
  });
}
