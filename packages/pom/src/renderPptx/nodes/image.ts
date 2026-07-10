import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { getContentArea } from "../utils/contentArea.ts";
import {
  addGlimpsePicture,
  imageBytesFromSource,
} from "../utils/glimpsePicture.ts";

type ImagePositionedNode = Extract<PositionedNode, { type: "image" }>;

export function renderImageNode(
  node: ImagePositionedNode,
  ctx: RenderContext,
): void {
  const content = getContentArea(node);
  addGlimpsePicture(
    ctx,
    content,
    imageBytesFromSource(node.src, node.imageData),
    {
      rotate: node.rotate,
      sizing: node.sizing,
      shadow: node.shadow,
    },
  );
}
