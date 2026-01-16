import { createRequire } from "module";
const require = createRequire(import.meta.url);
import type PptxGenJSType from "pptxgenjs";
const PptxGenJS = require("pptxgenjs") as typeof PptxGenJSType;
import type { PositionedNode } from "../types";
import type { RenderContext } from "./types";
import { pxToIn } from "./units";
import { renderBackgroundAndBorder } from "./utils/backgroundBorder";
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
} from "./nodes";

type SlidePx = { w: number; h: number };
export { createTextOptions } from "./textOptions";
export { PX_PER_IN, pxToIn, pxToPt } from "./units";

/**
 * PositionedNode ツリーを PptxGenJS スライドに変換する
 * @param pages PositionedNode ツリーの配列（各要素が1ページ）
 * @param slidePx スライド全体のサイズ（px）
 * @returns PptxGenJS インスタンス
 */
export function renderPptx(pages: PositionedNode[], slidePx: SlidePx) {
  const slideIn = { w: pxToIn(slidePx.w), h: pxToIn(slidePx.h) }; // layout(=px) → PptxGenJS(=inch) への最終変換

  const pptx = new PptxGenJS();

  pptx.defineLayout({ name: "custom", width: slideIn.w, height: slideIn.h });
  pptx.layout = "custom";

  for (const data of pages) {
    const slide = pptx.addSlide();
    const ctx: RenderContext = { slide, pptx };

    /**
     * node をスライドにレンダリングする
     */
    function renderNode(node: PositionedNode) {
      renderBackgroundAndBorder(node, ctx);

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
      }
    }

    renderNode(data);
  }

  return pptx;
}
