import type { TextNode } from "../types";
import type { Text } from "./types";
import { ptToPx, normalizeColor } from "./units";
import { extractPlainText, extractStyles } from "./parseHtml";

/**
 * pptxtojsonのText要素をPOMのTextNodeに変換
 */
export function convertText(element: Text): TextNode {
  const text = extractPlainText(element.content);
  const styles = extractStyles(element.content);

  const result: TextNode = {
    type: "text",
    text,
    w: ptToPx(element.width),
    h: ptToPx(element.height),
  };

  // スタイル情報を設定
  if (styles.fontSize !== undefined) {
    result.fontPx = ptToPx(styles.fontSize);
  }

  if (styles.color) {
    result.color = normalizeColor(styles.color);
  }

  if (styles.bold) {
    result.bold = true;
  }

  if (styles.textAlign) {
    result.alignText = styles.textAlign;
  }

  if (styles.fontFamily) {
    result.fontFamily = styles.fontFamily;
  }

  return result;
}
