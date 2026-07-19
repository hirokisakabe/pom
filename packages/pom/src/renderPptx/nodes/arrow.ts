import { asEmu } from "@pptx-glimpse/document";
import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToEmu } from "../units.ts";
import {
  arrowEndpoint,
  createShapeBoundsInput,
  solidShapeFill,
} from "../utils/glimpseShape.ts";
import { resolveArrowType } from "../utils/straightLine.ts";
import type { ConnectorSite } from "../utils/connectorSites.ts";

type ArrowPositionedNode = Extract<PositionedNode, { type: "arrow" }>;

function connectionSite(
  sites: readonly ConnectorSite[],
  other: { x: number; y: number; w: number; h: number },
): ConnectorSite {
  const otherCenterX = other.x + other.w / 2;
  const otherCenterY = other.y + other.h / 2;
  return sites.reduce((nearest, candidate) => {
    const nearestDistance = Math.hypot(
      nearest.x - otherCenterX,
      nearest.y - otherCenterY,
    );
    const candidateDistance = Math.hypot(
      candidate.x - otherCenterX,
      candidate.y - otherCenterY,
    );
    return candidateDistance < nearestDistance ? candidate : nearest;
  });
}

export function renderArrowNode(
  node: ArrowPositionedNode,
  ctx: RenderContext,
): void {
  const fromBounds = ctx.idPositionMap.get(node.from);
  const toBounds = ctx.idPositionMap.get(node.to);

  if (!fromBounds) {
    ctx.buildContext.diagnostics.add(
      "ARROW_REF_NOT_FOUND",
      `Arrow: "from" ID "${node.from}" not found`,
    );
    return;
  }
  if (!toBounds) {
    ctx.buildContext.diagnostics.add(
      "ARROW_REF_NOT_FOUND",
      `Arrow: "to" ID "${node.to}" not found`,
    );
    return;
  }

  const fromTarget = ctx.connectorTargetMap.get(node.from);
  const toTarget = ctx.connectorTargetMap.get(node.to);
  if (!fromTarget || !toTarget) {
    const id = !fromTarget ? node.from : node.to;
    ctx.buildContext.diagnostics.add(
      "ARROW_REF_NOT_CONNECTABLE",
      `Arrow: ID "${id}" does not reference a connector-compatible Shape geometry or Text node`,
    );
    return;
  }

  const startSite = connectionSite(fromTarget.sites, toTarget.bounds);
  const endSite = connectionSite(toTarget.sites, fromTarget.bounds);
  const minX = Math.min(startSite.x, endSite.x);
  const minY = Math.min(startSite.y, endSite.y);

  ctx.buildContext.pptxAuthoring.registerConnector({
    preset: "straightConnector1",
    ...createShapeBoundsInput({
      x: minX,
      y: minY,
      w: Math.abs(endSite.x - startSite.x),
      h: Math.abs(endSite.y - startSite.y),
    }),
    flipHorizontal: endSite.x < startSite.x,
    flipVertical: endSite.y < startSite.y,
    start: {
      shapeHandle: fromTarget.handle,
      connectionSiteIndex: startSite.index,
    },
    end: {
      shapeHandle: toTarget.handle,
      connectionSiteIndex: endSite.index,
    },
    outline: {
      fill: solidShapeFill(node.color ?? "000000"),
      width:
        node.lineWidth !== undefined
          ? asEmu(Math.round(pxToEmu(node.lineWidth)))
          : asEmu(12700),
      dash: node.dashType,
      headEnd: arrowEndpoint(resolveArrowType(node.beginArrow)),
      tailEnd: arrowEndpoint(resolveArrowType(node.endArrow)),
    },
  });
}
