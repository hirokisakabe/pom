import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { stripHash } from "../utils/visualStyle.ts";
import { measureFlow } from "../../calcYogaLayout/measureCompositeNodes.ts";
import { resolveScaledContentArea } from "../utils/scaleToFit.ts";
import { withContentBounds } from "../utils/contentArea.ts";
import { addStraightLine } from "../utils/straightLine.ts";
import {
  addGlimpseShape,
  createShapeBoundsInput,
  shapeOutline,
  solidShapeFill,
} from "../utils/glimpseShape.ts";
import {
  createGlimpseParagraphs,
  addGlimpseTextBox,
} from "../utils/glimpseTextBox.ts";

type FlowPositionedNode = Extract<PositionedNode, { type: "flow" }>;

interface FlowNodeLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  item: FlowPositionedNode["nodes"][0];
}

export function renderFlowNode(
  node: FlowPositionedNode,
  ctx: RenderContext,
): void {
  const direction = node.direction ?? "horizontal";
  const nodeWidth = node.nodeWidth ?? 120;
  const nodeHeight = node.nodeHeight ?? 60;
  const nodeGap = node.nodeGap ?? 80;
  const connectorStyle = node.connectorStyle ?? {};
  const defaultColor = "1D4ED8";

  // スケール係数を計算（コンテンツ領域基準）
  const { content, scaleFactor } = resolveScaledContentArea(
    node,
    measureFlow(node),
    ctx,
  );

  const scaledNodeWidth = nodeWidth * scaleFactor;
  const scaledNodeHeight = nodeHeight * scaleFactor;
  const scaledNodeGap = nodeGap * scaleFactor;

  const layouts = new Map<string, FlowNodeLayout>();
  const nodeCount = node.nodes.length;

  // コンテンツ領域を使用するための仮想ノードを作成
  const contentNode = withContentBounds(node, content);

  // ノードのレイアウトを計算
  if (direction === "horizontal") {
    calculateHorizontalLayout(
      contentNode,
      layouts,
      nodeCount,
      scaledNodeWidth,
      scaledNodeHeight,
      scaledNodeGap,
      scaleFactor,
    );
  } else {
    calculateVerticalLayout(
      contentNode,
      layouts,
      nodeCount,
      scaledNodeWidth,
      scaledNodeHeight,
      scaledNodeGap,
      scaleFactor,
    );
  }

  // 接続線を描画（ノードより先に描画して背面に配置）
  for (const conn of node.connections) {
    const fromLayout = layouts.get(conn.from);
    const toLayout = layouts.get(conn.to);

    if (!fromLayout || !toLayout) continue;

    const lineColor = conn.color ?? connectorStyle.color ?? "333333";
    const lineWidth = (connectorStyle.width ?? 2) * scaleFactor;
    const arrowType = connectorStyle.arrowType ?? "triangle";

    drawConnection(
      ctx,
      direction,
      fromLayout,
      toLayout,
      lineColor,
      lineWidth,
      arrowType,
    );

    // ラベルを描画
    if (conn.label) {
      const labelX =
        (fromLayout.x +
          fromLayout.width / 2 +
          toLayout.x +
          toLayout.width / 2) /
        2;
      const labelY =
        (fromLayout.y +
          fromLayout.height / 2 +
          toLayout.y +
          toLayout.height / 2) /
        2;

      const labelW = 60 * scaleFactor;
      const labelH = 20 * scaleFactor;

      addGlimpseTextBox(
        ctx,
        {
          x: labelX - labelW / 2,
          y: labelY - labelH / 2,
          w: labelW,
          h: labelH,
        },
        {
          text: conn.label,
          fontSize: 10 * scaleFactor,
          fontFace: "Noto Sans JP",
          color:
            stripHash(conn.labelColor) ??
            stripHash(connectorStyle.labelColor) ??
            "64748B",
          align: "center",
          valign: "middle",
        },
      );
    }
  }

  // ノードを描画
  for (const item of node.nodes) {
    const layout = layouts.get(item.id);
    if (!layout) continue;

    const fillColor = item.color ?? defaultColor;
    const textColor = item.textColor ?? "FFFFFF";

    // 図形を描画
    addGlimpseShape(
      ctx,
      {
        geometry: { kind: "preset", preset: item.shape },
        ...createShapeBoundsInput({
          x: layout.x,
          y: layout.y,
          w: layout.width,
          h: layout.height,
        }),
        fill: solidShapeFill(fillColor),
        outline: shapeOutline({ color: "333333", width: 1 * scaleFactor }),
        body: { anchor: "middle" },
        paragraphs: createGlimpseParagraphs(
          item.text,
          {
            fontSize: 14 * scaleFactor,
            fontFace: "Noto Sans JP",
            color: textColor,
          },
          { align: "center" },
        ),
      },
      { x: layout.x, y: layout.y, w: layout.width, h: layout.height },
      { fillColor },
    );
  }
}

function calculateHorizontalLayout(
  node: FlowPositionedNode,
  layouts: Map<string, FlowNodeLayout>,
  nodeCount: number,
  nodeWidth: number,
  nodeHeight: number,
  nodeGap: number,
  scaleFactor: number,
): void {
  const totalWidth = nodeCount * nodeWidth + (nodeCount - 1) * nodeGap;
  const startX = node.x + (node.w - totalWidth) / 2;
  const centerY = node.y + node.h / 2;

  node.nodes.forEach((item, index) => {
    const w = (item.width ?? nodeWidth / scaleFactor) * scaleFactor;
    const h = (item.height ?? nodeHeight / scaleFactor) * scaleFactor;
    layouts.set(item.id, {
      id: item.id,
      x: startX + index * (nodeWidth + nodeGap) + (nodeWidth - w) / 2,
      y: centerY - h / 2,
      width: w,
      height: h,
      item,
    });
  });
}

function calculateVerticalLayout(
  node: FlowPositionedNode,
  layouts: Map<string, FlowNodeLayout>,
  nodeCount: number,
  nodeWidth: number,
  nodeHeight: number,
  nodeGap: number,
  scaleFactor: number,
): void {
  const totalHeight = nodeCount * nodeHeight + (nodeCount - 1) * nodeGap;
  const startY = node.y + (node.h - totalHeight) / 2;
  const centerX = node.x + node.w / 2;

  node.nodes.forEach((item, index) => {
    const w = (item.width ?? nodeWidth / scaleFactor) * scaleFactor;
    const h = (item.height ?? nodeHeight / scaleFactor) * scaleFactor;
    layouts.set(item.id, {
      id: item.id,
      x: centerX - w / 2,
      y: startY + index * (nodeHeight + nodeGap) + (nodeHeight - h) / 2,
      width: w,
      height: h,
      item,
    });
  });
}

function drawConnection(
  ctx: RenderContext,
  direction: "horizontal" | "vertical",
  fromLayout: FlowNodeLayout,
  toLayout: FlowNodeLayout,
  lineColor: string,
  lineWidth: number,
  arrowType: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle",
): void {
  let startX: number, startY: number, endX: number, endY: number;

  if (direction === "horizontal") {
    // 水平: 右端から左端へ
    startX = fromLayout.x + fromLayout.width;
    startY = fromLayout.y + fromLayout.height / 2;
    endX = toLayout.x;
    endY = toLayout.y + toLayout.height / 2;
  } else {
    // 垂直: 下端から上端へ
    startX = fromLayout.x + fromLayout.width / 2;
    startY = fromLayout.y + fromLayout.height;
    endX = toLayout.x + toLayout.width / 2;
    endY = toLayout.y;
  }

  // 直線接続（シンプルなケース）
  const isHorizontalLine = Math.abs(startY - endY) < 1;
  const isVerticalLine = Math.abs(startX - endX) < 1;

  if (isHorizontalLine || isVerticalLine) {
    // 直線で描画
    addStraightLine(
      ctx,
      { x1: startX, y1: startY, x2: endX, y2: endY },
      { color: lineColor, lineWidth, endArrow: { type: arrowType } },
    );
  } else {
    // L字型接続
    drawLShapedConnection(
      ctx,
      direction,
      startX,
      startY,
      endX,
      endY,
      lineColor,
      lineWidth,
      arrowType,
    );
  }
}

function drawLShapedConnection(
  ctx: RenderContext,
  direction: "horizontal" | "vertical",
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  lineColor: string,
  lineWidth: number,
  arrowType: "none" | "arrow" | "diamond" | "oval" | "stealth" | "triangle",
): void {
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  if (direction === "horizontal") {
    // 水平→垂直→水平
    addStraightLine(
      ctx,
      { x1: startX, y1: startY, x2: midX, y2: startY },
      { color: lineColor, lineWidth },
    );
    addStraightLine(
      ctx,
      { x1: midX, y1: startY, x2: midX, y2: endY },
      { color: lineColor, lineWidth },
    );
    addStraightLine(
      ctx,
      { x1: midX, y1: endY, x2: endX, y2: endY },
      { color: lineColor, lineWidth, endArrow: { type: arrowType } },
    );
  } else {
    // 垂直→水平→垂直
    addStraightLine(
      ctx,
      { x1: startX, y1: startY, x2: startX, y2: midY },
      { color: lineColor, lineWidth },
    );
    addStraightLine(
      ctx,
      { x1: startX, y1: midY, x2: endX, y2: midY },
      { color: lineColor, lineWidth },
    );
    addStraightLine(
      ctx,
      { x1: endX, y1: midY, x2: endX, y2: endY },
      { color: lineColor, lineWidth, endArrow: { type: arrowType } },
    );
  }
}
