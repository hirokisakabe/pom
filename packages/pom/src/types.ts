import { z } from "zod";
import { ICON_DATA } from "./icons/iconData.ts";
import { parseLinearGradient } from "./shared/gradient.ts";

// ===== Basic Types =====
const lengthSchema = z.union([
  z.number(),
  z.literal("max"),
  z.string().regex(/^\d+%$/),
]);

const paddingSchema = z.union([
  z.number(),
  z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
  }),
]);

const borderDashSchema = z.enum([
  "solid",
  "dash",
  "dashDot",
  "lgDash",
  "lgDashDot",
  "lgDashDotDot",
  "sysDash",
  "sysDot",
]);

const borderStyleSchema = z.object({
  color: z.string().optional(),
  width: z.number().optional(),
  dashType: borderDashSchema.optional(),
});

const fillStyleSchema = z.object({
  color: z.string().optional(),
  transparency: z.number().optional(),
});

export const shadowStyleSchema = z.object({
  type: z.enum(["outer", "inner"]).optional(),
  opacity: z.number().optional(),
  blur: z.number().optional(),
  angle: z.number().optional(),
  offset: z.number().optional(),
  color: z.string().optional(),
});

const bulletNumberTypeSchema = z.enum([
  "alphaLcParenBoth",
  "alphaLcParenR",
  "alphaLcPeriod",
  "alphaUcParenBoth",
  "alphaUcParenR",
  "alphaUcPeriod",
  "arabicParenBoth",
  "arabicParenR",
  "arabicPeriod",
  "arabicPlain",
  "romanLcParenBoth",
  "romanLcParenR",
  "romanLcPeriod",
  "romanUcParenBoth",
  "romanUcParenR",
  "romanUcPeriod",
]);

export const underlineStyleSchema = z.enum([
  "dash",
  "dashHeavy",
  "dashLong",
  "dashLongHeavy",
  "dbl",
  "dotDash",
  "dotDotDash",
  "dotted",
  "dottedHeavy",
  "heavy",
  "none",
  "sng",
  "wavy",
  "wavyDbl",
  "wavyHeavy",
]);

export const underlineSchema = z.union([
  z.boolean(),
  z.object({
    style: underlineStyleSchema.optional(),
    color: z.string().optional(),
  }),
]);

const alignItemsSchema = z.enum(["start", "center", "end", "stretch"]);

const alignSelfSchema = z.enum(["auto", "start", "center", "end", "stretch"]);

const positionTypeSchema = z.enum(["relative", "absolute"]);

const flexWrapSchema = z.enum(["nowrap", "wrap", "wrapReverse"]);

const justifyContentSchema = z.enum([
  "start",
  "center",
  "end",
  "spaceBetween",
  "spaceAround",
  "spaceEvenly",
]);

const shapeTypeSchema = z.enum([
  "accentBorderCallout1",
  "accentBorderCallout2",
  "accentBorderCallout3",
  "accentCallout1",
  "accentCallout2",
  "accentCallout3",
  "actionButtonBackPrevious",
  "actionButtonBeginning",
  "actionButtonBlank",
  "actionButtonDocument",
  "actionButtonEnd",
  "actionButtonForwardNext",
  "actionButtonHelp",
  "actionButtonHome",
  "actionButtonInformation",
  "actionButtonMovie",
  "actionButtonReturn",
  "actionButtonSound",
  "arc",
  "bentArrow",
  "bentUpArrow",
  "bevel",
  "blockArc",
  "borderCallout1",
  "borderCallout2",
  "borderCallout3",
  "bracePair",
  "bracketPair",
  "callout1",
  "callout2",
  "callout3",
  "can",
  "chartPlus",
  "chartStar",
  "chartX",
  "chevron",
  "chord",
  "circularArrow",
  "cloud",
  "cloudCallout",
  "corner",
  "cornerTabs",
  "cube",
  "curvedDownArrow",
  "curvedLeftArrow",
  "curvedRightArrow",
  "curvedUpArrow",
  "decagon",
  "diagStripe",
  "diamond",
  "dodecagon",
  "donut",
  "doubleWave",
  "downArrow",
  "downArrowCallout",
  "ellipse",
  "ellipseRibbon",
  "ellipseRibbon2",
  "flowChartAlternateProcess",
  "flowChartCollate",
  "flowChartConnector",
  "flowChartDecision",
  "flowChartDelay",
  "flowChartDisplay",
  "flowChartDocument",
  "flowChartExtract",
  "flowChartInputOutput",
  "flowChartInternalStorage",
  "flowChartMagneticDisk",
  "flowChartMagneticDrum",
  "flowChartMagneticTape",
  "flowChartManualInput",
  "flowChartManualOperation",
  "flowChartMerge",
  "flowChartMultidocument",
  "flowChartOfflineStorage",
  "flowChartOffpageConnector",
  "flowChartOnlineStorage",
  "flowChartOr",
  "flowChartPredefinedProcess",
  "flowChartPreparation",
  "flowChartProcess",
  "flowChartPunchedCard",
  "flowChartPunchedTape",
  "flowChartSort",
  "flowChartSummingJunction",
  "flowChartTerminator",
  "folderCorner",
  "frame",
  "funnel",
  "gear6",
  "gear9",
  "halfFrame",
  "heart",
  "heptagon",
  "hexagon",
  "homePlate",
  "horizontalScroll",
  "irregularSeal1",
  "irregularSeal2",
  "leftArrow",
  "leftArrowCallout",
  "leftBrace",
  "leftBracket",
  "leftCircularArrow",
  "leftRightArrow",
  "leftRightArrowCallout",
  "leftRightCircularArrow",
  "leftRightRibbon",
  "leftRightUpArrow",
  "leftUpArrow",
  "lightningBolt",
  "line",
  "lineInv",
  "mathDivide",
  "mathEqual",
  "mathMinus",
  "mathMultiply",
  "mathNotEqual",
  "mathPlus",
  "moon",
  "noSmoking",
  "nonIsoscelesTrapezoid",
  "notchedRightArrow",
  "octagon",
  "parallelogram",
  "pentagon",
  "pie",
  "pieWedge",
  "plaque",
  "plaqueTabs",
  "plus",
  "quadArrow",
  "quadArrowCallout",
  "rect",
  "ribbon",
  "ribbon2",
  "rightArrow",
  "rightArrowCallout",
  "rightBrace",
  "rightBracket",
  "round1Rect",
  "round2DiagRect",
  "round2SameRect",
  "roundRect",
  "rtTriangle",
  "smileyFace",
  "snip1Rect",
  "snip2DiagRect",
  "snip2SameRect",
  "snipRoundRect",
  "squareTabs",
  "star10",
  "star12",
  "star16",
  "star24",
  "star32",
  "star4",
  "star5",
  "star6",
  "star7",
  "star8",
  "stripedRightArrow",
  "sun",
  "swooshArrow",
  "teardrop",
  "trapezoid",
  "triangle",
  "upArrow",
  "upArrowCallout",
  "upDownArrow",
  "upDownArrowCallout",
  "uturnArrow",
  "verticalScroll",
  "wave",
  "wedgeEllipseCallout",
  "wedgeRectCallout",
  "wedgeRoundRectCallout",
]);

// ===== TypeScript Types (defined early for recursive references) =====
export type ShadowStyle = z.infer<typeof shadowStyleSchema>;
export type BorderStyle = z.infer<typeof borderStyleSchema>;
export type AlignItems = z.infer<typeof alignItemsSchema>;
export type FlexWrap = z.infer<typeof flexWrapSchema>;
export type JustifyContent = z.infer<typeof justifyContentSchema>;
export type UnderlineStyle = z.infer<typeof underlineStyleSchema>;
export type Underline = z.infer<typeof underlineSchema>;

// ===== Background Image =====
const backgroundImageSizingSchema = z.enum(["cover", "contain"]);

const backgroundImageSchema = z.object({
  src: z.string(),
  sizing: backgroundImageSizingSchema.optional(),
});

// ===== Background Gradient =====
const backgroundGradientSchema = z
  .string()
  .refine((value) => parseLinearGradient(value) !== null, {
    message:
      'Invalid gradient syntax. Expected: linear-gradient(<angle>deg, <color> <position>%, ...) e.g. "linear-gradient(135deg, #FF0000 0%, #0000FF 100%)"',
  });

// ===== Base Node =====
const basePOMNodeSchema = z.object({
  id: z.string().optional(),
  w: lengthSchema.optional(),
  h: lengthSchema.optional(),
  grow: z.number().positive().optional(),
  minW: z.number().optional(),
  maxW: z.number().optional(),
  minH: z.number().optional(),
  maxH: z.number().optional(),
  padding: paddingSchema.optional(),
  margin: paddingSchema.optional(),
  backgroundColor: z.string().optional(),
  backgroundGradient: backgroundGradientSchema.optional(),
  backgroundImage: backgroundImageSchema.optional(),
  border: borderStyleSchema.optional(),
  borderRadius: z.number().optional(),
  opacity: z.number().min(0).max(1).optional(),
  zIndex: z.number().optional(),
  position: positionTypeSchema.optional(),
  top: z.number().optional(),
  right: z.number().optional(),
  bottom: z.number().optional(),
  left: z.number().optional(),
  alignSelf: alignSelfSchema.optional(),
  shadow: shadowStyleSchema.optional(),
});

type BasePOMNode = z.infer<typeof basePOMNodeSchema>;

// ===== Inline text run (partial bold/italic within a text node) =====
const textRunSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: z.boolean().optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  color: z.string().optional(),
  href: z.string().optional(),
  fontFamily: z.string().optional(),
  letterSpacing: z.number().optional(),
});

// ===== Non-recursive Node Types =====
export const textNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  runs: z.array(textRunSchema).optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.number().optional(),
  letterSpacing: z.number().optional(),
});

export const liNodeSchema = z.object({
  text: z.string(),
  runs: z.array(textRunSchema).optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  color: z.string().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
});

export const ulNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("ul"),
  items: z.array(liNodeSchema),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.number().optional(),
});

export const olNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("ol"),
  items: z.array(liNodeSchema),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.number().optional(),
  numberType: bulletNumberTypeSchema.optional(),
  numberStartAt: z.number().optional(),
});

const imageSizingSchema = z.object({
  type: z.enum(["contain", "cover", "crop"]),
  w: z.number().optional(),
  h: z.number().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});

export const imageNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("image"),
  src: z.string(),
  sizing: imageSizingSchema.optional(),
});

const iconNameSchema = z.enum(Object.keys(ICON_DATA) as [string, ...string[]]);

const iconColorSchema = z
  .string()
  .regex(/^#?[0-9a-fA-F]{3,8}$/)
  .optional();

const iconVariantSchema = z
  .enum([
    "circle-filled",
    "circle-outlined",
    "square-filled",
    "square-outlined",
  ])
  .optional();

export const iconNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("icon"),
  name: iconNameSchema,
  size: z.number().positive().max(1024).optional(),
  color: iconColorSchema,
  variant: iconVariantSchema,
  bgColor: iconColorSchema,
});

export type IconNode = z.infer<typeof iconNodeSchema>;

export const svgNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("svg"),
  svgContent: z.string(),
  w: z.number().positive().max(1024).optional(),
  h: z.number().positive().max(1024).optional(),
  color: iconColorSchema,
});

export type SvgNode = z.infer<typeof svgNodeSchema>;

const tableCellSchema = z.object({
  text: z.string(),
  runs: z.array(textRunSchema).optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  backgroundColor: z.string().optional(),
  colspan: z.number().int().min(1).optional(),
  rowspan: z.number().int().min(1).optional(),
});

const tableRowSchema = z.object({
  cells: z.array(tableCellSchema),
  height: z.number().optional(),
});

const tableColumnSchema = z.object({
  width: z.number().optional(),
});

export const tableNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("table"),
  columns: z.array(tableColumnSchema),
  rows: z.array(tableRowSchema),
  defaultRowHeight: z.number().optional(),
  cellBorder: borderStyleSchema.optional(),
});

export const shapeNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("shape"),
  shapeType: shapeTypeSchema,
  text: z.string().optional(),
  fill: fillStyleSchema.optional(),
  line: borderStyleSchema.optional(),
  fontSize: z.number().optional(),
  color: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
  lineHeight: z.number().optional(),
});

const chartTypeSchema = z.enum([
  "bar",
  "line",
  "pie",
  "area",
  "doughnut",
  "radar",
]);

const radarStyleSchema = z.enum(["standard", "marker", "filled"]);

const chartDataSchema = z.object({
  name: z.string().optional(),
  labels: z.array(z.string()),
  values: z.array(z.number()),
});

export const chartNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("chart"),
  chartType: chartTypeSchema,
  data: z.array(chartDataSchema),
  showLegend: z.boolean().optional(),
  showTitle: z.boolean().optional(),
  title: z.string().optional(),
  chartColors: z.array(z.string()).optional(),
  // radar専用オプション
  radarStyle: radarStyleSchema.optional(),
});

export type TextNode = z.infer<typeof textNodeSchema>;
export type LiNode = z.infer<typeof liNodeSchema>;
export type UlNode = z.infer<typeof ulNodeSchema>;
export type OlNode = z.infer<typeof olNodeSchema>;
export type ImageNode = z.infer<typeof imageNodeSchema>;
export type TableNode = z.infer<typeof tableNodeSchema>;
export type ShapeNode = z.infer<typeof shapeNodeSchema>;
export type ChartNode = z.infer<typeof chartNodeSchema>;

// ===== Timeline Node =====
const timelineDirectionSchema = z.enum(["horizontal", "vertical"]);

const timelineItemSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const timelineNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("timeline"),
  direction: timelineDirectionSchema.optional(),
  items: z.array(timelineItemSchema),
});

export type TimelineNode = z.infer<typeof timelineNodeSchema>;

// ===== Matrix Node =====
const matrixAxisSchema = z.object({
  x: z.string(),
  y: z.string(),
});

const matrixQuadrantsSchema = z.object({
  topLeft: z.string(),
  topRight: z.string(),
  bottomLeft: z.string(),
  bottomRight: z.string(),
});

const matrixItemSchema = z.object({
  label: z.string(),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  color: z.string().optional(),
});

export const matrixNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("matrix"),
  axes: matrixAxisSchema,
  quadrants: matrixQuadrantsSchema.optional(),
  items: z.array(matrixItemSchema),
});

export type MatrixNode = z.infer<typeof matrixNodeSchema>;

// ===== Tree Node =====
const treeLayoutSchema = z.enum(["vertical", "horizontal"]);

export const treeNodeShapeSchema = z.enum(["rect", "roundRect", "ellipse"]);

export const treeConnectorStyleSchema = z.object({
  color: z.string().optional(),
  width: z.number().optional(),
});

export type TreeDataItem = {
  label: string;
  color?: string;
  children?: TreeDataItem[];
};

const treeDataItemSchema: z.ZodType<TreeDataItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    color: z.string().optional(),
    children: z.array(treeDataItemSchema).optional(),
  }),
);

export const treeNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("tree"),
  layout: treeLayoutSchema.optional(),
  nodeShape: treeNodeShapeSchema.optional(),
  data: treeDataItemSchema,
  connectorStyle: treeConnectorStyleSchema.optional(),
  nodeWidth: z.number().optional(),
  nodeHeight: z.number().optional(),
  levelGap: z.number().optional(),
  siblingGap: z.number().optional(),
});

export type TreeNodeShape = z.infer<typeof treeNodeShapeSchema>;
export type TreeConnectorStyle = z.infer<typeof treeConnectorStyleSchema>;
export type TreeNode = z.infer<typeof treeNodeSchema>;

// ===== ProcessArrow Node =====
const processArrowDirectionSchema = z.enum(["horizontal", "vertical"]);

const processArrowStepSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  textColor: z.string().optional(),
});

export const processArrowNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("processArrow"),
  direction: processArrowDirectionSchema.optional(),
  steps: z.array(processArrowStepSchema),
  itemWidth: z.number().optional(),
  itemHeight: z.number().optional(),
  gap: z.number().optional(),
  fontSize: z.number().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  fontFamily: z.string().optional(),
});

export type ProcessArrowNode = z.infer<typeof processArrowNodeSchema>;

// ===== Pyramid Node =====
const pyramidDirectionSchema = z.enum(["up", "down"]);

const pyramidLevelSchema = z.object({
  label: z.string(),
  color: z.string().optional(),
  textColor: z.string().optional(),
});

export const pyramidNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("pyramid"),
  direction: pyramidDirectionSchema.optional(),
  levels: z.array(pyramidLevelSchema).min(1),
  fontSize: z.number().optional(),
  bold: z.boolean().optional(),
  fontFamily: z.string().optional(),
});

export type PyramidNode = z.infer<typeof pyramidNodeSchema>;

// ===== Flow Node =====
const flowDirectionSchema = z.enum(["horizontal", "vertical"]);

const flowNodeShapeSchema = z.enum([
  "flowChartTerminator",
  "flowChartProcess",
  "flowChartDecision",
  "flowChartInputOutput",
  "flowChartDocument",
  "flowChartPredefinedProcess",
  "flowChartConnector",
  "flowChartPreparation",
  "flowChartManualInput",
  "flowChartManualOperation",
  "flowChartDelay",
  "flowChartMagneticDisk",
]);

const flowNodeItemSchema = z.object({
  id: z.string(),
  shape: flowNodeShapeSchema,
  text: z.string(),
  color: z.string().optional(),
  textColor: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

const flowConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string().optional(),
  color: z.string().optional(),
});

const flowConnectorStyleSchema = z.object({
  color: z.string().optional(),
  width: z.number().optional(),
  arrowType: z
    .enum(["none", "arrow", "diamond", "oval", "stealth", "triangle"])
    .optional(),
});

export const flowNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("flow"),
  direction: flowDirectionSchema.optional(),
  nodes: z.array(flowNodeItemSchema),
  connections: z.array(flowConnectionSchema),
  connectorStyle: flowConnectorStyleSchema.optional(),
  nodeWidth: z.number().optional(),
  nodeHeight: z.number().optional(),
  nodeGap: z.number().optional(),
});

export type FlowNode = z.infer<typeof flowNodeSchema>;

// ===== Line Node =====
const lineArrowTypeSchema = z.enum([
  "none",
  "arrow",
  "triangle",
  "diamond",
  "oval",
  "stealth",
]);

const lineArrowOptionsSchema = z.object({
  type: lineArrowTypeSchema.optional(),
});

export const lineArrowSchema = z.union([z.boolean(), lineArrowOptionsSchema]);

export const lineNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("line"),
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  color: z.string().optional(),
  lineWidth: z.number().optional(),
  dashType: borderDashSchema.optional(),
  beginArrow: lineArrowSchema.optional(),
  endArrow: lineArrowSchema.optional(),
});

export type LineArrow = z.infer<typeof lineArrowSchema>;
export type LineNode = z.infer<typeof lineNodeSchema>;

// ===== Arrow Node =====
export const arrowNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("arrow"),
  from: z.string(),
  to: z.string(),
  color: z.string().optional(),
  lineWidth: z.number().optional(),
  dashType: borderDashSchema.optional(),
  beginArrow: lineArrowSchema.optional(),
  endArrow: lineArrowSchema.optional(),
});

export type ArrowNode = z.infer<typeof arrowNodeSchema>;

// ===== Layer Node =====
// LayerChild, LayerNode types are defined below after POMNode

// ===== Recursive Types with Explicit Type Definitions =====

// Define the types explicitly to avoid 'any' inference
export type VStackNode = BasePOMNode & {
  type: "vstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  flexWrap?: FlexWrap;
};

export type HStackNode = BasePOMNode & {
  type: "hstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
  flexWrap?: FlexWrap;
};

// Layer の子要素は x, y を必須とする
type LayerChild = POMNode & {
  x: number;
  y: number;
};

export type LayerNode = BasePOMNode & {
  type: "layer";
  children: LayerChild[];
};

export type POMNode =
  | TextNode
  | UlNode
  | OlNode
  | ImageNode
  | TableNode
  | VStackNode
  | HStackNode
  | ShapeNode
  | ChartNode
  | TimelineNode
  | MatrixNode
  | TreeNode
  | FlowNode
  | ProcessArrowNode
  | PyramidNode
  | LineNode
  | ArrowNode
  | LayerNode
  | IconNode
  | SvgNode;

// Define schemas using passthrough to maintain type safety
export const vStackNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("vstack"),
  children: z.array(z.lazy(() => pomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
  flexWrap: flexWrapSchema.optional(),
});

export const hStackNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("hstack"),
  children: z.array(z.lazy(() => pomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
  flexWrap: flexWrapSchema.optional(),
});

const layerChildSchemaBase = z.lazy(() =>
  pomNodeSchema.and(
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ),
);

export const layerNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("layer"),
  children: z.array(layerChildSchemaBase),
});

const pomNodeSchema: z.ZodType<POMNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    textNodeSchema,
    ulNodeSchema,
    olNodeSchema,
    imageNodeSchema,
    tableNodeSchema,
    vStackNodeSchema,
    hStackNodeSchema,
    shapeNodeSchema,
    chartNodeSchema,
    timelineNodeSchema,
    matrixNodeSchema,
    treeNodeSchema,
    flowNodeSchema,
    processArrowNodeSchema,
    pyramidNodeSchema,
    lineNodeSchema,
    arrowNodeSchema,
    layerNodeSchema,
    iconNodeSchema,
    svgNodeSchema,
  ]),
);

// ===== Positioned Node Types =====
const positionedBaseSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

type PositionedBase = z.infer<typeof positionedBaseSchema>;

// Layer の子要素（位置情報付き）
export type PositionedLayerChild = PositionedNode & {
  x: number;
  y: number;
};

export type PositionedNode =
  | (TextNode & PositionedBase)
  | (UlNode & PositionedBase)
  | (OlNode & PositionedBase)
  | (ImageNode & PositionedBase & { imageData?: string })
  | (TableNode & PositionedBase)
  | (VStackNode & PositionedBase & { children: PositionedNode[] })
  | (HStackNode & PositionedBase & { children: PositionedNode[] })
  | (ShapeNode & PositionedBase)
  | (ChartNode & PositionedBase)
  | (TimelineNode & PositionedBase)
  | (MatrixNode & PositionedBase)
  | (TreeNode & PositionedBase)
  | (FlowNode & PositionedBase)
  | (ProcessArrowNode & PositionedBase)
  | (PyramidNode & PositionedBase)
  | (LineNode & PositionedBase)
  | (ArrowNode & PositionedBase)
  | (LayerNode & PositionedBase & { children: PositionedLayerChild[] })
  | (IconNode &
      PositionedBase & {
        iconImageData: string;
        bgX?: number;
        bgY?: number;
        bgW?: number;
        bgH?: number;
        iconX?: number;
        iconY?: number;
        iconW?: number;
        iconH?: number;
      })
  | (SvgNode & PositionedBase & { iconImageData: string });

const positionedLayerChildSchema: z.ZodType<PositionedLayerChild> = z.lazy(() =>
  positionedNodeSchema.and(
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ),
);

const positionedNodeSchema: z.ZodType<PositionedNode> = z.lazy(() =>
  z.union([
    textNodeSchema.merge(positionedBaseSchema),
    ulNodeSchema.merge(positionedBaseSchema),
    olNodeSchema.merge(positionedBaseSchema),
    imageNodeSchema.merge(positionedBaseSchema).extend({
      imageData: z.string().optional(),
    }),
    tableNodeSchema.merge(positionedBaseSchema),
    vStackNodeSchema.merge(positionedBaseSchema).extend({
      children: z.array(z.lazy(() => positionedNodeSchema)),
    }),
    hStackNodeSchema.merge(positionedBaseSchema).extend({
      children: z.array(z.lazy(() => positionedNodeSchema)),
    }),
    shapeNodeSchema.merge(positionedBaseSchema),
    chartNodeSchema.merge(positionedBaseSchema),
    timelineNodeSchema.merge(positionedBaseSchema),
    matrixNodeSchema.merge(positionedBaseSchema),
    treeNodeSchema.merge(positionedBaseSchema),
    flowNodeSchema.merge(positionedBaseSchema),
    processArrowNodeSchema.merge(positionedBaseSchema),
    pyramidNodeSchema.merge(positionedBaseSchema),
    lineNodeSchema.merge(positionedBaseSchema),
    arrowNodeSchema.merge(positionedBaseSchema),
    layerNodeSchema.merge(positionedBaseSchema).extend({
      children: z.array(positionedLayerChildSchema),
    }),
    iconNodeSchema.merge(positionedBaseSchema).extend({
      iconImageData: z.string(),
    }),
    svgNodeSchema.merge(positionedBaseSchema).extend({
      iconImageData: z.string(),
    }),
  ]),
);

// ===== Slide Master Options =====
const masterTextObjectSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  underline: underlineSchema.optional(),
  strike: z.boolean().optional(),
  highlight: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
});

const masterImageObjectSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

const masterRectObjectSchema = z.object({
  type: z.literal("rect"),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  fill: fillStyleSchema.optional(),
  border: borderStyleSchema.optional(),
});

const masterLineObjectSchema = z.object({
  type: z.literal("line"),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  line: borderStyleSchema.optional(),
});

export const masterObjectSchema = z.discriminatedUnion("type", [
  masterTextObjectSchema,
  masterImageObjectSchema,
  masterRectObjectSchema,
  masterLineObjectSchema,
]);

const slideNumberOptionsSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  fontSize: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
});

const slideMasterBackgroundSchema = z.union([
  z.object({ color: z.string() }),
  z.object({ path: z.string() }),
  z.object({ data: z.string() }),
  z.object({ image: z.string() }),
]);

const slideMasterMarginSchema = z.union([
  z.number(),
  z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
  }),
]);

export const slideMasterOptionsSchema = z.object({
  title: z.string().optional(),
  background: slideMasterBackgroundSchema.optional(),
  margin: slideMasterMarginSchema.optional(),
  objects: z.array(masterObjectSchema).optional(),
  slideNumber: slideNumberOptionsSchema.optional(),
});

export type MasterTextObject = z.infer<typeof masterTextObjectSchema>;
export type MasterImageObject = z.infer<typeof masterImageObjectSchema>;
export type MasterRectObject = z.infer<typeof masterRectObjectSchema>;
export type MasterLineObject = z.infer<typeof masterLineObjectSchema>;
export type MasterObject = z.infer<typeof masterObjectSchema>;
export type SlideNumberOptions = z.infer<typeof slideNumberOptionsSchema>;
export type SlideMasterBackground = z.infer<typeof slideMasterBackgroundSchema>;
export type SlideMasterMargin = z.infer<typeof slideMasterMarginSchema>;
export type SlideMasterOptions = z.infer<typeof slideMasterOptionsSchema>;
