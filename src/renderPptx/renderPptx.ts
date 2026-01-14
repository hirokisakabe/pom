import { createRequire } from "module";
const require = createRequire(import.meta.url);
import type PptxGenJSType from "pptxgenjs";
const PptxGenJS = require("pptxgenjs") as typeof PptxGenJSType;
import type {
  PositionedNode,
  TreeDataItem,
  TreeNodeShape,
  TreeConnectorStyle,
} from "../types";
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

        case "matrix": {
          const items = node.items;
          const axes = node.axes;
          const quadrants = node.quadrants;

          const defaultItemColor = "1D4ED8"; // blue
          const itemSize = 24; // px
          const lineWidth = 2; // px
          const axisColor = "E2E8F0";

          // マトリクスの描画領域（パディングを考慮）
          const padding = 60; // 軸ラベル用の余白
          const areaX = node.x + padding;
          const areaY = node.y + padding;
          const areaW = node.w - padding * 2;
          const areaH = node.h - padding * 2;

          // 中心座標
          const centerX = areaX + areaW / 2;
          const centerY = areaY + areaH / 2;

          // === 1. 十字線（軸線）を描画 ===
          // 横線（X軸）
          slide.addShape(pptx.ShapeType.line, {
            x: pxToIn(areaX),
            y: pxToIn(centerY),
            w: pxToIn(areaW),
            h: 0,
            line: { color: axisColor, width: pxToPt(lineWidth) },
          });

          // 縦線（Y軸）
          slide.addShape(pptx.ShapeType.line, {
            x: pxToIn(centerX),
            y: pxToIn(areaY),
            w: 0,
            h: pxToIn(areaH),
            line: { color: axisColor, width: pxToPt(lineWidth) },
          });

          // === 2. 軸ラベルを描画 ===
          // X軸ラベル（下部中央）
          slide.addText(axes.x, {
            x: pxToIn(centerX - 60),
            y: pxToIn(areaY + areaH + 8),
            w: pxToIn(120),
            h: pxToIn(24),
            fontSize: pxToPt(12),
            fontFace: "Noto Sans JP",
            color: "64748B",
            align: "center",
            valign: "top",
          });

          // Y軸ラベル（左部中央）
          slide.addText(axes.y, {
            x: pxToIn(node.x + 4),
            y: pxToIn(centerY - 12),
            w: pxToIn(48),
            h: pxToIn(24),
            fontSize: pxToPt(12),
            fontFace: "Noto Sans JP",
            color: "64748B",
            align: "center",
            valign: "middle",
          });

          // === 3. 象限ラベルを描画 ===
          if (quadrants) {
            const quadrantFontSize = 11;
            const quadrantColor = "94A3B8"; // slate-400
            const quadrantW = areaW / 2 - 20;
            const quadrantH = 48;

            // 左上
            slide.addText(quadrants.topLeft, {
              x: pxToIn(areaX + 10),
              y: pxToIn(areaY + 10),
              w: pxToIn(quadrantW),
              h: pxToIn(quadrantH),
              fontSize: pxToPt(quadrantFontSize),
              fontFace: "Noto Sans JP",
              color: quadrantColor,
              align: "left",
              valign: "top",
            });

            // 右上
            slide.addText(quadrants.topRight, {
              x: pxToIn(centerX + 10),
              y: pxToIn(areaY + 10),
              w: pxToIn(quadrantW),
              h: pxToIn(quadrantH),
              fontSize: pxToPt(quadrantFontSize),
              fontFace: "Noto Sans JP",
              color: quadrantColor,
              align: "right",
              valign: "top",
            });

            // 左下
            slide.addText(quadrants.bottomLeft, {
              x: pxToIn(areaX + 10),
              y: pxToIn(centerY + areaH / 2 - quadrantH - 10),
              w: pxToIn(quadrantW),
              h: pxToIn(quadrantH),
              fontSize: pxToPt(quadrantFontSize),
              fontFace: "Noto Sans JP",
              color: quadrantColor,
              align: "left",
              valign: "bottom",
            });

            // 右下
            slide.addText(quadrants.bottomRight, {
              x: pxToIn(centerX + 10),
              y: pxToIn(centerY + areaH / 2 - quadrantH - 10),
              w: pxToIn(quadrantW),
              h: pxToIn(quadrantH),
              fontSize: pxToPt(quadrantFontSize),
              fontFace: "Noto Sans JP",
              color: quadrantColor,
              align: "right",
              valign: "bottom",
            });
          }

          // === 4. アイテムをプロット ===
          for (const item of items) {
            // 座標変換: (0,0)=左下, (1,1)=右上
            // x: 0 -> areaX, 1 -> areaX + areaW
            // y: 0 -> areaY + areaH, 1 -> areaY (反転)
            const itemX = areaX + item.x * areaW;
            const itemY = areaY + (1 - item.y) * areaH; // Y軸反転
            const itemColor = item.color ?? defaultItemColor;

            // 円を描画
            slide.addShape(pptx.ShapeType.ellipse, {
              x: pxToIn(itemX - itemSize / 2),
              y: pxToIn(itemY - itemSize / 2),
              w: pxToIn(itemSize),
              h: pxToIn(itemSize),
              fill: { color: itemColor },
              line: { type: "none" as const },
            });

            // ラベルを描画（円の上）
            slide.addText(item.label, {
              x: pxToIn(itemX - 50),
              y: pxToIn(itemY - itemSize / 2 - 20),
              w: pxToIn(100),
              h: pxToIn(18),
              fontSize: pxToPt(11),
              fontFace: "Noto Sans JP",
              color: "1E293B",
              bold: true,
              align: "center",
              valign: "bottom",
            });
          }
          break;
        }

        case "tree": {
          const layout = node.layout ?? "vertical";
          const nodeShape = node.nodeShape ?? "rect";
          const nodeWidth = node.nodeWidth ?? 120;
          const nodeHeight = node.nodeHeight ?? 40;
          const levelGap = node.levelGap ?? 60;
          const siblingGap = node.siblingGap ?? 20;
          const connectorStyle = node.connectorStyle ?? {};
          const defaultColor = "1D4ED8";

          // レイアウト計算用の型
          interface LayoutNode {
            item: TreeDataItem;
            x: number;
            y: number;
            width: number;
            height: number;
            children: LayoutNode[];
          }

          // サブツリーの幅/高さを計算
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
              const childrenHeight = Math.max(
                ...childSizes.map((s) => s.height),
              );
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

          // ツリーレイアウトを計算
          function calculateTreeLayout(
            item: TreeDataItem,
            x: number,
            y: number,
          ): LayoutNode {
            const subtreeSize = calculateSubtreeSize(item);
            const layoutNode: LayoutNode = {
              item,
              x: 0,
              y: 0,
              width: nodeWidth,
              height: nodeHeight,
              children: [],
            };

            if (layout === "vertical") {
              // ノードを中央上部に配置
              layoutNode.x = x + subtreeSize.width / 2 - nodeWidth / 2;
              layoutNode.y = y;

              // 子ノードを配置
              if (item.children && item.children.length > 0) {
                const childSizes = item.children.map(calculateSubtreeSize);
                const totalChildWidth =
                  childSizes.reduce((sum, s) => sum + s.width, 0) +
                  siblingGap * (childSizes.length - 1);
                let childX = x + subtreeSize.width / 2 - totalChildWidth / 2;
                const childY = y + nodeHeight + levelGap;

                for (let i = 0; i < item.children.length; i++) {
                  const child = item.children[i];
                  const childLayout = calculateTreeLayout(
                    child,
                    childX,
                    childY,
                  );
                  layoutNode.children.push(childLayout);
                  childX += childSizes[i].width + siblingGap;
                }
              }
            } else {
              // horizontal: ノードを左中央に配置
              layoutNode.x = x;
              layoutNode.y = y + subtreeSize.height / 2 - nodeHeight / 2;

              // 子ノードを配置
              if (item.children && item.children.length > 0) {
                const childSizes = item.children.map(calculateSubtreeSize);
                const totalChildHeight =
                  childSizes.reduce((sum, s) => sum + s.height, 0) +
                  siblingGap * (childSizes.length - 1);
                const childX = x + nodeWidth + levelGap;
                let childY = y + subtreeSize.height / 2 - totalChildHeight / 2;

                for (let i = 0; i < item.children.length; i++) {
                  const child = item.children[i];
                  const childLayout = calculateTreeLayout(
                    child,
                    childX,
                    childY,
                  );
                  layoutNode.children.push(childLayout);
                  childY += childSizes[i].height + siblingGap;
                }
              }
            }

            return layoutNode;
          }

          // 接続線を描画
          function drawConnector(
            parent: LayoutNode,
            child: LayoutNode,
            style: TreeConnectorStyle,
          ) {
            const lineColor = style.color ?? "333333";
            const lineWidth = style.width ?? 2;

            if (layout === "vertical") {
              // 親の下端中央から子の上端中央へ
              const parentCenterX = parent.x + parent.width / 2;
              const parentBottomY = parent.y + parent.height;
              const childCenterX = child.x + child.width / 2;
              const childTopY = child.y;
              const midY = (parentBottomY + childTopY) / 2;

              // 垂直線（親から中間点まで）
              slide.addShape(pptx.ShapeType.line, {
                x: pxToIn(parentCenterX),
                y: pxToIn(parentBottomY),
                w: 0,
                h: pxToIn(midY - parentBottomY),
                line: { color: lineColor, width: pxToPt(lineWidth) },
              });

              // 水平線（中間点で）
              const minX = Math.min(parentCenterX, childCenterX);
              const maxX = Math.max(parentCenterX, childCenterX);
              if (maxX > minX) {
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(minX),
                  y: pxToIn(midY),
                  w: pxToIn(maxX - minX),
                  h: 0,
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
              }

              // 垂直線（中間点から子まで）
              slide.addShape(pptx.ShapeType.line, {
                x: pxToIn(childCenterX),
                y: pxToIn(midY),
                w: 0,
                h: pxToIn(childTopY - midY),
                line: { color: lineColor, width: pxToPt(lineWidth) },
              });
            } else {
              // 親の右端中央から子の左端中央へ
              const parentRightX = parent.x + parent.width;
              const parentCenterY = parent.y + parent.height / 2;
              const childLeftX = child.x;
              const childCenterY = child.y + child.height / 2;
              const midX = (parentRightX + childLeftX) / 2;

              // 水平線（親から中間点まで）
              slide.addShape(pptx.ShapeType.line, {
                x: pxToIn(parentRightX),
                y: pxToIn(parentCenterY),
                w: pxToIn(midX - parentRightX),
                h: 0,
                line: { color: lineColor, width: pxToPt(lineWidth) },
              });

              // 垂直線（中間点で）
              const minY = Math.min(parentCenterY, childCenterY);
              const maxY = Math.max(parentCenterY, childCenterY);
              if (maxY > minY) {
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(midX),
                  y: pxToIn(minY),
                  w: 0,
                  h: pxToIn(maxY - minY),
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
              }

              // 水平線（中間点から子まで）
              slide.addShape(pptx.ShapeType.line, {
                x: pxToIn(midX),
                y: pxToIn(childCenterY),
                w: pxToIn(childLeftX - midX),
                h: 0,
                line: { color: lineColor, width: pxToPt(lineWidth) },
              });
            }
          }

          // ノードを描画
          function drawTreeNode(
            layoutNode: LayoutNode,
            shape: TreeNodeShape,
            defaultNodeColor: string,
          ) {
            const color = layoutNode.item.color ?? defaultNodeColor;
            const shapeType = (() => {
              switch (shape) {
                case "rect":
                  return pptx.ShapeType.rect;
                case "roundRect":
                  return pptx.ShapeType.roundRect;
                case "ellipse":
                  return pptx.ShapeType.ellipse;
              }
            })();

            // ノードの背景
            slide.addShape(shapeType, {
              x: pxToIn(layoutNode.x),
              y: pxToIn(layoutNode.y),
              w: pxToIn(layoutNode.width),
              h: pxToIn(layoutNode.height),
              fill: { color },
              line: { color: "333333", width: pxToPt(1) },
            });

            // ノードのラベル
            slide.addText(layoutNode.item.label, {
              x: pxToIn(layoutNode.x),
              y: pxToIn(layoutNode.y),
              w: pxToIn(layoutNode.width),
              h: pxToIn(layoutNode.height),
              fontSize: pxToPt(12),
              fontFace: "Noto Sans JP",
              color: "FFFFFF",
              align: "center",
              valign: "middle",
            });
          }

          // すべての接続線を再帰的に描画
          function drawAllConnectors(layoutNode: LayoutNode) {
            for (const child of layoutNode.children) {
              drawConnector(layoutNode, child, connectorStyle);
              drawAllConnectors(child);
            }
          }

          // すべてのノードを再帰的に描画
          function drawAllNodes(layoutNode: LayoutNode) {
            drawTreeNode(layoutNode, nodeShape, defaultColor);
            for (const child of layoutNode.children) {
              drawAllNodes(child);
            }
          }

          // ツリーのサイズを計算
          const treeSize = calculateSubtreeSize(node.data);

          // 描画領域内の中央に配置
          const offsetX = node.x + (node.w - treeSize.width) / 2;
          const offsetY = node.y + (node.h - treeSize.height) / 2;

          // レイアウト計算
          const rootLayout = calculateTreeLayout(node.data, offsetX, offsetY);

          // 描画（接続線を先に、ノードを後に描画）
          drawAllConnectors(rootLayout);
          drawAllNodes(rootLayout);

          break;
        }

        case "flow": {
          const direction = node.direction ?? "horizontal";
          const nodeWidth = node.nodeWidth ?? 120;
          const nodeHeight = node.nodeHeight ?? 60;
          const nodeGap = node.nodeGap ?? 80;
          const connectorStyle = node.connectorStyle ?? {};
          const defaultColor = "1D4ED8";

          // ノードのレイアウト情報
          interface FlowNodeLayout {
            id: string;
            x: number;
            y: number;
            width: number;
            height: number;
            item: (typeof node.nodes)[0];
          }

          const layouts = new Map<string, FlowNodeLayout>();
          const nodeCount = node.nodes.length;

          // ノードのレイアウトを計算
          if (direction === "horizontal") {
            // 水平方向: 左から右へ均等配置
            const totalWidth =
              nodeCount * nodeWidth + (nodeCount - 1) * nodeGap;
            const startX = node.x + (node.w - totalWidth) / 2;
            const centerY = node.y + node.h / 2;

            node.nodes.forEach((item, index) => {
              const w = item.width ?? nodeWidth;
              const h = item.height ?? nodeHeight;
              layouts.set(item.id, {
                id: item.id,
                x: startX + index * (nodeWidth + nodeGap) + (nodeWidth - w) / 2,
                y: centerY - h / 2,
                width: w,
                height: h,
                item,
              });
            });
          } else {
            // 垂直方向: 上から下へ均等配置
            const totalHeight =
              nodeCount * nodeHeight + (nodeCount - 1) * nodeGap;
            const startY = node.y + (node.h - totalHeight) / 2;
            const centerX = node.x + node.w / 2;

            node.nodes.forEach((item, index) => {
              const w = item.width ?? nodeWidth;
              const h = item.height ?? nodeHeight;
              layouts.set(item.id, {
                id: item.id,
                x: centerX - w / 2,
                y:
                  startY +
                  index * (nodeHeight + nodeGap) +
                  (nodeHeight - h) / 2,
                width: w,
                height: h,
                item,
              });
            });
          }

          // 接続線を描画（ノードより先に描画して背面に配置）
          for (const conn of node.connections) {
            const fromLayout = layouts.get(conn.from);
            const toLayout = layouts.get(conn.to);

            if (!fromLayout || !toLayout) continue;

            const lineColor = conn.color ?? connectorStyle.color ?? "333333";
            const lineWidth = connectorStyle.width ?? 2;
            const arrowType = connectorStyle.arrowType ?? "triangle";

            let startX: number, startY: number, endX: number, endY: number;

            if (direction === "horizontal") {
              // 水平: 右端から左端へ
              startX = fromLayout.x + fromLayout.width;
              startY = fromLayout.y + fromLayout.height / 2;
              endX = toLayout.x;
              endY = toLayout.y + toLayout.height / 2;
            } else {
              // 垂直: 下端から上端へ
              startX = fromLayout.x + fromLayout.width / 2;
              startY = fromLayout.y + fromLayout.height;
              endX = toLayout.x + toLayout.width / 2;
              endY = toLayout.y;
            }

            // 直線接続（シンプルなケース）
            const isHorizontalLine = Math.abs(startY - endY) < 1;
            const isVerticalLine = Math.abs(startX - endX) < 1;

            if (isHorizontalLine || isVerticalLine) {
              // 直線で描画
              slide.addShape(pptx.ShapeType.line, {
                x: pxToIn(Math.min(startX, endX)),
                y: pxToIn(Math.min(startY, endY)),
                w: pxToIn(Math.abs(endX - startX)),
                h: pxToIn(Math.abs(endY - startY)),
                line: {
                  color: lineColor,
                  width: pxToPt(lineWidth),
                  endArrowType: arrowType,
                },
              });
            } else {
              // L字型接続
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;

              if (direction === "horizontal") {
                // 水平→垂直→水平
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(startX),
                  y: pxToIn(startY),
                  w: pxToIn(midX - startX),
                  h: 0,
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(midX),
                  y: pxToIn(Math.min(startY, endY)),
                  w: 0,
                  h: pxToIn(Math.abs(endY - startY)),
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(midX),
                  y: pxToIn(endY),
                  w: pxToIn(endX - midX),
                  h: 0,
                  line: {
                    color: lineColor,
                    width: pxToPt(lineWidth),
                    endArrowType: arrowType,
                  },
                });
              } else {
                // 垂直→水平→垂直
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(startX),
                  y: pxToIn(startY),
                  w: 0,
                  h: pxToIn(midY - startY),
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(Math.min(startX, endX)),
                  y: pxToIn(midY),
                  w: pxToIn(Math.abs(endX - startX)),
                  h: 0,
                  line: { color: lineColor, width: pxToPt(lineWidth) },
                });
                slide.addShape(pptx.ShapeType.line, {
                  x: pxToIn(endX),
                  y: pxToIn(midY),
                  w: 0,
                  h: pxToIn(endY - midY),
                  line: {
                    color: lineColor,
                    width: pxToPt(lineWidth),
                    endArrowType: arrowType,
                  },
                });
              }
            }

            // ラベルを描画
            if (conn.label) {
              const labelX = (startX + endX) / 2;
              const labelY = (startY + endY) / 2;

              slide.addText(conn.label, {
                x: pxToIn(labelX - 30),
                y: pxToIn(labelY - 10),
                w: pxToIn(60),
                h: pxToIn(20),
                fontSize: pxToPt(10),
                fontFace: "Noto Sans JP",
                color: "64748B",
                align: "center",
                valign: "middle",
              });
            }
          }

          // ノードを描画
          for (const item of node.nodes) {
            const layout = layouts.get(item.id);
            if (!layout) continue;

            const fillColor = item.color ?? defaultColor;
            const textColor = item.textColor ?? "FFFFFF";

            // 図形を描画
            slide.addText(item.text, {
              x: pxToIn(layout.x),
              y: pxToIn(layout.y),
              w: pxToIn(layout.width),
              h: pxToIn(layout.height),
              shape: item.shape,
              fill: { color: fillColor },
              line: { color: "333333", width: pxToPt(1) },
              fontSize: pxToPt(14),
              fontFace: "Noto Sans JP",
              color: textColor,
              align: "center",
              valign: "middle",
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
