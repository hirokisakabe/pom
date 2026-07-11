import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import {
  addGlimpsePicture,
  imageBytesFromSource,
} from "../utils/glimpsePicture.ts";

type SvgPositionedNode = Extract<PositionedNode, { type: "svg" }>;

export function renderSvgNode(
  node: SvgPositionedNode,
  ctx: RenderContext,
): void {
  addGlimpsePicture(ctx, node, imageBytesFromSource("", node.iconImageData));
}
