/**
 * POC: PositionedNode → pptx-glimpse Slide モデル変換
 *
 * pom の PositionedNode ツリーを pptx-glimpse の Slide モデルに変換し、
 * renderSlideToSvg で直接 SVG を生成するためのマッピング層。
 */
import type {
  Slide,
  SlideElement,
  ShapeElement,
  ImageElement,
  ConnectorElement,
  TableElement,
  ChartElement,
  Transform,
  Fill,
  SolidFill,
  Outline,
  DashStyle,
  TextBody,
  BodyProperties,
  Paragraph,
  ParagraphProperties,
  RunProperties,
  BulletType,
  SlideSize,
  Emu,
  ResolvedColor,
  TableRow,
  TableColumn,
  TableCell,
  ArrowType,
} from "pptx-glimpse/model";
import { asEmu, asHundredthPt } from "pptx-glimpse/model";
import type { PositionedNode, Underline, LineArrow } from "../types.ts";
import {
  resolveColumnWidths,
  resolveRowHeights,
} from "../shared/tableUtils.ts";
import { pxToEmu, pxToPt } from "./units.ts";

// ===== Helper: content area (padding を考慮) =====
type Padding =
  | number
  | { top?: number; right?: number; bottom?: number; left?: number };

function getContentArea(node: {
  x: number;
  y: number;
  w: number;
  h: number;
  padding?: Padding;
}): { x: number; y: number; w: number; h: number } {
  if (node.padding === undefined) {
    return { x: node.x, y: node.y, w: node.w, h: node.h };
  }
  let top: number, right: number, bottom: number, left: number;
  if (typeof node.padding === "number") {
    top = right = bottom = left = node.padding;
  } else {
    top = node.padding.top ?? 0;
    right = node.padding.right ?? 0;
    bottom = node.padding.bottom ?? 0;
    left = node.padding.left ?? 0;
  }
  return {
    x: node.x + left,
    y: node.y + top,
    w: Math.max(0, node.w - left - right),
    h: Math.max(0, node.h - top - bottom),
  };
}

// ===== Helper: color conversion =====
// pptx-glimpse の ResolvedColor.hex は "#RRGGBB" 形式を期待する
function colorToResolved(hex: string | undefined, alpha = 1): ResolvedColor {
  if (!hex) return { hex: "#000000", alpha };
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  return { hex: normalized, alpha };
}

function makeSolidFill(
  color: string | undefined,
  opacity?: number,
): SolidFill | null {
  if (!color) return null;
  const alpha = opacity !== undefined ? opacity : 1;
  return { type: "solid", color: colorToResolved(color, alpha) };
}

// ===== Helper: Transform =====
function makeTransform(x: number, y: number, w: number, h: number): Transform {
  return {
    offsetX: pxToEmu(x),
    offsetY: pxToEmu(y),
    extentWidth: pxToEmu(w),
    extentHeight: pxToEmu(h),
    rotation: 0,
    flipH: false,
    flipV: false,
  };
}

// ===== Helper: default RunProperties =====
function makeDefaultRunProperties(overrides?: {
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: Underline;
  strike?: boolean;
  color?: string;
}): RunProperties {
  return {
    fontSize: overrides?.fontSize ? pxToPt(overrides.fontSize) : null,
    fontFamily: overrides?.fontFamily ?? null,
    fontFamilyEa: null,
    fontFamilyCs: null,
    bold: overrides?.bold ?? false,
    italic: overrides?.italic ?? false,
    underline: resolveUnderline(overrides?.underline),
    strikethrough: overrides?.strike ?? false,
    color: overrides?.color ? colorToResolved(overrides.color) : null,
    baseline: 0,
    hyperlink: null,
    outline: null,
  };
}

function resolveUnderline(underline: Underline | undefined): boolean {
  if (underline === undefined || underline === false) return false;
  if (underline === true) return true;
  return underline.style !== "none";
}

// ===== Helper: default ParagraphProperties =====
function makeDefaultParagraphProperties(overrides?: {
  alignment?: "l" | "ctr" | "r" | "just";
  lineSpacing?: number | null;
  bullet?: BulletType | null;
}): ParagraphProperties {
  return {
    alignment: overrides?.alignment ?? "l",
    lineSpacing: overrides?.lineSpacing ?? null,
    spaceBefore: { type: "pts", value: asHundredthPt(0) },
    spaceAfter: { type: "pts", value: asHundredthPt(0) },
    level: 0,
    bullet: overrides?.bullet ?? null,
    bulletFont: null,
    bulletColor: null,
    bulletSizePct: null,
    marginLeft: asEmu(0),
    indent: asEmu(0),
    tabStops: [],
  };
}

// ===== Helper: default BodyProperties =====
function makeDefaultBodyProperties(overrides?: {
  anchor?: "t" | "ctr" | "b";
  marginLeft?: Emu;
  marginRight?: Emu;
  marginTop?: Emu;
  marginBottom?: Emu;
}): BodyProperties {
  return {
    anchor: overrides?.anchor ?? "t",
    marginLeft: overrides?.marginLeft ?? asEmu(0),
    marginRight: overrides?.marginRight ?? asEmu(0),
    marginTop: overrides?.marginTop ?? asEmu(0),
    marginBottom: overrides?.marginBottom ?? asEmu(0),
    wrap: "square",
    autoFit: "noAutofit",
    fontScale: 1,
    lnSpcReduction: 0,
    numCol: 1,
    vert: "horz",
  };
}

// ===== Helper: text alignment =====
function textAlignToAlignment(
  align?: "left" | "center" | "right",
): "l" | "ctr" | "r" {
  switch (align) {
    case "center":
      return "ctr";
    case "right":
      return "r";
    default:
      return "l";
  }
}

// ===== Helper: lineSpacing conversion =====
// pom は lineSpacingMultiple (例: 1.3) を使用
// pptx-glimpse の lineSpacing は 1/1000 パーセント単位 (spcPct)
// 1.3 → 130000 (130%)
function lineSpacingMultipleToValue(multiple: number): number {
  return Math.round(multiple * 100000);
}

// ===== Helper: Outline (border) conversion =====
function makeBorderOutline(border?: {
  color?: string;
  width?: number;
  dashType?: string;
}): Outline | null {
  if (
    !border ||
    (border.color === undefined &&
      border.width === undefined &&
      border.dashType === undefined)
  ) {
    return null;
  }
  return {
    width: border.width !== undefined ? pxToEmu(border.width) : asEmu(12700), // 1pt default
    fill: border.color
      ? { type: "solid", color: colorToResolved(border.color) }
      : null,
    dashStyle: (border.dashType as DashStyle) ?? "solid",
    headEnd: null,
    tailEnd: null,
  };
}

// ===== Helper: borderRadius → roundRect geometry =====
function makeGeometry(borderRadius?: number): {
  type: "preset";
  preset: string;
  adjustValues: Record<string, number>;
} {
  if (borderRadius && borderRadius > 0) {
    return {
      type: "preset",
      preset: "roundRect",
      adjustValues: { adj: borderRadius * 100 },
    };
  }
  return { type: "preset", preset: "rect", adjustValues: {} };
}

// ===== Helper: zIndex sort =====
function sortByZIndex<T extends { zIndex?: number }>(children: T[]): T[] {
  if (children.every((c) => c.zIndex === undefined)) return children;
  return [...children].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
}

// ===== Main: PositionedNode → Slide =====

export function positionedNodeToSlide(
  page: PositionedNode,
  slideSize: { w: number; h: number },
): { slide: Slide; slideSize: SlideSize } {
  const elements: SlideElement[] = [];

  // スライドの背景
  let background: Slide["background"] = null;
  if (page.type !== "line" && page.backgroundColor) {
    const opacity =
      "opacity" in page && page.opacity !== undefined ? page.opacity : 1;
    background = {
      fill: makeSolidFill(page.backgroundColor, opacity),
    };
  }

  // ルートノードを再帰的に処理
  collectElements(page, elements, true);

  return {
    slide: {
      slideNumber: 1,
      background,
      elements,
      showMasterSp: false,
    },
    slideSize: {
      width: pxToEmu(slideSize.w),
      height: pxToEmu(slideSize.h),
    },
  };
}

// ===== PositionedNode ツリー → flat SlideElement[] =====

function collectElements(
  node: PositionedNode,
  elements: SlideElement[],
  isRoot = false,
): void {
  // コンテナ / リーフを判定してそれぞれ処理
  switch (node.type) {
    case "box":
    case "vstack":
    case "hstack":
    case "layer":
      convertContainer(node, elements, isRoot);
      break;
    case "text":
      elements.push(convertText(node));
      break;
    case "ul":
      elements.push(convertUl(node));
      break;
    case "ol":
      elements.push(convertOl(node));
      break;
    case "image":
      elements.push(convertImage(node));
      break;
    case "shape":
      elements.push(convertShape(node));
      break;
    case "table":
      elements.push(convertTable(node));
      break;
    case "chart":
      elements.push(convertChart(node));
      break;
    case "line":
      elements.push(convertLine(node));
      break;
    case "icon":
      convertIcon(node, elements);
      break;
    default:
      // 複合ノード (timeline, matrix, tree, flow, processArrow, pyramid)
      // これらは PositionedNode としてそのまま残る leaf ノード
      // POC では未対応 - 背景のみ描画し、コンソールに警告を出力
      console.warn(
        `[renderGlimpse] 未対応ノードタイプ: ${node.type} - 背景のみ描画`,
      );
      convertContainerBackground(node, elements);
      break;
  }
}

// ===== Container nodes =====

function convertContainer(
  node: PositionedNode,
  elements: SlideElement[],
  isRoot: boolean,
): void {
  // ルートノードの背景は Slide.background で処理済みなのでスキップ
  // ただし opacity がある場合は通常描画
  const hasOpacity = "opacity" in node && node.opacity !== undefined && !isRoot;
  if (
    !isRoot ||
    hasOpacity ||
    (isRoot && "opacity" in node && node.opacity !== undefined)
  ) {
    convertContainerBackground(node, elements);
  } else if (isRoot) {
    // ルートでも border だけは描画
    const border = node.border;
    if (
      border &&
      (border.color !== undefined ||
        border.width !== undefined ||
        border.dashType !== undefined)
    ) {
      const borderOutline = makeBorderOutline(border);
      if (borderOutline) {
        elements.push({
          type: "shape",
          transform: makeTransform(node.x, node.y, node.w, node.h),
          geometry: makeGeometry(node.borderRadius),
          fill: { type: "none" },
          outline: borderOutline,
          textBody: null,
          effects: null,
        });
      }
    }
  }

  // 子要素を処理
  if (node.type === "box") {
    collectElements(node.children, elements);
  } else if (
    node.type === "vstack" ||
    node.type === "hstack" ||
    node.type === "layer"
  ) {
    const containerNode = node;
    for (const child of sortByZIndex(containerNode.children)) {
      collectElements(child, elements);
    }
  }
}

function convertContainerBackground(
  node: PositionedNode,
  elements: SlideElement[],
): void {
  if (node.type === "line") return;

  const { backgroundColor, border, borderRadius } = node;
  const opacity =
    "opacity" in node ? (node as { opacity?: number }).opacity : undefined;
  const hasBg = Boolean(backgroundColor);
  const hasBorder = Boolean(
    border &&
      (border.color !== undefined ||
        border.width !== undefined ||
        border.dashType !== undefined),
  );

  if (!hasBg && !hasBorder) return;

  const fill: Fill = hasBg
    ? (makeSolidFill(backgroundColor, opacity) as Fill)
    : { type: "none" };
  const outline = hasBorder ? makeBorderOutline(border) : null;

  elements.push({
    type: "shape",
    transform: makeTransform(node.x, node.y, node.w, node.h),
    geometry: makeGeometry(borderRadius),
    fill,
    outline,
    textBody: null,
    effects: null,
  });
}

// ===== Text node =====

function convertText(
  node: Extract<PositionedNode, { type: "text" }>,
): ShapeElement {
  const content = getContentArea(node);
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;

  const textBody: TextBody = {
    paragraphs: [
      {
        runs: [
          {
            text: node.text,
            properties: makeDefaultRunProperties({
              fontSize: fontSizePx,
              fontFamily,
              bold: node.bold,
              italic: node.italic,
              underline: node.underline,
              strike: node.strike,
              color: node.color,
            }),
          },
        ],
        properties: makeDefaultParagraphProperties({
          alignment: textAlignToAlignment(node.textAlign),
          lineSpacing: lineSpacingMultipleToValue(lineHeight),
        }),
      },
    ],
    bodyProperties: makeDefaultBodyProperties({ anchor: "t" }),
  };

  return {
    type: "shape",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    geometry: { type: "preset", preset: "rect", adjustValues: {} },
    fill: null,
    outline: null,
    textBody,
    effects: null,
  };
}

// ===== UL node =====

function convertUl(
  node: Extract<PositionedNode, { type: "ul" }>,
): ShapeElement {
  const content = getContentArea(node);
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;

  const paragraphs: Paragraph[] = node.items.map((li) => {
    const itemFontSize = li.fontSize ?? fontSizePx;
    const itemFontFamily = li.fontFamily ?? fontFamily;
    return {
      runs: [
        {
          text: li.text,
          properties: makeDefaultRunProperties({
            fontSize: itemFontSize,
            fontFamily: itemFontFamily,
            bold: li.bold ?? node.bold,
            italic: li.italic ?? node.italic,
            underline: li.underline ?? node.underline,
            strike: li.strike ?? node.strike,
            color: li.color ?? node.color,
          }),
        },
      ],
      properties: makeDefaultParagraphProperties({
        alignment: textAlignToAlignment(node.textAlign),
        lineSpacing: lineSpacingMultipleToValue(lineHeight),
        bullet: { type: "char", char: "•" },
      }),
    };
  });

  return {
    type: "shape",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    geometry: { type: "preset", preset: "rect", adjustValues: {} },
    fill: null,
    outline: null,
    textBody: {
      paragraphs,
      bodyProperties: makeDefaultBodyProperties({ anchor: "t" }),
    },
    effects: null,
  };
}

// ===== OL node =====

function convertOl(
  node: Extract<PositionedNode, { type: "ol" }>,
): ShapeElement {
  const content = getContentArea(node);
  const fontSizePx = node.fontSize ?? 24;
  const fontFamily = node.fontFamily ?? "Noto Sans JP";
  const lineHeight = node.lineHeight ?? 1.3;

  const paragraphs: Paragraph[] = node.items.map((li) => {
    const itemFontSize = li.fontSize ?? fontSizePx;
    const itemFontFamily = li.fontFamily ?? fontFamily;
    return {
      runs: [
        {
          text: li.text,
          properties: makeDefaultRunProperties({
            fontSize: itemFontSize,
            fontFamily: itemFontFamily,
            bold: li.bold ?? node.bold,
            italic: li.italic ?? node.italic,
            underline: li.underline ?? node.underline,
            strike: li.strike ?? node.strike,
            color: li.color ?? node.color,
          }),
        },
      ],
      properties: makeDefaultParagraphProperties({
        alignment: textAlignToAlignment(node.textAlign),
        lineSpacing: lineSpacingMultipleToValue(lineHeight),
        bullet: {
          type: "autoNum",
          scheme:
            (node.numberType as
              | "arabicPeriod"
              | "arabicParenR"
              | "romanUcPeriod"
              | "romanLcPeriod"
              | "alphaUcPeriod"
              | "alphaLcPeriod"
              | "alphaLcParenR"
              | "alphaUcParenR"
              | "arabicPlain") ?? "arabicPeriod",
          startAt: node.numberStartAt ?? 1,
        },
      }),
    };
  });

  return {
    type: "shape",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    geometry: { type: "preset", preset: "rect", adjustValues: {} },
    fill: null,
    outline: null,
    textBody: {
      paragraphs,
      bodyProperties: makeDefaultBodyProperties({ anchor: "t" }),
    },
    effects: null,
  };
}

// ===== Image node =====

function convertImage(
  node: Extract<PositionedNode, { type: "image" }>,
): ImageElement {
  const content = getContentArea(node);
  return {
    type: "image",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    imageData: node.imageData ?? "",
    mimeType: guessMimeType(node.src),
    effects: null,
    blipEffects: null,
    srcRect: null,
    stretch: null,
    tile: null,
  };
}

function guessMimeType(src: string): string {
  if (src.startsWith("data:")) {
    const match = src.match(/^data:([^;,]+)/);
    return match?.[1] ?? "image/png";
  }
  if (src.endsWith(".jpg") || src.endsWith(".jpeg")) return "image/jpeg";
  if (src.endsWith(".gif")) return "image/gif";
  if (src.endsWith(".svg")) return "image/svg+xml";
  return "image/png";
}

// ===== Shape node =====

function convertShape(
  node: Extract<PositionedNode, { type: "shape" }>,
): ShapeElement {
  const content = getContentArea(node);
  const fill: Fill = node.fill?.color
    ? (makeSolidFill(
        node.fill.color,
        node.fill.transparency !== undefined
          ? 1 - node.fill.transparency / 100
          : 1,
      ) as Fill)
    : { type: "none" };
  const outline = node.line ? makeBorderOutline(node.line) : null;

  let textBody: TextBody | null = null;
  if (node.text) {
    const fontSizePx = node.fontSize ?? 24;
    const fontFamily = node.fontFamily ?? "Noto Sans JP";
    const lineHeight = node.lineHeight ?? 1.3;

    textBody = {
      paragraphs: [
        {
          runs: [
            {
              text: node.text,
              properties: makeDefaultRunProperties({
                fontSize: fontSizePx,
                fontFamily,
                bold: node.bold,
                italic: node.italic,
                underline: node.underline,
                strike: node.strike,
                color: node.color,
              }),
            },
          ],
          properties: makeDefaultParagraphProperties({
            alignment: textAlignToAlignment(node.textAlign ?? "center"),
            lineSpacing: lineSpacingMultipleToValue(lineHeight),
          }),
        },
      ],
      bodyProperties: makeDefaultBodyProperties({ anchor: "ctr" }),
    };
  }

  return {
    type: "shape",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    geometry: { type: "preset", preset: node.shapeType, adjustValues: {} },
    fill,
    outline,
    textBody,
    effects: null,
  };
}

// ===== Table node =====

function convertTable(
  node: Extract<PositionedNode, { type: "table" }>,
): TableElement {
  const content = getContentArea(node);
  const colWidths = resolveColumnWidths(node, content.w);
  const rowHeights = resolveRowHeights(node);

  const columns: TableColumn[] = colWidths.map((w) => ({
    width: pxToEmu(w),
  }));

  const rows: TableRow[] = node.rows.map((row, rowIdx) => ({
    height: pxToEmu(rowHeights[rowIdx] ?? 30),
    cells: row.cells.map((cell) => {
      const cellTextBody: TextBody | null = cell.text
        ? {
            paragraphs: [
              {
                runs: [
                  {
                    text: cell.text,
                    properties: makeDefaultRunProperties({
                      fontSize: cell.fontSize ?? 18,
                      bold: cell.bold,
                      italic: cell.italic,
                      underline: cell.underline,
                      strike: cell.strike,
                      color: cell.color,
                    }),
                  },
                ],
                properties: makeDefaultParagraphProperties({
                  alignment: textAlignToAlignment(cell.textAlign),
                }),
              },
            ],
            bodyProperties: makeDefaultBodyProperties({ anchor: "t" }),
          }
        : null;

      const cellFill = cell.backgroundColor
        ? makeSolidFill(cell.backgroundColor)
        : null;

      const tc: TableCell = {
        textBody: cellTextBody,
        fill: cellFill,
        borders: null,
        gridSpan: cell.colspan ?? 1,
        rowSpan: cell.rowspan ?? 1,
        hMerge: false,
        vMerge: false,
      };
      return tc;
    }),
  }));

  return {
    type: "table",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    table: { rows, columns },
  };
}

// ===== Chart node =====

function convertChart(
  node: Extract<PositionedNode, { type: "chart" }>,
): ChartElement {
  const content = getContentArea(node);
  const defaultColors = [
    "4472C4",
    "ED7D31",
    "A5A5A5",
    "FFC000",
    "5B9BD5",
    "70AD47",
  ];

  return {
    type: "chart",
    transform: makeTransform(content.x, content.y, content.w, content.h),
    chart: {
      chartType: node.chartType,
      title: node.showTitle && node.title ? node.title : null,
      series: node.data.map((d, i) => ({
        name: d.name ?? null,
        values: d.values,
        color: colorToResolved(
          node.chartColors?.[i] ?? defaultColors[i % defaultColors.length],
        ),
      })),
      categories: node.data[0]?.labels ?? [],
      barDirection: node.chartType === "bar" ? ("col" as const) : undefined,
      radarStyle: node.radarStyle,
      legend: node.showLegend ? { position: "b" } : null,
    },
  };
}

// ===== Line node =====

function convertLine(
  node: Extract<PositionedNode, { type: "line" }>,
): ConnectorElement {
  const { x1, y1, x2, y2, color, lineWidth, dashType, beginArrow, endArrow } =
    node;

  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const lineW = Math.abs(x2 - x1);
  const lineH = Math.abs(y2 - y1);
  const flipH = x2 < x1;
  const flipV = y2 < y1;

  const transform: Transform = {
    offsetX: pxToEmu(minX),
    offsetY: pxToEmu(minY),
    extentWidth: pxToEmu(lineW),
    extentHeight: pxToEmu(lineH),
    rotation: 0,
    flipH,
    flipV,
  };

  const resolveArrowType = (
    arrow: LineArrow | undefined,
  ): ArrowType | undefined => {
    if (arrow === undefined) return undefined;
    if (arrow === false) return "none";
    if (arrow === true) return "triangle";
    return (arrow.type as ArrowType) ?? "triangle";
  };

  const headEndType = resolveArrowType(beginArrow);
  const tailEndType = resolveArrowType(endArrow);

  const outline: Outline = {
    width: lineWidth !== undefined ? pxToEmu(lineWidth) : asEmu(12700),
    fill: { type: "solid", color: colorToResolved(color ?? "000000") },
    dashStyle: (dashType as DashStyle) ?? "solid",
    headEnd: headEndType
      ? { type: headEndType, width: "med", length: "med" }
      : null,
    tailEnd: tailEndType
      ? { type: tailEndType, width: "med", length: "med" }
      : null,
  };

  return {
    type: "connector",
    transform,
    geometry: { type: "preset", preset: "line", adjustValues: {} },
    outline,
    effects: null,
  };
}

// ===== Icon node =====

function convertIcon(
  node: Extract<PositionedNode, { type: "icon" }>,
  elements: SlideElement[],
): void {
  // variant 指定時は背景図形を描画
  if (node.variant) {
    const isCircle = node.variant.startsWith("circle");
    const isFilled = node.variant.endsWith("-filled");
    const bgColor = node.bgColor ?? "#E0E0E0";

    const bgX = node.bgX ?? node.x;
    const bgY = node.bgY ?? node.y;
    const bgW = node.bgW ?? node.w;
    const bgH = node.bgH ?? node.h;

    const shape: ShapeElement = {
      type: "shape",
      transform: makeTransform(bgX, bgY, bgW, bgH),
      geometry: {
        type: "preset",
        preset: isCircle ? "ellipse" : "roundRect",
        adjustValues: isCircle ? {} : { adj: 10000 },
      },
      fill: isFilled ? (makeSolidFill(bgColor) as Fill) : { type: "none" },
      outline: isFilled
        ? null
        : {
            width: pxToEmu(1.5),
            fill: {
              type: "solid",
              color: colorToResolved(bgColor),
            },
            dashStyle: "solid",
            headEnd: null,
            tailEnd: null,
          },
      textBody: null,
      effects: null,
    };
    elements.push(shape);
  }

  // アイコン画像
  const iconX = node.iconX ?? node.x;
  const iconY = node.iconY ?? node.y;
  const iconW = node.iconW ?? node.w;
  const iconH = node.iconH ?? node.h;

  elements.push({
    type: "image",
    transform: makeTransform(iconX, iconY, iconW, iconH),
    imageData: extractBase64(node.iconImageData),
    mimeType: "image/png",
    effects: null,
    blipEffects: null,
    srcRect: null,
    stretch: null,
    tile: null,
  });
}

function extractBase64(dataUri: string): string {
  // data:image/png;base64,xxxx → xxxx
  const idx = dataUri.indexOf(",");
  if (idx >= 0) return dataUri.slice(idx + 1);
  return dataUri;
}
