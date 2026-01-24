import type { POMNode, PositionedNode } from "../types";
import { getImageData } from "../calcYogaLayout/measureImage";

/**
 * POMNode ツリーを絶対座標付きの PositionedNode ツリーに変換する
 * @param pom 入力 POMNode
 * @param parentX 親ノードの絶対X座標
 * @param parentY 親ノードの絶対Y座標
 * @returns PositionedNode ツリー
 */
export function toPositioned(
  pom: POMNode,
  parentX = 0,
  parentY = 0,
): PositionedNode {
  if (!pom.yogaNode) {
    throw new Error("yogaNode not set on POMNode");
  }

  const layout = pom.yogaNode.getComputedLayout();
  const absoluteX = parentX + layout.left;
  const absoluteY = parentY + layout.top;

  switch (pom.type) {
    case "text": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "image": {
      const imageData = getImageData(pom.src);
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        imageData,
      };
    }
    case "table": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "shape": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "chart": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "timeline": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "matrix": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "tree": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "flow": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "processArrow": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
      };
    }
    case "box": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        children: toPositioned(pom.children, absoluteX, absoluteY),
      };
    }
    case "vstack": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        children: pom.children.map((child) =>
          toPositioned(child, absoluteX, absoluteY),
        ),
      };
    }
    case "hstack": {
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        children: pom.children.map((child) =>
          toPositioned(child, absoluteX, absoluteY),
        ),
      };
    }
    case "line": {
      // line ノードは絶対座標（x1, y1, x2, y2）を持つため、
      // yogaNode の座標ではなく自身の座標からバウンディングボックスを計算
      return {
        ...pom,
        x: Math.min(pom.x1, pom.x2),
        y: Math.min(pom.y1, pom.y2),
        w: Math.abs(pom.x2 - pom.x1),
        h: Math.abs(pom.y2 - pom.y1),
      };
    }
  }
}
