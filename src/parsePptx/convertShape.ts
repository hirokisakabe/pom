import type { ShapeNode, ShapeType } from "../types";
import type { Shape } from "./types";
import { ptToPx, normalizeColor } from "./units";
import { extractPlainText, extractStyles } from "./parseHtml";

/**
 * pptxtojsonのshapType から POMのShapeType へのマッピング
 * pptxtojsonのshapTypeはOpenXMLの図形名に近い形式
 */
const SHAPE_TYPE_MAP: Record<string, ShapeType> = {
  rect: "rect",
  rectangle: "rect",
  roundRect: "roundRect",
  roundRectangle: "roundRect",
  ellipse: "ellipse",
  oval: "ellipse",
  triangle: "triangle",
  rtTriangle: "rtTriangle",
  parallelogram: "parallelogram",
  trapezoid: "trapezoid",
  diamond: "diamond",
  pentagon: "pentagon",
  hexagon: "hexagon",
  heptagon: "heptagon",
  octagon: "octagon",
  decagon: "decagon",
  dodecagon: "dodecagon",
  star4: "star4",
  star5: "star5",
  star6: "star6",
  star7: "star7",
  star8: "star8",
  star10: "star10",
  star12: "star12",
  star16: "star16",
  star24: "star24",
  star32: "star32",
  plus: "plus",
  cross: "plus",
  arrow: "rightArrow",
  rightArrow: "rightArrow",
  leftArrow: "leftArrow",
  upArrow: "upArrow",
  downArrow: "downArrow",
  leftRightArrow: "leftRightArrow",
  upDownArrow: "upDownArrow",
  cloud: "cloud",
  cloudCallout: "cloudCallout",
  heart: "heart",
  lightningBolt: "lightningBolt",
  sun: "sun",
  moon: "moon",
  arc: "arc",
  donut: "donut",
  line: "line",
  chevron: "chevron",
  homePlate: "homePlate",
  can: "can",
  cube: "cube",
  bevel: "bevel",
  funnel: "funnel",
  wedgeRectCallout: "wedgeRectCallout",
  wedgeRoundRectCallout: "wedgeRoundRectCallout",
  wedgeEllipseCallout: "wedgeEllipseCallout",
  frame: "frame",
  plaque: "plaque",
  bracePair: "bracePair",
  bracketPair: "bracketPair",
  leftBrace: "leftBrace",
  rightBrace: "rightBrace",
  leftBracket: "leftBracket",
  rightBracket: "rightBracket",
  flowChartProcess: "flowChartProcess",
  flowChartDecision: "flowChartDecision",
  flowChartTerminator: "flowChartTerminator",
  flowChartDocument: "flowChartDocument",
  flowChartConnector: "flowChartConnector",
};

/**
 * pptxtojsonのshapTypeをPOMのShapeTypeに変換
 * マッピングに存在しない場合はデフォルトで "rect" を返す
 */
function mapShapeType(shapType: string): ShapeType {
  return SHAPE_TYPE_MAP[shapType] || "rect";
}

/**
 * pptxtojsonのShape要素をPOMのShapeNodeに変換
 * 位置情報は含まない（convertSlide で処理）
 */
export function convertShape(element: Shape): ShapeNode {
  const result: ShapeNode = {
    type: "shape",
    shapeType: mapShapeType(element.shapType),
  };

  // テキストがある場合
  if (element.content) {
    const text = extractPlainText(element.content);
    if (text) {
      result.text = text;

      const styles = extractStyles(element.content);
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
    }
  }

  // テキストなし Shape は w/h を指定（自動計算できないため）
  if (!result.text) {
    result.w = ptToPx(element.width);
    result.h = ptToPx(element.height);
  }

  // 塗りつぶし
  if (element.fill && element.fill.type === "color") {
    result.fill = {
      color: normalizeColor(element.fill.value),
    };
  }

  // 枠線
  if (element.borderColor && element.borderWidth) {
    result.line = {
      color: normalizeColor(element.borderColor),
      width: ptToPx(element.borderWidth),
    };
  }

  // 影
  if (element.shadow) {
    result.shadow = {
      type: "outer",
      blur: element.shadow.blur,
      offset: Math.sqrt(
        element.shadow.h * element.shadow.h +
          element.shadow.v * element.shadow.v,
      ),
      color: normalizeColor(element.shadow.color),
    };
  }

  return result;
}
