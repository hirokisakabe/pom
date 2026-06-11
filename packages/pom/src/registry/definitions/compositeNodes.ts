import { type POMNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import {
  measureProcessArrow,
  measureTimeline,
  measureMatrix,
  measureTree,
  measureFlow,
  measurePyramid,
} from "../../calcYogaLayout/measureCompositeNodes.ts";
import { renderTimelineNode } from "../../renderPptx/nodes/timeline.ts";
import { renderMatrixNode } from "../../renderPptx/nodes/matrix.ts";
import { renderTreeNode } from "../../renderPptx/nodes/tree.ts";
import { renderFlowNode } from "../../renderPptx/nodes/flow.ts";
import { renderProcessArrowNode } from "../../renderPptx/nodes/processArrow.ts";
import { renderPyramidNode } from "../../renderPptx/nodes/pyramid.ts";
import { getNodeMetadata } from "../nodeMetadata.ts";

/**
 * コンポジットノードの最小スケール閾値。
 * renderPptx/utils/scaleToFit.ts の MIN_SCALE_THRESHOLD と同じ値を維持すること。
 */
const MIN_SCALE_THRESHOLD = 0.5;

/** 制約付きサイズを閾値でクランプする */
function constrainWithMinScale(
  intrinsicSize: number,
  availableSize: number,
): number {
  const minSize = intrinsicSize * MIN_SCALE_THRESHOLD;
  return Math.max(minSize, Math.min(intrinsicSize, availableSize));
}

/** コンポジットノード共通の measureFunc セットアップ */
function applyCompositeMeasure(
  measureFn: (node: POMNode) => { width: number; height: number },
): (node: POMNode, yn: YogaNode, yoga: Yoga) => void {
  return (node, yn, yoga) => {
    yn.setMeasureFunc((width, widthMode, height, heightMode) => {
      const intrinsic = measureFn(node);
      return {
        width:
          widthMode !== yoga.MEASURE_MODE_UNDEFINED
            ? constrainWithMinScale(intrinsic.width, width)
            : intrinsic.width,
        height:
          heightMode !== yoga.MEASURE_MODE_UNDEFINED
            ? constrainWithMinScale(intrinsic.height, height)
            : intrinsic.height,
      };
    });
  };
}

export const timelineNodeDef: NodeDefinition = {
  ...getNodeMetadata("timeline"),
  applyYogaStyle: applyCompositeMeasure(
    measureTimeline as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderTimelineNode(node as Extract<typeof node, { type: "timeline" }>, ctx);
  },
};

export const matrixNodeDef: NodeDefinition = {
  ...getNodeMetadata("matrix"),
  applyYogaStyle: applyCompositeMeasure(
    measureMatrix as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderMatrixNode(node as Extract<typeof node, { type: "matrix" }>, ctx);
  },
};

export const treeNodeDef: NodeDefinition = {
  ...getNodeMetadata("tree"),
  applyYogaStyle: applyCompositeMeasure(
    measureTree as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderTreeNode(node as Extract<typeof node, { type: "tree" }>, ctx);
  },
};

export const flowNodeDef: NodeDefinition = {
  ...getNodeMetadata("flow"),
  applyYogaStyle: applyCompositeMeasure(
    measureFlow as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderFlowNode(node as Extract<typeof node, { type: "flow" }>, ctx);
  },
};

export const processArrowNodeDef: NodeDefinition = {
  ...getNodeMetadata("processArrow"),
  applyYogaStyle: applyCompositeMeasure(
    measureProcessArrow as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderProcessArrowNode(
      node as Extract<typeof node, { type: "processArrow" }>,
      ctx,
    );
  },
};

export const pyramidNodeDef: NodeDefinition = {
  ...getNodeMetadata("pyramid"),
  applyYogaStyle: applyCompositeMeasure(
    measurePyramid as (node: POMNode) => { width: number; height: number },
  ),
  render(node, ctx) {
    renderPyramidNode(node as Extract<typeof node, { type: "pyramid" }>, ctx);
  },
};
