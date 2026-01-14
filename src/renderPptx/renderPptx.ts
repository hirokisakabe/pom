import { createRequire } from "module";
const require = createRequire(import.meta.url);
import type PptxGenJSType from "pptxgenjs";
const PptxGenJS = require("pptxgenjs") as typeof PptxGenJSType;
import type { PositionedNode } from "../types";
import { resolveColumnWidths, resolveRowHeights } from "../table/utils";
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
      const { backgroundColor, border, borderRadius } = node;
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

      // borderRadius がある場合は roundRect を使用し、rectRadius を計算
      const shapeType = borderRadius
        ? pptx.ShapeType.roundRect
        : pptx.ShapeType.rect;

      // px を 0-1 の正規化値に変換
      const rectRadius = borderRadius
        ? Math.min((borderRadius / Math.min(node.w, node.h)) * 2, 1)
        : undefined;

      const shapeOptions = {
        x: pxToIn(node.x),
        y: pxToIn(node.y),
        w: pxToIn(node.w),
        h: pxToIn(node.h),
        fill,
        line,
        rectRadius,
      };

      slide.addShape(shapeType, shapeOptions);
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
          const imageOptions = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
          };

          if (node.imageData) {
            // Base64 データがある場合は data プロパティを使用（リモート画像）
            slide.addImage({ ...imageOptions, data: node.imageData });
          } else {
            // ローカルパスの場合は path プロパティを使用
            slide.addImage({ ...imageOptions, path: node.src });
          }
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
            colW: resolveColumnWidths(node, node.w).map((width) =>
              pxToIn(width),
            ),
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
              color: node.color,
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

          const chartOptions: Record<string, unknown> = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
            showLegend: node.showLegend ?? false,
            showTitle: node.showTitle ?? false,
            title: node.title,
            chartColors: node.chartColors,
          };

          // radar専用オプション
          if (node.chartType === "radar" && node.radarStyle) {
            chartOptions.radarStyle = node.radarStyle;
          }

          slide.addChart(node.chartType, chartData, chartOptions);
          break;
        }

        case "timeline": {
          const direction = node.direction ?? "horizontal";
          const items = node.items;
          const itemCount = items.length;

          if (itemCount === 0) break;

          const defaultColor = "1D4ED8"; // blue
          const nodeRadius = 12; // px
          const lineWidth = 4; // px

          if (direction === "horizontal") {
            // 水平タイムライン
            const lineY = node.y + node.h / 2;
            const startX = node.x + nodeRadius;
            const endX = node.x + node.w - nodeRadius;
            const lineLength = endX - startX;

            // メインの線を描画
            slide.addShape(pptx.ShapeType.line, {
              x: pxToIn(startX),
              y: pxToIn(lineY),
              w: pxToIn(lineLength),
              h: 0,
              line: { color: "E2E8F0", width: pxToPt(lineWidth) },
            });

            // 各アイテムを描画
            items.forEach((item, index) => {
              const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
              const cx = startX + lineLength * progress;
              const cy = lineY;
              const color = item.color ?? defaultColor;

              // ノード（円）を描画
              slide.addShape(pptx.ShapeType.ellipse, {
                x: pxToIn(cx - nodeRadius),
                y: pxToIn(cy - nodeRadius),
                w: pxToIn(nodeRadius * 2),
                h: pxToIn(nodeRadius * 2),
                fill: { color },
                line: { type: "none" as const },
              });

              // 日付を上に表示
              slide.addText(item.date, {
                x: pxToIn(cx - 60),
                y: pxToIn(cy - nodeRadius - 40),
                w: pxToIn(120),
                h: pxToIn(24),
                fontSize: pxToPt(12),
                fontFace: "Noto Sans JP",
                color: "64748B",
                align: "center",
                valign: "bottom",
              });

              // タイトルを下に表示
              slide.addText(item.title, {
                x: pxToIn(cx - 60),
                y: pxToIn(cy + nodeRadius + 8),
                w: pxToIn(120),
                h: pxToIn(24),
                fontSize: pxToPt(14),
                fontFace: "Noto Sans JP",
                color: "1E293B",
                bold: true,
                align: "center",
                valign: "top",
              });

              // 説明を表示
              if (item.description) {
                slide.addText(item.description, {
                  x: pxToIn(cx - 60),
                  y: pxToIn(cy + nodeRadius + 32),
                  w: pxToIn(120),
                  h: pxToIn(32),
                  fontSize: pxToPt(11),
                  fontFace: "Noto Sans JP",
                  color: "64748B",
                  align: "center",
                  valign: "top",
                });
              }
            });
          } else {
            // 垂直タイムライン
            const lineX = node.x + 40;
            const startY = node.y + nodeRadius;
            const endY = node.y + node.h - nodeRadius;
            const lineLength = endY - startY;

            // メインの線を描画
            slide.addShape(pptx.ShapeType.line, {
              x: pxToIn(lineX),
              y: pxToIn(startY),
              w: 0,
              h: pxToIn(lineLength),
              line: { color: "E2E8F0", width: pxToPt(lineWidth) },
            });

            // 各アイテムを描画
            items.forEach((item, index) => {
              const progress = itemCount === 1 ? 0.5 : index / (itemCount - 1);
              const cx = lineX;
              const cy = startY + lineLength * progress;
              const color = item.color ?? defaultColor;

              // ノード（円）を描画
              slide.addShape(pptx.ShapeType.ellipse, {
                x: pxToIn(cx - nodeRadius),
                y: pxToIn(cy - nodeRadius),
                w: pxToIn(nodeRadius * 2),
                h: pxToIn(nodeRadius * 2),
                fill: { color },
                line: { type: "none" as const },
              });

              // 日付を左上に表示
              slide.addText(item.date, {
                x: pxToIn(cx + nodeRadius + 16),
                y: pxToIn(cy - nodeRadius - 4),
                w: pxToIn(100),
                h: pxToIn(20),
                fontSize: pxToPt(12),
                fontFace: "Noto Sans JP",
                color: "64748B",
                align: "left",
                valign: "bottom",
              });

              // タイトルを右に表示
              slide.addText(item.title, {
                x: pxToIn(cx + nodeRadius + 16),
                y: pxToIn(cy - 4),
                w: pxToIn(node.w - 80),
                h: pxToIn(24),
                fontSize: pxToPt(14),
                fontFace: "Noto Sans JP",
                color: "1E293B",
                bold: true,
                align: "left",
                valign: "top",
              });

              // 説明を表示
              if (item.description) {
                slide.addText(item.description, {
                  x: pxToIn(cx + nodeRadius + 16),
                  y: pxToIn(cy + 20),
                  w: pxToIn(node.w - 80),
                  h: pxToIn(32),
                  fontSize: pxToPt(11),
                  fontFace: "Noto Sans JP",
                  color: "64748B",
                  align: "left",
                  valign: "top",
                });
              }
            });
          }
          break;
        }
      }
    }

    renderNode(data);
  }

  return pptx;
}
