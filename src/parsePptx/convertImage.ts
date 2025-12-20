import type { ImageNode } from "../types";
import type { Image } from "./types";
import { ptToPx } from "./units";

/**
 * pptxtojsonのImage要素をPOMのImageNodeに変換
 * pptxtojsonは画像をBase64形式で提供する
 * 位置情報は含まない（convertSlide で処理）
 */
export function convertImage(element: Image): ImageNode {
  return {
    type: "image",
    src: element.src,
    w: ptToPx(element.width),
    h: ptToPx(element.height),
  };
}
