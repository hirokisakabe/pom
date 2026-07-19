import type { PositionedNode } from "../../types.ts";
import type { NodeBounds } from "../types.ts";

export type ConnectorSite = {
  index: 0 | 1 | 2 | 3;
  x: number;
  y: number;
};

type ShapeType = Extract<PositionedNode, { type: "shape" }>["shapeType"];

const cardinalConnectorShapeTypes: ReadonlySet<ShapeType> = new Set([
  "rect",
  "roundRect",
  "ellipse",
]);

export function supportsCardinalConnectorSites(shapeType: ShapeType): boolean {
  return cardinalConnectorShapeTypes.has(shapeType);
}

/**
 * DrawingML の rect / roundRect / ellipse / text box に共通する4接続点。
 * index は geometry 固有のローカル座標系に属するため、画面上の座標だけを
 * shape の中心まわりに回転し、index 自体は維持する。
 */
export function cardinalConnectorSites(
  bounds: NodeBounds,
  rotate = 0,
): readonly ConnectorSite[] {
  const centerX = bounds.x + bounds.w / 2;
  const centerY = bounds.y + bounds.h / 2;
  const sites: readonly ConnectorSite[] = [
    { index: 0, x: centerX, y: bounds.y },
    { index: 1, x: bounds.x, y: centerY },
    { index: 2, x: centerX, y: bounds.y + bounds.h },
    { index: 3, x: bounds.x + bounds.w, y: centerY },
  ];
  const normalized = ((rotate % 360) + 360) % 360;
  if (normalized === 0) return sites;

  const radians = (normalized * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return sites.map((site) => {
    const dx = site.x - centerX;
    const dy = site.y - centerY;
    return {
      index: site.index,
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  });
}
