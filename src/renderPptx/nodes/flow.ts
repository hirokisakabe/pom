import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

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

  const layouts = new Map<string, FlowNodeLayout>();
  const nodeCount = node.nodes.length;

  // ノードのレイアウトを計算
  if (direction === "horizontal") {
    calculateHorizontalLayout(
      node,
      layouts,
      nodeCount,
      nodeWidth,
      nodeHeight,
      nodeGap,
    );
  } else {
    calculateVerticalLayout(
      node,
      layouts,
      nodeCount,
      nodeWidth,
      nodeHeight,
      nodeGap,
    );
  }

  // 接続線を描画（ノードより先に描画して背面に配置）
  for (const conn of node.connections) {
    const fromLayout = layouts.get(conn.from);
    const toLayout = layouts.get(conn.to);

    if (!fromLayout || !toLayout) continue;

    const lineColor = conn.color ?? connectorStyle.color ?? "333333";
    const lineWidth = connectorStyle.width ?? 2;
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

      ctx.slide.addText(conn.label, {
        x: pxToIn(labelX - 30),
        y: pxToIn(labelY - 10),
        w: pxToIn(60),
        h: pxToIn(20),
        fontSize: pxToPt(10),
        fontFace: "Noto Sans JP",
        color: "64748B",
        align: "center",
        valign: "middle",
      });
    }
  }

  // ノードを描画
  for (const item of node.nodes) {
    const layout = layouts.get(item.id);
    if (!layout) continue;

    const fillColor = item.color ?? defaultColor;
    const textColor = item.textColor ?? "FFFFFF";

    // 図形を描画
    ctx.slide.addText(item.text, {
      x: pxToIn(layout.x),
      y: pxToIn(layout.y),
      w: pxToIn(layout.width),
      h: pxToIn(layout.height),
      shape: item.shape,
      fill: { color: fillColor },
      line: { color: "333333", width: pxToPt(1) },
      fontSize: pxToPt(14),
      fontFace: "Noto Sans JP",
      color: textColor,
      align: "center",
      valign: "middle",
    });
  }
}

function calculateHorizontalLayout(
  node: FlowPositionedNode,
  layouts: Map<string, FlowNodeLayout>,
  nodeCount: number,
  nodeWidth: number,
  nodeHeight: number,
  nodeGap: number,
): void {
  const totalWidth = nodeCount * nodeWidth + (nodeCount - 1) * nodeGap;
  const startX = node.x + (node.w - totalWidth) / 2;
  const centerY = node.y + node.h / 2;

  node.nodes.forEach((item, index) => {
    const w = item.width ?? nodeWidth;
    const h = item.height ?? nodeHeight;
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
): void {
  const totalHeight = nodeCount * nodeHeight + (nodeCount - 1) * nodeGap;
  const startY = node.y + (node.h - totalHeight) / 2;
  const centerX = node.x + node.w / 2;

  node.nodes.forEach((item, index) => {
    const w = item.width ?? nodeWidth;
    const h = item.height ?? nodeHeight;
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
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(Math.min(startX, endX)),
      y: pxToIn(Math.min(startY, endY)),
      w: pxToIn(Math.abs(endX - startX)),
      h: pxToIn(Math.abs(endY - startY)),
      line: {
        color: lineColor,
        width: pxToPt(lineWidth),
        endArrowType: arrowType,
      },
    });
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
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(startX),
      y: pxToIn(startY),
      w: pxToIn(midX - startX),
      h: 0,
      line: { color: lineColor, width: pxToPt(lineWidth) },
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(midX),
      y: pxToIn(Math.min(startY, endY)),
      w: 0,
      h: pxToIn(Math.abs(endY - startY)),
      line: { color: lineColor, width: pxToPt(lineWidth) },
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(midX),
      y: pxToIn(endY),
      w: pxToIn(endX - midX),
      h: 0,
      line: {
        color: lineColor,
        width: pxToPt(lineWidth),
        endArrowType: arrowType,
      },
    });
  } else {
    // 垂直→水平→垂直
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(startX),
      y: pxToIn(startY),
      w: 0,
      h: pxToIn(midY - startY),
      line: { color: lineColor, width: pxToPt(lineWidth) },
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(Math.min(startX, endX)),
      y: pxToIn(midY),
      w: pxToIn(Math.abs(endX - startX)),
      h: 0,
      line: { color: lineColor, width: pxToPt(lineWidth) },
    });
    ctx.slide.addShape(ctx.pptx.ShapeType.line, {
      x: pxToIn(endX),
      y: pxToIn(midY),
      w: 0,
      h: pxToIn(endY - midY),
      line: {
        color: lineColor,
        width: pxToPt(lineWidth),
        endArrowType: arrowType,
      },
    });
  }
}
