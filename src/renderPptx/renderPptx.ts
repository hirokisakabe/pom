import { createRequire } from "module";

// pptxgenjs の型定義（NodeNext 互換）
type PptxGenJSInstance = import("pptxgenjs").default;

const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const PptxGenJS = require("pptxgenjs").default as new () => PptxGenJSInstance;
type SlideMasterProps = Parameters<PptxGenJSInstance["defineSlideMaster"]>[0];
type ImageProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  path?: string;
  data?: string;
};
import type {
  PositionedNode,
  SlideMasterOptions,
  MasterObject,
} from "../types.ts";
import type { RenderContext } from "./types.ts";
import { pxToIn, pxToPt } from "./units.ts";
import { renderBackgroundAndBorder } from "./utils/backgroundBorder.ts";
import {
  renderTextNode,
  renderImageNode,
  renderTableNode,
  renderShapeNode,
  renderChartNode,
  renderTimelineNode,
  renderMatrixNode,
  renderTreeNode,
  renderFlowNode,
  renderProcessArrowNode,
  renderLineNode,
} from "./nodes/index.ts";

type SlidePx = { w: number; h: number };
export { createTextOptions } from "./textOptions.ts";
export { PX_PER_IN, pxToIn, pxToPt } from "./units.ts";

const DEFAULT_MASTER_NAME = "POM_MASTER";

/**
 * MasterObject を pptxgenjs の objects 形式に変換する
 */
function convertMasterObject(
  obj: MasterObject,
): SlideMasterProps["objects"] extends (infer T)[] | undefined ? T : never {
  switch (obj.type) {
    case "text":
      return {
        text: {
          text: obj.text,
          options: {
            x: pxToIn(obj.x),
            y: pxToIn(obj.y),
            w: pxToIn(obj.w),
            h: pxToIn(obj.h),
            fontSize: obj.fontPx ? pxToPt(obj.fontPx) : undefined,
            fontFace: obj.fontFamily,
            color: obj.color,
            bold: obj.bold,
            align: obj.alignText,
          },
        },
      };
    case "image": {
      const imageProps: ImageProps = {
        x: pxToIn(obj.x),
        y: pxToIn(obj.y),
        w: pxToIn(obj.w),
        h: pxToIn(obj.h),
      };
      // src が data URI かパスかを判定
      if (obj.src.startsWith("data:")) {
        imageProps.data = obj.src;
      } else {
        imageProps.path = obj.src;
      }
      return { image: imageProps };
    }
    case "rect":
      return {
        rect: {
          x: pxToIn(obj.x),
          y: pxToIn(obj.y),
          w: pxToIn(obj.w),
          h: pxToIn(obj.h),
          fill: obj.fill
            ? { color: obj.fill.color, transparency: obj.fill.transparency }
            : undefined,
          line: obj.border
            ? {
                color: obj.border.color,
                width: obj.border.width,
                dashType: obj.border.dashType,
              }
            : undefined,
        },
      };
    case "line":
      return {
        line: {
          x: pxToIn(obj.x),
          y: pxToIn(obj.y),
          w: pxToIn(obj.w),
          h: pxToIn(obj.h),
          line: obj.line
            ? {
                color: obj.line.color,
                width: obj.line.width,
                dashType: obj.line.dashType,
              }
            : { color: "000000", width: 1 },
        },
      };
  }
}

/**
 * SlideMasterOptions から pptxgenjs の defineSlideMaster を呼び出す
 */
function defineSlideMasterFromOptions(
  pptx: PptxGenJSInstance,
  master: SlideMasterOptions,
): string {
  const masterName = master.title || DEFAULT_MASTER_NAME;

  const masterProps: SlideMasterProps = {
    title: masterName,
  };

  // background の変換
  if (master.background) {
    if ("color" in master.background) {
      masterProps.background = { color: master.background.color };
    } else if ("path" in master.background) {
      masterProps.background = { path: master.background.path };
    } else if ("data" in master.background) {
      masterProps.background = { data: master.background.data };
    }
  }

  // margin の変換 (px -> inches)
  if (master.margin !== undefined) {
    if (typeof master.margin === "number") {
      masterProps.margin = pxToIn(master.margin);
    } else {
      masterProps.margin = [
        pxToIn(master.margin.top ?? 0),
        pxToIn(master.margin.right ?? 0),
        pxToIn(master.margin.bottom ?? 0),
        pxToIn(master.margin.left ?? 0),
      ];
    }
  }

  // objects の変換
  if (master.objects && master.objects.length > 0) {
    masterProps.objects = master.objects.map((obj) => convertMasterObject(obj));
  }

  // slideNumber の変換
  if (master.slideNumber) {
    masterProps.slideNumber = {
      x: pxToIn(master.slideNumber.x),
      y: pxToIn(master.slideNumber.y),
      w: master.slideNumber.w ? pxToIn(master.slideNumber.w) : undefined,
      h: master.slideNumber.h ? pxToIn(master.slideNumber.h) : undefined,
      fontSize: master.slideNumber.fontPx
        ? pxToPt(master.slideNumber.fontPx)
        : undefined,
      fontFace: master.slideNumber.fontFamily,
      color: master.slideNumber.color,
    };
  }

  pptx.defineSlideMaster(masterProps);
  return masterName;
}

/**
 * PositionedNode ツリーを PptxGenJS スライドに変換する
 * @param pages PositionedNode ツリーの配列（各要素が1ページ）
 * @param slidePx スライド全体のサイズ（px）
 * @param master スライドマスターオプション（省略可能）
 * @returns PptxGenJS インスタンス
 */
export function renderPptx(
  pages: PositionedNode[],
  slidePx: SlidePx,
  master?: SlideMasterOptions,
) {
  const slideIn = { w: pxToIn(slidePx.w), h: pxToIn(slidePx.h) }; // layout(=px) → PptxGenJS(=inch) への最終変換

  const pptx = new PptxGenJS();

  pptx.defineLayout({ name: "custom", width: slideIn.w, height: slideIn.h });
  pptx.layout = "custom";

  // マスターが指定されている場合、defineSlideMaster を呼び出す
  const masterName = master
    ? defineSlideMasterFromOptions(pptx, master)
    : undefined;

  for (const data of pages) {
    // マスターが指定されている場合は masterName を使用
    const slide = masterName ? pptx.addSlide({ masterName }) : pptx.addSlide();
    const ctx: RenderContext = { slide, pptx };

    // ルートノードの backgroundColor はスライドの background プロパティとして適用
    // これにより、マスタースライドのオブジェクトを覆い隠さない
    // line ノードは backgroundColor を持たないためスキップ
    const rootBackgroundColor =
      data.type !== "line" ? data.backgroundColor : undefined;
    if (rootBackgroundColor) {
      slide.background = { color: rootBackgroundColor };
    }

    /**
     * node をスライドにレンダリングする
     * @param isRoot ルートノードかどうか（ルートノードの background は slide.background で処理済み）
     */
    function renderNode(node: PositionedNode, isRoot = false) {
      // line ノードは backgroundColor/border を持たないため、background/border の描画をスキップ
      if (node.type !== "line") {
        // ルートノードの backgroundColor は既に slide.background に適用済みなのでスキップ
        if (isRoot && rootBackgroundColor) {
          // border のみ描画（backgroundColor はスキップ）
          const { border, borderRadius } = node;
          const hasBorder = Boolean(
            border &&
              (border.color !== undefined ||
                border.width !== undefined ||
                border.dashType !== undefined),
          );
          if (hasBorder) {
            const line = {
              color: border?.color ?? "000000",
              width:
                border?.width !== undefined ? pxToPt(border.width) : undefined,
              dashType: border?.dashType,
            };
            const shapeType = borderRadius
              ? ctx.pptx.ShapeType.roundRect
              : ctx.pptx.ShapeType.rect;
            const rectRadius = borderRadius
              ? Math.min((borderRadius / Math.min(node.w, node.h)) * 2, 1)
              : undefined;
            ctx.slide.addShape(shapeType, {
              x: pxToIn(node.x),
              y: pxToIn(node.y),
              w: pxToIn(node.w),
              h: pxToIn(node.h),
              fill: { type: "none" },
              line,
              rectRadius,
            });
          }
        } else {
          renderBackgroundAndBorder(node, ctx);
        }
      }

      switch (node.type) {
        case "text":
          renderTextNode(node, ctx);
          break;

        case "image":
          renderImageNode(node, ctx);
          break;

        case "box":
          // 子要素を再帰的に処理
          renderNode(node.children);
          break;

        case "vstack":
        case "hstack":
          // 子要素を再帰的に処理
          for (const child of node.children) {
            renderNode(child);
          }
          break;

        case "table":
          renderTableNode(node, ctx);
          break;

        case "shape":
          renderShapeNode(node, ctx);
          break;

        case "chart":
          renderChartNode(node, ctx);
          break;

        case "timeline":
          renderTimelineNode(node, ctx);
          break;

        case "matrix":
          renderMatrixNode(node, ctx);
          break;

        case "tree":
          renderTreeNode(node, ctx);
          break;

        case "flow":
          renderFlowNode(node, ctx);
          break;

        case "processArrow":
          renderProcessArrowNode(node, ctx);
          break;

        case "line":
          renderLineNode(node, ctx);
          break;

        case "layer":
          // layer の子要素を配列順に描画（後の要素が上に来る）
          for (const child of node.children) {
            renderNode(child);
          }
          break;
      }
    }

    renderNode(data, true); // ルートノードとして処理
  }

  return pptx;
}
