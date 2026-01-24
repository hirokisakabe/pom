import type { POMNode, PositionedNode } from "../types.ts";
import { getImageData } from "../calcYogaLayout/measureImage.ts";

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
    case "layer": {
      // layer の子要素は layer 内の相対座標（child.x, child.y）を持つ
      // layer の絶対座標に加算してスライド上の絶対座標に変換
      return {
        ...pom,
        x: absoluteX,
        y: absoluteY,
        w: layout.width,
        h: layout.height,
        children: pom.children.map((child) => {
          // layer 内での子要素の絶対座標（child.x, child.y がない場合は 0）
          const childX = child.x ?? 0;
          const childY = child.y ?? 0;

          // line ノードは特別な処理が必要
          // x1, y1, x2, y2 は layer 内の相対座標として扱い、layer の座標を加算
          if (child.type === "line") {
            const lineAbsoluteX = absoluteX + childX;
            const lineAbsoluteY = absoluteY + childY;
            const adjustedX1 = child.x1 + lineAbsoluteX;
            const adjustedY1 = child.y1 + lineAbsoluteY;
            const adjustedX2 = child.x2 + lineAbsoluteX;
            const adjustedY2 = child.y2 + lineAbsoluteY;

            return {
              ...child,
              x1: adjustedX1,
              y1: adjustedY1,
              x2: adjustedX2,
              y2: adjustedY2,
              x: Math.min(adjustedX1, adjustedX2),
              y: Math.min(adjustedY1, adjustedY2),
              w: Math.abs(adjustedX2 - adjustedX1),
              h: Math.abs(adjustedY2 - adjustedY1),
            };
          }

          // その他のノードは通常の処理
          // Yoga で計算された子要素の相対座標を取得
          const childLayout = child.yogaNode.getComputedLayout();
          // 正しい親座標を計算: layer の座標 + child.x - Yoga の相対座標
          // こうすることで toPositioned 内で:
          // absoluteX = adjustedParentX + childLayout.left
          //           = (absoluteX + child.x - childLayout.left) + childLayout.left
          //           = absoluteX + child.x
          // となり、子要素とその内部の子要素が正しい座標で配置される
          const adjustedParentX = absoluteX + childX - childLayout.left;
          const adjustedParentY = absoluteY + childY - childLayout.top;

          return toPositioned(child, adjustedParentX, adjustedParentY);
        }),
      };
    }
  }
}
