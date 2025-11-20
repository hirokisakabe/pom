import PptxGenJS from "pptxgenjs";
import type { PositionedNode } from "../types";
import { resolveRowHeights } from "../table/utils";

export const PX_PER_IN = 96;
export const pxToIn = (px: number) => px / PX_PER_IN;
export const pxToPt = (px: number) => (px * 72) / PX_PER_IN;

type SlidePx = { w: number; h: number };

/**
 * PositionedNode ツリーを PptxGenJS スライドに変換する
 * @param pages PositionedNode ツリーの配列（各要素が1ページ）
 * @param slidePx スライド全体のサイズ（px）
 * @returns PptxGenJS インスタンス
 */
export function renderPptx(pages: PositionedNode[], slidePx: SlidePx) {
  const slideIn = { w: pxToIn(slidePx.w), h: pxToIn(slidePx.h) }; // layout(=px) → PptxGenJS(=inch) への最終変換

  // @ts-expect-error: PptxGenJS の型定義が不完全なため、一時的にエラーを無視
  const pptx = new PptxGenJS.default();

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
            border.dashType !== undefined)
      );

      if (!hasBackground && !hasBorder) {
        return;
      }

      const fill = hasBackground
        ? { color: backgroundColor! }
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
          const fontSizePx = node.fontPx ?? 24;
          const fontFamily = "Noto Sans JP";

          const opts = {
            x: pxToIn(node.x),
            y: pxToIn(node.y),
            w: pxToIn(node.w),
            h: pxToIn(node.h),
            fontSize: pxToPt(fontSizePx),
            fontFace: fontFamily,
            align: "left" as const,
            valign: "top" as const,
            margin: 0,
          };

          slide.addText(node.text ?? "", opts);
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
            })
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
            });
          } else {
            // テキストがない場合：addShapeを使用
            slide.addShape(node.shapeType, shapeOptions);
          }
          break;
        }
      }
    }

    renderNode(data);
  }

  return pptx;
}
