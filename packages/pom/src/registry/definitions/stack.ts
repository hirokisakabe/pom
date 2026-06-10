import { type HStackNode, type POMNode, type VStackNode } from "../../types.ts";
import type { NodeDefinition, Yoga } from "../types.ts";
import type { Node as YogaNode } from "yoga-layout";
import { getNodeMetadata } from "../nodeMetadata.ts";

/**
 * vstack/hstack 共通の Flex プロパティを適用する
 */
function applyFlexProperties(
  node: VStackNode | HStackNode,
  yn: YogaNode,
  yoga: Yoga,
): void {
  if (node.gap !== undefined) {
    yn.setGap(yoga.GUTTER_ROW, node.gap);
    yn.setGap(yoga.GUTTER_COLUMN, node.gap);
  }

  if (node.alignItems !== undefined) {
    switch (node.alignItems) {
      case "start":
        yn.setAlignItems(yoga.ALIGN_FLEX_START);
        break;
      case "center":
        yn.setAlignItems(yoga.ALIGN_CENTER);
        break;
      case "end":
        yn.setAlignItems(yoga.ALIGN_FLEX_END);
        break;
      case "stretch":
        yn.setAlignItems(yoga.ALIGN_STRETCH);
        break;
    }
  }

  if (node.justifyContent !== undefined) {
    switch (node.justifyContent) {
      case "start":
        yn.setJustifyContent(yoga.JUSTIFY_FLEX_START);
        break;
      case "center":
        yn.setJustifyContent(yoga.JUSTIFY_CENTER);
        break;
      case "end":
        yn.setJustifyContent(yoga.JUSTIFY_FLEX_END);
        break;
      case "spaceBetween":
        yn.setJustifyContent(yoga.JUSTIFY_SPACE_BETWEEN);
        break;
      case "spaceAround":
        yn.setJustifyContent(yoga.JUSTIFY_SPACE_AROUND);
        break;
      case "spaceEvenly":
        yn.setJustifyContent(yoga.JUSTIFY_SPACE_EVENLY);
        break;
    }
  }

  if (node.flexWrap !== undefined) {
    switch (node.flexWrap) {
      case "nowrap":
        yn.setFlexWrap(yoga.WRAP_NO_WRAP);
        break;
      case "wrap":
        yn.setFlexWrap(yoga.WRAP_WRAP);
        break;
      case "wrapReverse":
        yn.setFlexWrap(yoga.WRAP_WRAP_REVERSE);
        break;
    }
  }
}

export const vstackNodeDef: NodeDefinition = {
  ...getNodeMetadata("vstack"),
  applyYogaStyle(node: POMNode, yn: YogaNode, yoga: Yoga) {
    yn.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);
    applyFlexProperties(node as VStackNode, yn, yoga);
  },
  // render: category ベースの子要素再帰で対応
};

export const hstackNodeDef: NodeDefinition = {
  ...getNodeMetadata("hstack"),
  applyYogaStyle(node: POMNode, yn: YogaNode, yoga: Yoga) {
    yn.setFlexDirection(yoga.FLEX_DIRECTION_ROW);
    applyFlexProperties(node as HStackNode, yn, yoga);
  },
  // render: category ベースの子要素再帰で対応
};
