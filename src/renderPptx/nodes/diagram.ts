import type {
  PositionedNode,
  DiagramElement,
  DiagramArea,
  DiagramConnection,
  DiagramSplitConnection,
  ConnectionAnchor,
  DiagramDefaultElementStyle,
  DiagramDefaultConnectionStyle,
  BorderDash,
} from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";
import type PptxGenJSType from "pptxgenjs";

type DiagramPositionedNode = Extract<PositionedNode, { type: "diagram" }>;

interface ElementLayout {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  element: DiagramElement;
}

interface Point {
  x: number;
  y: number;
}

export function renderDiagramNode(
  node: DiagramPositionedNode,
  ctx: RenderContext,
): void {
  const elementDefaults = node.defaultElementStyle ?? {};
  const connectionDefaults = node.defaultConnectionStyle ?? {};

  // 要素のレイアウト情報をマップに保存
  const layouts = buildElementLayoutMap(node, elementDefaults);

  // 1. 背景エリアを描画（最背面）
  if (node.areas) {
    renderAreas(node.areas, node, ctx);
  }

  // 2. 接続線を描画（要素の背面）
  if (node.connections) {
    renderConnections(node.connections, ctx, layouts, connectionDefaults);
  }

  // 3. 分岐接続を描画
  if (node.splitConnections) {
    renderSplitConnections(
      node.splitConnections,
      node,
      ctx,
      layouts,
      connectionDefaults,
    );
  }

  // 4. 要素を描画（最前面）
  renderElements(node.elements, ctx, layouts, elementDefaults);
}

function buildElementLayoutMap(
  node: DiagramPositionedNode,
  defaults: DiagramDefaultElementStyle,
): Map<string, ElementLayout> {
  const layouts = new Map<string, ElementLayout>();

  for (const element of node.elements) {
    const w = element.w ?? defaults.w ?? 100;
    const h = element.h ?? defaults.h ?? 60;

    layouts.set(element.id, {
      id: element.id,
      x: node.x + element.x,
      y: node.y + element.y,
      w,
      h,
      element,
    });
  }

  return layouts;
}

function renderAreas(
  areas: DiagramArea[],
  node: DiagramPositionedNode,
  ctx: RenderContext,
): void {
  for (const area of areas) {
    const x = node.x + area.x;
    const y = node.y + area.y;

    // 背景矩形を描画
    const shapeOptions: Parameters<typeof ctx.slide.addShape>[1] = {
      x: pxToIn(x),
      y: pxToIn(y),
      w: pxToIn(area.w),
      h: pxToIn(area.h),
      fill: area.fill
        ? { color: area.fill.color, transparency: area.fill.transparency }
        : undefined,
      line: area.border
        ? {
            color: area.border.color,
            width:
              area.border.width !== undefined
                ? pxToPt(area.border.width)
                : undefined,
            dashType: area.border.dashType,
          }
        : undefined,
    };

    // borderRadius がある場合は roundRect、そうでなければ rect
    if (area.borderRadius && area.borderRadius > 0) {
      ctx.slide.addShape(ctx.pptx.ShapeType.roundRect, {
        ...shapeOptions,
        rectRadius: area.borderRadius / Math.min(area.w, area.h),
      });
    } else {
      ctx.slide.addShape(ctx.pptx.ShapeType.rect, shapeOptions);
    }

    // ラベルを描画
    if (area.label) {
      const labelPos = getLabelPosition(area, x, y);
      ctx.slide.addText(area.label, {
        x: pxToIn(labelPos.x),
        y: pxToIn(labelPos.y),
        w: pxToIn(labelPos.w),
        h: pxToIn(labelPos.h),
        fontSize: pxToPt(12),
        fontFace: "Noto Sans JP",
        color: "333333",
        align: labelPos.align,
        valign: "middle",
      });
    }
  }
}

function getLabelPosition(
  area: DiagramArea,
  x: number,
  y: number,
): {
  x: number;
  y: number;
  w: number;
  h: number;
  align: "left" | "center" | "right";
} {
  const padding = 8;
  const labelHeight = 24;
  const position = area.labelPosition ?? "topLeft";

  switch (position) {
    case "topLeft":
      return {
        x: x + padding,
        y: y + padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "left",
      };
    case "topCenter":
      return {
        x: x + padding,
        y: y + padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "center",
      };
    case "topRight":
      return {
        x: x + padding,
        y: y + padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "right",
      };
    case "bottomLeft":
      return {
        x: x + padding,
        y: y + area.h - labelHeight - padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "left",
      };
    case "bottomCenter":
      return {
        x: x + padding,
        y: y + area.h - labelHeight - padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "center",
      };
    case "bottomRight":
      return {
        x: x + padding,
        y: y + area.h - labelHeight - padding,
        w: area.w - padding * 2,
        h: labelHeight,
        align: "right",
      };
  }
}

function renderConnections(
  connections: DiagramConnection[],
  ctx: RenderContext,
  layouts: Map<string, ElementLayout>,
  defaults: DiagramDefaultConnectionStyle,
): void {
  for (const conn of connections) {
    const fromLayout = layouts.get(conn.from);
    const toLayout = layouts.get(conn.to);

    if (!fromLayout || !toLayout) continue;

    const startPoint = getAnchorPoint(fromLayout, conn.fromAnchor ?? "right");
    const endPoint = getAnchorPoint(toLayout, conn.toAnchor ?? "left");

    const lineColor = conn.color ?? defaults.color ?? "333333";
    const lineWidth = conn.width ?? defaults.width ?? 2;
    const lineType = conn.lineType ?? defaults.lineType ?? "straight";
    const arrowType = conn.arrowType ?? defaults.arrowType ?? "end";
    const dashType = conn.dashType;

    if (lineType === "elbow") {
      drawElbowConnection(
        ctx,
        startPoint,
        endPoint,
        lineColor,
        lineWidth,
        arrowType,
        dashType,
      );
    } else {
      drawStraightConnection(
        ctx,
        startPoint,
        endPoint,
        lineColor,
        lineWidth,
        arrowType,
        dashType,
      );
    }

    // ラベルを描画
    if (conn.label) {
      const labelX = (startPoint.x + endPoint.x) / 2;
      const labelY = (startPoint.y + endPoint.y) / 2;

      ctx.slide.addText(conn.label, {
        x: pxToIn(labelX - 40),
        y: pxToIn(labelY - 12),
        w: pxToIn(80),
        h: pxToIn(24),
        fontSize: pxToPt(10),
        fontFace: "Noto Sans JP",
        color: "64748B",
        align: "center",
        valign: "middle",
        fill: { color: "FFFFFF", transparency: 20 },
      });
    }
  }
}

function renderSplitConnections(
  splitConnections: DiagramSplitConnection[],
  node: DiagramPositionedNode,
  ctx: RenderContext,
  layouts: Map<string, ElementLayout>,
  defaults: DiagramDefaultConnectionStyle,
): void {
  for (const conn of splitConnections) {
    const fromLayout = layouts.get(conn.from);
    if (!fromLayout) continue;

    const startPoint = getAnchorPoint(fromLayout, conn.fromAnchor ?? "bottom");

    const lineColor = conn.color ?? defaults.color ?? "333333";
    const lineWidth = conn.width ?? defaults.width ?? 2;
    const arrowType = conn.arrowType ?? "end";

    // 分岐点を計算
    const toLayouts: {
      layout: ElementLayout;
      anchor: ConnectionAnchor;
      label?: string;
    }[] = [];
    for (const target of conn.to) {
      const layout = layouts.get(target.id);
      if (layout) {
        toLayouts.push({
          layout,
          anchor: target.anchor ?? "top",
          label: target.label,
        });
      }
    }

    if (toLayouts.length === 0) continue;

    // 分岐点のデフォルト位置を計算
    let splitPoint: Point;
    if (conn.splitPoint?.x !== undefined && conn.splitPoint?.y !== undefined) {
      splitPoint = {
        x: node.x + conn.splitPoint.x,
        y: node.y + conn.splitPoint.y,
      };
    } else {
      // 自動計算: fromとtoの中間点
      const toEndPoints = toLayouts.map((t) =>
        getAnchorPoint(t.layout, t.anchor),
      );
      const avgY =
        toEndPoints.reduce((sum, p) => sum + p.y, 0) / toEndPoints.length;
      splitPoint = {
        x: startPoint.x,
        y: (startPoint.y + avgY) / 2,
      };
    }

    // 開始点から分岐点への線
    drawStraightConnection(
      ctx,
      startPoint,
      splitPoint,
      lineColor,
      lineWidth,
      "none",
      undefined,
    );

    // 分岐点から各終点への線
    for (const target of toLayouts) {
      const endPoint = getAnchorPoint(target.layout, target.anchor);

      // 分岐点から水平に移動し、その後垂直に終点へ
      const midPoint: Point = { x: endPoint.x, y: splitPoint.y };

      // 水平線
      drawStraightConnection(
        ctx,
        splitPoint,
        midPoint,
        lineColor,
        lineWidth,
        "none",
        undefined,
      );

      // 垂直線（矢印付き）
      drawStraightConnection(
        ctx,
        midPoint,
        endPoint,
        lineColor,
        lineWidth,
        arrowType,
        undefined,
      );

      // ラベルを描画
      if (target.label) {
        ctx.slide.addText(target.label, {
          x: pxToIn(midPoint.x - 30),
          y: pxToIn(midPoint.y - 12),
          w: pxToIn(60),
          h: pxToIn(24),
          fontSize: pxToPt(10),
          fontFace: "Noto Sans JP",
          color: "64748B",
          align: "center",
          valign: "middle",
        });
      }
    }
  }
}

function renderElements(
  elements: DiagramElement[],
  ctx: RenderContext,
  layouts: Map<string, ElementLayout>,
  defaults: DiagramDefaultElementStyle,
): void {
  for (const element of elements) {
    const layout = layouts.get(element.id);
    if (!layout) continue;

    const shape = element.shape ?? defaults.shape ?? "roundRect";
    const fillColor = element.fill?.color ?? defaults.fill?.color ?? "2196F3";
    const fillTransparency =
      element.fill?.transparency ?? defaults.fill?.transparency;
    const lineColor = element.line?.color ?? defaults.line?.color ?? "1565C0";
    const lineWidth = element.line?.width ?? defaults.line?.width ?? 1;
    const fontPx = element.fontPx ?? defaults.fontPx ?? 14;
    const textColor = element.color ?? defaults.color ?? "FFFFFF";
    const bold = element.bold ?? false;

    // pptxgenjs のシェイプ名にマッピング
    const shapeType = mapShapeType(shape, ctx);

    // テキストがある場合は addText で図形とテキストを一緒に描画
    if (element.text) {
      ctx.slide.addText(element.text, {
        x: pxToIn(layout.x),
        y: pxToIn(layout.y),
        w: pxToIn(layout.w),
        h: pxToIn(layout.h),
        shape: shapeType,
        fill: { color: fillColor, transparency: fillTransparency },
        line: { color: lineColor, width: pxToPt(lineWidth) },
        fontSize: pxToPt(fontPx),
        fontFace: "Noto Sans JP",
        color: textColor,
        bold,
        align: "center",
        valign: "middle",
        lineSpacingMultiple: 1.3,
      });

      // subText がある場合は下に追加
      if (element.subText) {
        ctx.slide.addText(element.subText, {
          x: pxToIn(layout.x),
          y: pxToIn(layout.y + layout.h + 4),
          w: pxToIn(layout.w),
          h: pxToIn(16),
          fontSize: pxToPt(10),
          fontFace: "Noto Sans JP",
          color: "64748B",
          align: "center",
          valign: "top",
        });
      }
    } else {
      // テキストがない場合は図形のみ
      ctx.slide.addShape(shapeType, {
        x: pxToIn(layout.x),
        y: pxToIn(layout.y),
        w: pxToIn(layout.w),
        h: pxToIn(layout.h),
        fill: { color: fillColor, transparency: fillTransparency },
        line: { color: lineColor, width: pxToPt(lineWidth) },
      });
    }
  }
}

function mapShapeType(
  shape: string,
  ctx: RenderContext,
): PptxGenJSType.ShapeType {
  switch (shape) {
    case "rect":
      return ctx.pptx.ShapeType.rect;
    case "roundRect":
      return ctx.pptx.ShapeType.roundRect;
    case "ellipse":
      return ctx.pptx.ShapeType.ellipse;
    case "cloud":
      return ctx.pptx.ShapeType.cloud;
    case "can":
      return ctx.pptx.ShapeType.can;
    case "cube":
      return ctx.pptx.ShapeType.cube;
    case "hexagon":
      return ctx.pptx.ShapeType.hexagon;
    case "diamond":
      return ctx.pptx.ShapeType.diamond;
    case "parallelogram":
      return ctx.pptx.ShapeType.parallelogram;
    case "triangle":
      return ctx.pptx.ShapeType.triangle;
    default:
      return ctx.pptx.ShapeType.roundRect;
  }
}

function getAnchorPoint(
  layout: ElementLayout,
  anchor: ConnectionAnchor,
): Point {
  const { x, y, w, h } = layout;

  switch (anchor) {
    case "top":
      return { x: x + w / 2, y: y };
    case "bottom":
      return { x: x + w / 2, y: y + h };
    case "left":
      return { x: x, y: y + h / 2 };
    case "right":
      return { x: x + w, y: y + h / 2 };
    case "center":
      return { x: x + w / 2, y: y + h / 2 };
  }
}

function drawStraightConnection(
  ctx: RenderContext,
  start: Point,
  end: Point,
  color: string,
  width: number,
  arrowType: "none" | "end" | "start" | "both",
  dashType?: BorderDash,
): void {
  const minX = Math.min(start.x, end.x);
  const minY = Math.min(start.y, end.y);
  const w = Math.abs(end.x - start.x);
  const h = Math.abs(end.y - start.y);

  // 線の方向を判定してflipH/flipVを設定
  const flipH = start.x > end.x;
  const flipV = start.y > end.y;

  type ArrowShapeType =
    | "diamond"
    | "triangle"
    | "none"
    | "arrow"
    | "oval"
    | "stealth";
  const lineOptions: {
    color: string;
    width: number;
    dashType?: BorderDash;
    beginArrowType?: ArrowShapeType;
    endArrowType?: ArrowShapeType;
  } = {
    color,
    width: pxToPt(width),
  };

  if (dashType) {
    lineOptions.dashType = dashType;
  }

  if (arrowType === "end" || arrowType === "both") {
    lineOptions.endArrowType = "triangle";
  }
  if (arrowType === "start" || arrowType === "both") {
    lineOptions.beginArrowType = "triangle";
  }

  ctx.slide.addShape(ctx.pptx.ShapeType.line, {
    x: pxToIn(minX),
    y: pxToIn(minY),
    w: pxToIn(w),
    h: pxToIn(h),
    flipH,
    flipV,
    line: lineOptions,
  });
}

function drawElbowConnection(
  ctx: RenderContext,
  start: Point,
  end: Point,
  color: string,
  width: number,
  arrowType: "none" | "end" | "start" | "both",
  dashType?: BorderDash,
): void {
  // L字型接続: 中点で折れ曲がる
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // 水平/垂直の判定
  const isMainlyHorizontal =
    Math.abs(end.x - start.x) > Math.abs(end.y - start.y);

  if (isMainlyHorizontal) {
    // 水平→垂直→水平
    // 1. 開始点から中点X座標まで水平線
    drawStraightConnection(
      ctx,
      start,
      { x: midX, y: start.y },
      color,
      width,
      "none",
      dashType,
    );
    // 2. 垂直線
    drawStraightConnection(
      ctx,
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      color,
      width,
      "none",
      dashType,
    );
    // 3. 終点まで水平線（矢印付き）
    drawStraightConnection(
      ctx,
      { x: midX, y: end.y },
      end,
      color,
      width,
      arrowType,
      dashType,
    );
  } else {
    // 垂直→水平→垂直
    // 1. 開始点から中点Y座標まで垂直線
    drawStraightConnection(
      ctx,
      start,
      { x: start.x, y: midY },
      color,
      width,
      "none",
      dashType,
    );
    // 2. 水平線
    drawStraightConnection(
      ctx,
      { x: start.x, y: midY },
      { x: end.x, y: midY },
      color,
      width,
      "none",
      dashType,
    );
    // 3. 終点まで垂直線（矢印付き）
    drawStraightConnection(
      ctx,
      { x: end.x, y: midY },
      end,
      color,
      width,
      arrowType,
      dashType,
    );
  }
}
