import type { PositionedNode } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToIn } from "../units.ts";
import { getContentArea } from "../utils/contentArea.ts";
import { convertShadow } from "../utils/visualStyle.ts";

type ImagePositionedNode = Extract<PositionedNode, { type: "image" }>;

export function renderImageNode(
  node: ImagePositionedNode,
  ctx: RenderContext,
): void {
  const content = getContentArea(node);
  const imageOptions: Record<string, unknown> = {
    x: pxToIn(content.x),
    y: pxToIn(content.y),
    w: pxToIn(content.w),
    h: pxToIn(content.h),
    shadow: convertShadow(node.shadow),
  };

  if (node.sizing) {
    imageOptions.sizing = {
      type: node.sizing.type,
      w: pxToIn(node.sizing.w ?? content.w),
      h: pxToIn(node.sizing.h ?? content.h),
      ...(node.sizing.x !== undefined && { x: pxToIn(node.sizing.x) }),
      ...(node.sizing.y !== undefined && { y: pxToIn(node.sizing.y) }),
    };
  }

  if (node.imageData) {
    // Base64 データがある場合は data プロパティを使用（リモート画像）
    ctx.slide.addImage({ ...imageOptions, data: node.imageData });
  } else {
    // ローカルパスの場合は path プロパティを使用
    ctx.slide.addImage({ ...imageOptions, path: node.src });
  }
}
