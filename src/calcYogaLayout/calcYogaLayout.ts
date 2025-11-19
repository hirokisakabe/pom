import type { POMNode } from "../types";
import { Node as YogaNode } from "yoga-layout";
import { loadYoga } from "yoga-layout/load";
import { measureText } from "./measureText";
import { measureImage } from "./measureImage";
import { calcTableIntrinsicSize } from "../table/utils";

/**
 * POMNode ツリーを Yoga でレイアウト計算する
 * POMNode ツリーの各ノードに yogaNode プロパティがセットされる
 *
 * @param root 入力 POMNode ツリーのルート
 * @param slideSize スライド全体のサイズ（px）
 */
export async function calcYogaLayout(
  root: POMNode,
  slideSize: { w: number; h: number },
) {
  const Yoga = await getYoga();

  const rootYoga = Yoga.Node.create();
  root.yogaNode = rootYoga;

  await buildPomWithYogaTree(root, rootYoga);

  // スライド全体サイズを指定
  rootYoga.setWidth(slideSize.w);
  rootYoga.setHeight(slideSize.h);

  rootYoga.calculateLayout(slideSize.w, slideSize.h, Yoga.DIRECTION_LTR);
}

/**
 * Yogaシングルトン
 */
let yogaP: Promise<Yoga> | null = null;
type Yoga = Awaited<ReturnType<typeof loadYoga>>;
async function getYoga(): Promise<Yoga> {
  if (!yogaP) yogaP = loadYoga();
  return yogaP;
}

/**
 * POMNode ツリーを再帰的に走査し、YogaNode ツリーを構築する
 */
async function buildPomWithYogaTree(node: POMNode, parentYoga: YogaNode) {
  const yoga = await getYoga();

  const yn = yoga.Node.create();
  node.yogaNode = yn; // 対応する YogaNode をセット

  await applyStyleToYogaNode(node, yn);

  parentYoga.insertChild(yn, parentYoga.getChildCount());

  switch (node.type) {
    case "box": {
      await buildPomWithYogaTree(node.children, yn);
      break;
    }
    case "vstack":
    case "hstack": {
      for (const child of node.children) {
        await buildPomWithYogaTree(child, yn);
      }
      break;
    }
    case "text":
    case "image":
    case "table":
    case "shape":
      // 子要素なし
      break;
  }
}

/**
 * node のスタイルを YogaNode に適用する
 */
async function applyStyleToYogaNode(node: POMNode, yn: YogaNode) {
  const yoga = await getYoga();

  // デフォルト: 縦並び
  yn.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);

  // width
  if (node.w !== undefined) {
    if (typeof node.w === "number") {
      yn.setWidth(node.w);
    } else if (node.w === "max") {
      yn.setFlexGrow(1);
    } else if (node.w.endsWith("%")) {
      const percent = parseFloat(node.w);
      yn.setWidthPercent(percent);
    }
  }

  // height
  if (node.h !== undefined) {
    if (typeof node.h === "number") {
      yn.setHeight(node.h);
    } else if (node.h === "max") {
      yn.setFlexGrow(1);
    } else if (node.h.endsWith("%")) {
      const percent = parseFloat(node.h);
      yn.setHeightPercent(percent);
    }
  }

  // min/max constraints
  if (node.minW !== undefined) {
    yn.setMinWidth(node.minW);
  }
  if (node.maxW !== undefined) {
    yn.setMaxWidth(node.maxW);
  }
  if (node.minH !== undefined) {
    yn.setMinHeight(node.minH);
  }
  if (node.maxH !== undefined) {
    yn.setMaxHeight(node.maxH);
  }

  // padding
  if (node.padding !== undefined) {
    if (typeof node.padding === "number") {
      yn.setPadding(yoga.EDGE_TOP, node.padding);
      yn.setPadding(yoga.EDGE_RIGHT, node.padding);
      yn.setPadding(yoga.EDGE_BOTTOM, node.padding);
      yn.setPadding(yoga.EDGE_LEFT, node.padding);
    } else {
      if (node.padding.top !== undefined) {
        yn.setPadding(yoga.EDGE_TOP, node.padding.top);
      }
      if (node.padding.right !== undefined) {
        yn.setPadding(yoga.EDGE_RIGHT, node.padding.right);
      }
      if (node.padding.bottom !== undefined) {
        yn.setPadding(yoga.EDGE_BOTTOM, node.padding.bottom);
      }
      if (node.padding.left !== undefined) {
        yn.setPadding(yoga.EDGE_LEFT, node.padding.left);
      }
    }
  }

  switch (node.type) {
    case "box":
      // 特になし
      break;

    case "vstack": {
      yn.setFlexDirection(yoga.FLEX_DIRECTION_COLUMN);

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
      break;
    }

    case "hstack": {
      yn.setFlexDirection(yoga.FLEX_DIRECTION_ROW);

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
      break;
    }

    case "text":
      {
        const text = node.text;
        const fontSizePx = node.fontPx ?? 24;
        const fontFamily = "Noto Sans JP";
        const fontWeight = "normal";
        const lineHeight = 1.3;

        yn.setMeasureFunc((width, widthMode) => {
          const maxWidthPx = (() => {
            switch (widthMode) {
              case yoga.MEASURE_MODE_UNDEFINED:
                return Number.POSITIVE_INFINITY;
              case yoga.MEASURE_MODE_EXACTLY:
              case yoga.MEASURE_MODE_AT_MOST:
                return width;
            }
          })();

          const { widthPx, heightPx } = measureText(text, maxWidthPx, {
            fontFamily,
            fontSizePx,
            lineHeight,
            fontWeight,
          });

          return {
            width: widthPx,
            height: heightPx,
          };
        });
      }
      break;

    case "image":
      {
        const src = node.src;

        yn.setMeasureFunc(() => {
          // 画像の実際のサイズを取得
          const { widthPx, heightPx } = measureImage(src);

          return {
            width: widthPx,
            height: heightPx,
          };
        });
      }
      break;

    case "table":
      {
        yn.setMeasureFunc(() => {
          const { width, height } = calcTableIntrinsicSize(node);

          return {
            width,
            height,
          };
        });
      }
      break;

    case "shape":
      {
        if (node.text) {
          // テキストがある場合、テキストサイズを測定
          const text = node.text;
          const fontSizePx = node.fontPx ?? 24;
          const fontFamily = "Noto Sans JP";
          const fontWeight = "normal";
          const lineHeight = 1.3;

          yn.setMeasureFunc((width, widthMode) => {
            const maxWidthPx = (() => {
              switch (widthMode) {
                case yoga.MEASURE_MODE_UNDEFINED:
                  return Number.POSITIVE_INFINITY;
                case yoga.MEASURE_MODE_EXACTLY:
                case yoga.MEASURE_MODE_AT_MOST:
                  return width;
              }
            })();

            const { widthPx, heightPx } = measureText(text, maxWidthPx, {
              fontFamily,
              fontSizePx,
              lineHeight,
              fontWeight,
            });

            return {
              width: widthPx,
              height: heightPx,
            };
          });
        }
        // テキストがない場合は、明示的にサイズが指定されていることを期待
      }
      break;
  }
}
