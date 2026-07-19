import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { createTextNodeInput } from "../glimpseAdapter.ts";
import { cardinalConnectorSites } from "../utils/connectorSites.ts";

type TextPositionedNode = Extract<PositionedNode, { type: "text" }>;

export function renderTextNode(
  node: TextPositionedNode,
  ctx: RenderContext,
): void {
  const handle = ctx.authoring.addTextBox(
    createTextNodeInput(node, ctx.authoring.useLayoutTextMargins),
  );
  if (node.id && ctx.idNodeMap.get(node.id) === node) {
    const bounds = { x: node.x, y: node.y, w: node.w, h: node.h };
    ctx.connectorTargetMap.set(node.id, {
      handle,
      bounds,
      sites: cardinalConnectorSites(bounds, node.rotate),
    });
  }
}
