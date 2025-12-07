import { createRequire } from "module";
const require = createRequire(import.meta.url);
import type PptxGenJSType from "pptxgenjs";
const PptxGenJS = require("pptxgenjs") as typeof PptxGenJSType;
import type { PositionedNode } from "../types";
import { resolveRowHeights } from "../table/utils";
import { createTextOptions } from "./textOptions";
import { pxToIn, pxToPt } from "./units";

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

    function renderBackgroundAndBorder(node: PositionedNode) {
      const { backgroundColor, border } = node;
      const hasBackground = Boolean(backgroundColor);
      const hasBorder = Boolean(
        border &&
          (border.color !== undefined ||
            border.width !== undefined ||
            border.dashType !== undefined),
      );

      if (!hasBackground && !hasBorder) {
        return;
      }

      const fill = hasBackground
        ? { color: backgroundColor }
        : { type: "none" as const };

      const line = hasBorder
        ? {
            color: border?.color ?? "000000",
            width:
              border?.width !== undefined ? pxToPt(border.width) : undefined,
            dashType: border?.dashType,
          }
        : { type: "none" as const };

      const shapeOptions = {
        x: pxToIn(node.x),
        y: pxToIn(node.y),
        w: pxToIn(node.w),
        h: pxToIn(node.h),
        fill,
        line,
      };

      slide.addShape(pptx.ShapeType.rect, shapeOptions);
    }

    /**
     * node をスライドにレンダリングする
     */
    function renderNode(node: PositionedNode) {
      renderBackgroundAndBorder(node);

      switch (node.type) {
        case "text": {
          const textOptions = createTextOptions(node);
          slide.addText(node.text ?? "", textOptions);
          break;
        }

        case "image": {
          slide.addImage({
            path: node.src,
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
          });
          break;
        }

        case "box": {
          // 子要素を再帰的に処理
          renderNode(node.children);
          break;
        }

        case "vstack":
        case "hstack": {
          // 子要素を再帰的に処理
          for (const child of node.children) {
            renderNode(child);
          }
          break;
        }

        case "table": {
          const tableRows = node.rows.map((row) =>
            row.cells.map((cell) => {
              const cellOptions = {
                fontSize: pxToPt(cell.fontPx ?? 18),
                color: cell.color,
                bold: cell.bold,
                align: cell.alignText ?? "left",
                fill: cell.backgroundColor
                  ? { color: cell.backgroundColor }
                  : undefined,
              };

              return {
                text: cell.text,
                options: cellOptions,
              };
            }),
          );

          const tableOptions = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
            colW: node.columns.map((column) => pxToIn(column.width)),
            rowH: resolveRowHeights(node).map((height) => pxToIn(height)),
            margin: 0,
          };

          slide.addTable(tableRows, tableOptions);
          break;
        }

        case "shape": {
          const shapeOptions = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
            fill: node.fill
              ? {
                  color: node.fill.color,
                  transparency: node.fill.transparency,
                }
              : undefined,
            line: node.line
              ? {
                  color: node.line.color,
                  width:
                    node.line.width !== undefined
                      ? pxToPt(node.line.width)
                      : undefined,
                  dashType: node.line.dashType,
                }
              : undefined,
            shadow: node.shadow
              ? {
                  type: node.shadow.type,
                  opacity: node.shadow.opacity,
                  blur: node.shadow.blur,
                  angle: node.shadow.angle,
                  offset: node.shadow.offset,
                  color: node.shadow.color,
                }
              : undefined,
          };

          if (node.text) {
            // テキストがある場合：addTextでshapeを指定
            slide.addText(node.text, {
              ...shapeOptions,
              shape: node.shapeType,
              fontSize: pxToPt(node.fontPx ?? 24),
              fontFace: "Noto Sans JP",
              color: node.fontColor,
              align: node.alignText ?? "center",
              valign: "middle" as const,
              lineSpacingMultiple: 1.3,
            });
          } else {
            // テキストがない場合：addShapeを使用
            slide.addShape(node.shapeType, shapeOptions);
          }
          break;
        }

        case "chart": {
          const chartData = node.data.map((d) => ({
            name: d.name,
            labels: d.labels,
            values: d.values,
          }));

          const chartOptions = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
            showLegend: node.showLegend ?? false,
            showTitle: node.showTitle ?? false,
            title: node.title,
            chartColors: node.chartColors,
          };

          slide.addChart(node.chartType, chartData, chartOptions);
          break;
        }
      }
    }

    renderNode(data);
  }

  return pptx;
}
