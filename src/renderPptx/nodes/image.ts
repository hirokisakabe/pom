import type { PositionedNode } from "../../types";
import type { RenderContext } from "../types";
import { pxToIn } from "../units";

type ImagePositionedNode = Extract<PositionedNode, { type: "image" }>;

export function renderImageNode(
  node: ImagePositionedNode,
  ctx: RenderContext,
): void {
  const imageOptions = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
  };

  if (node.imageData) {
    // Base64 データがある場合は data プロパティを使用（リモート画像）
    ctx.slide.addImage({ ...imageOptions, data: node.imageData });
  } else {
    // ローカルパスの場合は path プロパティを使用
    ctx.slide.addImage({ ...imageOptions, path: node.src });
  }
}
