import type {
  ProcessArrowNode,
  TimelineNode,
  MatrixNode,
  TreeNode,
  FlowNode,
  TreeDataItem,
} from "../types.ts";

/**
 * ProcessArrow ノードの intrinsic size を計算する
 */
export function measureProcessArrow(node: ProcessArrowNode): {
  width: number;
  height: number;
} {
  const stepCount = node.steps.length;
  if (stepCount === 0) {
    return { width: 0, height: 0 };
  }

  const itemWidth = node.itemWidth ?? 150;
  const itemHeight = node.itemHeight ?? 60;
  const gap = node.gap ?? -15;
  const direction = node.direction ?? "horizontal";

  if (direction === "horizontal") {
    return {
      width: stepCount * itemWidth + (stepCount - 1) * gap,
      height: itemHeight,
    };
  } else {
    return {
      width: itemWidth,
      height: stepCount * itemHeight + (stepCount - 1) * gap,
    };
  }
}

/**
 * Timeline ノードの intrinsic size を計算する
 *
 * Timeline の描画には以下の固定値が使用される：
 * - nodeRadius: 12px (円のサイズ)
 * - 日付ラベル領域: 上部 40px
 * - タイトルラベル領域: 下部 24px
 * - 説明ラベル領域: 下部 32px
 */
export function measureTimeline(node: TimelineNode): {
  width: number;
  height: number;
} {
  const itemCount = node.items.length;
  if (itemCount === 0) {
    return { width: 0, height: 0 };
  }

  const nodeRadius = 12;
  const direction = node.direction ?? "horizontal";

  if (direction === "horizontal") {
    // 各アイテムの幅: 120px (ラベル幅)
    // 最小幅: nodeRadius * 2 + (itemCount - 1) * 間隔
    const minItemSpacing = 120; // 各アイテムの最小間隔
    const minWidth = nodeRadius * 2 + (itemCount - 1) * minItemSpacing;

    // 高さ: 上部ラベル(40) + nodeRadius*2 + 下部ラベル(24+32) + マージン
    const height = 40 + nodeRadius * 2 + 8 + 24 + 32;

    return {
      width: minWidth,
      height: height,
    };
  } else {
    // 垂直方向
    // 各アイテムの高さ: 約 60px
    const minItemSpacing = 60;
    const minHeight = nodeRadius * 2 + (itemCount - 1) * minItemSpacing;

    // 幅: lineX(40) + nodeRadius + ラベル幅
    const width = 40 + nodeRadius * 2 + 16 + 100;

    return {
      width: width,
      height: minHeight,
    };
  }
}

/**
 * Matrix ノードの intrinsic size を計算する
 *
 * Matrix の描画には以下の固定値が使用される：
 * - padding: 60px (軸ラベル用の余白)
 * - itemSize: 24px (アイテムの円のサイズ)
 */
export function measureMatrix(_: MatrixNode): {
  width: number;
  height: number;
} {
  const padding = 60;
  const minAreaSize = 100; // 最小の内部描画領域サイズ

  return {
    width: padding * 2 + minAreaSize,
    height: padding * 2 + minAreaSize,
  };
}

/**
 * Tree ノードの intrinsic size を計算する
 *
 * ツリー構造を再帰的に走査し、必要なサイズを計算する
 */
export function measureTree(node: TreeNode): {
  width: number;
  height: number;
} {
  const layout = node.layout ?? "vertical";
  const nodeWidth = node.nodeWidth ?? 120;
  const nodeHeight = node.nodeHeight ?? 40;
  const levelGap = node.levelGap ?? 60;
  const siblingGap = node.siblingGap ?? 20;

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

  return calculateSubtreeSize(node.data);
}

/**
 * Flow ノードの intrinsic size を計算する
 */
export function measureFlow(node: FlowNode): {
  width: number;
  height: number;
} {
  const nodeCount = node.nodes.length;
  if (nodeCount === 0) {
    return { width: 0, height: 0 };
  }

  const nodeWidth = node.nodeWidth ?? 120;
  const nodeHeight = node.nodeHeight ?? 60;
  const nodeGap = node.nodeGap ?? 80;
  const direction = node.direction ?? "horizontal";

  if (direction === "horizontal") {
    return {
      width: nodeCount * nodeWidth + (nodeCount - 1) * nodeGap,
      height: nodeHeight,
    };
  } else {
    return {
      width: nodeWidth,
      height: nodeCount * nodeHeight + (nodeCount - 1) * nodeGap,
    };
  }
}
