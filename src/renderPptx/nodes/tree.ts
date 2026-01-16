import type {
  PositionedNode,
  TreeDataItem,
  TreeNodeShape,
  TreeConnectorStyle,
} from "../../types";
import type { RenderContext } from "../types";
import { pxToIn, pxToPt } from "../units";

type TreePositionedNode = Extract<PositionedNode, { type: "tree" }>;

interface LayoutNode {
  item: TreeDataItem;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutNode[];
}

export function renderTreeNode(
  node: TreePositionedNode,
  ctx: RenderContext,
): void {
  const layout = node.layout ?? "vertical";
  const nodeShape = node.nodeShape ?? "rect";
  const nodeWidth = node.nodeWidth ?? 120;
  const nodeHeight = node.nodeHeight ?? 40;
  const levelGap = node.levelGap ?? 60;
  const siblingGap = node.siblingGap ?? 20;
  const connectorStyle = node.connectorStyle ?? {};
  const defaultColor = "1D4ED8";

  // サブツリーの幅/高さを計算
  function calculateSubtreeSize(item: TreeDataItem): {
    width: number;
    height: number;
  } {
    if (!item.children || item.children.length === 0) {
      return { width: nodeWidth, height: nodeHeight };
    }

    const childSizes = item.children.map(calculateSubtreeSize);

    if (layout === "vertical") {
      const childrenWidth =
        childSizes.reduce((sum, s) => sum + s.width, 0) +
        siblingGap * (childSizes.length - 1);
      const childrenHeight = Math.max(...childSizes.map((s) => s.height));
      return {
        width: Math.max(nodeWidth, childrenWidth),
        height: nodeHeight + levelGap + childrenHeight,
      };
    } else {
      const childrenHeight =
        childSizes.reduce((sum, s) => sum + s.height, 0) +
        siblingGap * (childSizes.length - 1);
      const childrenWidth = Math.max(...childSizes.map((s) => s.width));
      return {
        width: nodeWidth + levelGap + childrenWidth,
        height: Math.max(nodeHeight, childrenHeight),
      };
    }
  }

  // ツリーレイアウトを計算
  function calculateTreeLayout(
    item: TreeDataItem,
    x: number,
    y: number,
  ): LayoutNode {
    const subtreeSize = calculateSubtreeSize(item);
    const layoutNode: LayoutNode = {
      item,
      x: 0,
      y: 0,
      width: nodeWidth,
      height: nodeHeight,
      children: [],
    };

    if (layout === "vertical") {
      // ノードを中央上部に配置
      layoutNode.x = x + subtreeSize.width / 2 - nodeWidth / 2;
      layoutNode.y = y;

      // 子ノードを配置
      if (item.children && item.children.length > 0) {
        const childSizes = item.children.map(calculateSubtreeSize);
        const totalChildWidth =
          childSizes.reduce((sum, s) => sum + s.width, 0) +
          siblingGap * (childSizes.length - 1);
        let childX = x + subtreeSize.width / 2 - totalChildWidth / 2;
        const childY = y + nodeHeight + levelGap;

        for (let i = 0; i < item.children.length; i++) {
          const child = item.children[i];
          const childLayout = calculateTreeLayout(child, childX, childY);
          layoutNode.children.push(childLayout);
          childX += childSizes[i].width + siblingGap;
        }
      }
    } else {
      // horizontal: ノードを左中央に配置
      layoutNode.x = x;
      layoutNode.y = y + subtreeSize.height / 2 - nodeHeight / 2;

      // 子ノードを配置
      if (item.children && item.children.length > 0) {
        const childSizes = item.children.map(calculateSubtreeSize);
        const totalChildHeight =
          childSizes.reduce((sum, s) => sum + s.height, 0) +
          siblingGap * (childSizes.length - 1);
        const childX = x + nodeWidth + levelGap;
        let childY = y + subtreeSize.height / 2 - totalChildHeight / 2;

        for (let i = 0; i < item.children.length; i++) {
          const child = item.children[i];
          const childLayout = calculateTreeLayout(child, childX, childY);
          layoutNode.children.push(childLayout);
          childY += childSizes[i].height + siblingGap;
        }
      }
    }

    return layoutNode;
  }

  // 接続線を描画
  function drawConnector(
    parent: LayoutNode,
    child: LayoutNode,
    style: TreeConnectorStyle,
  ) {
    const lineColor = style.color ?? "333333";
    const lineWidth = style.width ?? 2;

    if (layout === "vertical") {
      // 親の下端中央から子の上端中央へ
      const parentCenterX = parent.x + parent.width / 2;
      const parentBottomY = parent.y + parent.height;
      const childCenterX = child.x + child.width / 2;
      const childTopY = child.y;
      const midY = (parentBottomY + childTopY) / 2;

      // 垂直線（親から中間点まで）
      ctx.slide.addShape(ctx.pptx.ShapeType.line, {
        x: pxToIn(parentCenterX),
        y: pxToIn(parentBottomY),
        w: 0,
        h: pxToIn(midY - parentBottomY),
        line: { color: lineColor, width: pxToPt(lineWidth) },
      });

      // 水平線（中間点で）
      const minX = Math.min(parentCenterX, childCenterX);
      const maxX = Math.max(parentCenterX, childCenterX);
      if (maxX > minX) {
        ctx.slide.addShape(ctx.pptx.ShapeType.line, {
          x: pxToIn(minX),
          y: pxToIn(midY),
          w: pxToIn(maxX - minX),
          h: 0,
          line: { color: lineColor, width: pxToPt(lineWidth) },
        });
      }

      // 垂直線（中間点から子まで）
      ctx.slide.addShape(ctx.pptx.ShapeType.line, {
        x: pxToIn(childCenterX),
        y: pxToIn(midY),
        w: 0,
        h: pxToIn(childTopY - midY),
        line: { color: lineColor, width: pxToPt(lineWidth) },
      });
    } else {
      // 親の右端中央から子の左端中央へ
      const parentRightX = parent.x + parent.width;
      const parentCenterY = parent.y + parent.height / 2;
      const childLeftX = child.x;
      const childCenterY = child.y + child.height / 2;
      const midX = (parentRightX + childLeftX) / 2;

      // 水平線（親から中間点まで）
      ctx.slide.addShape(ctx.pptx.ShapeType.line, {
        x: pxToIn(parentRightX),
        y: pxToIn(parentCenterY),
        w: pxToIn(midX - parentRightX),
        h: 0,
        line: { color: lineColor, width: pxToPt(lineWidth) },
      });

      // 垂直線（中間点で）
      const minY = Math.min(parentCenterY, childCenterY);
      const maxY = Math.max(parentCenterY, childCenterY);
      if (maxY > minY) {
        ctx.slide.addShape(ctx.pptx.ShapeType.line, {
          x: pxToIn(midX),
          y: pxToIn(minY),
          w: 0,
          h: pxToIn(maxY - minY),
          line: { color: lineColor, width: pxToPt(lineWidth) },
        });
      }

      // 水平線（中間点から子まで）
      ctx.slide.addShape(ctx.pptx.ShapeType.line, {
        x: pxToIn(midX),
        y: pxToIn(childCenterY),
        w: pxToIn(childLeftX - midX),
        h: 0,
        line: { color: lineColor, width: pxToPt(lineWidth) },
      });
    }
  }

  // ノードを描画
  function drawTreeNode(
    layoutNode: LayoutNode,
    shape: TreeNodeShape,
    defaultNodeColor: string,
  ) {
    const color = layoutNode.item.color ?? defaultNodeColor;
    const shapeType = (() => {
      switch (shape) {
        case "rect":
          return ctx.pptx.ShapeType.rect;
        case "roundRect":
          return ctx.pptx.ShapeType.roundRect;
        case "ellipse":
          return ctx.pptx.ShapeType.ellipse;
      }
    })();

    // ノードの背景
    ctx.slide.addShape(shapeType, {
      x: pxToIn(layoutNode.x),
      y: pxToIn(layoutNode.y),
      w: pxToIn(layoutNode.width),
      h: pxToIn(layoutNode.height),
      fill: { color },
      line: { color: "333333", width: pxToPt(1) },
    });

    // ノードのラベル
    ctx.slide.addText(layoutNode.item.label, {
      x: pxToIn(layoutNode.x),
      y: pxToIn(layoutNode.y),
      w: pxToIn(layoutNode.width),
      h: pxToIn(layoutNode.height),
      fontSize: pxToPt(12),
      fontFace: "Noto Sans JP",
      color: "FFFFFF",
      align: "center",
      valign: "middle",
    });
  }

  // すべての接続線を再帰的に描画
  function drawAllConnectors(layoutNode: LayoutNode) {
    for (const child of layoutNode.children) {
      drawConnector(layoutNode, child, connectorStyle);
      drawAllConnectors(child);
    }
  }

  // すべてのノードを再帰的に描画
  function drawAllNodes(layoutNode: LayoutNode) {
    drawTreeNode(layoutNode, nodeShape, defaultColor);
    for (const child of layoutNode.children) {
      drawAllNodes(child);
    }
  }

  // ツリーのサイズを計算
  const treeSize = calculateSubtreeSize(node.data);

  // 描画領域内の中央に配置
  const offsetX = node.x + (node.w - treeSize.width) / 2;
  const offsetY = node.y + (node.h - treeSize.height) / 2;

  // レイアウト計算
  const rootLayout = calculateTreeLayout(node.data, offsetX, offsetY);

  // 描画（接続線を先に、ノードを後に描画）
  drawAllConnectors(rootLayout);
  drawAllNodes(rootLayout);
}
