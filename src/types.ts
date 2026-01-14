import type { Node as YogaNode } from "yoga-layout";
import { z } from "zod";

// ===== Basic Types =====
export const lengthSchema = z.union([
  z.number(),
  z.literal("max"),
  z.string().regex(/^\d+%$/),
]);

export const paddingSchema = z.union([
  z.number(),
  z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
  }),
]);

export const borderDashSchema = z.enum([
  "solid",
  "dash",
  "dashDot",
  "lgDash",
  "lgDashDot",
  "lgDashDotDot",
  "sysDash",
  "sysDot",
]);

export const borderStyleSchema = z.object({
  color: z.string().optional(),
  width: z.number().optional(),
  dashType: borderDashSchema.optional(),
});

export const fillStyleSchema = z.object({
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

export const bulletNumberTypeSchema = z.enum([
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

export const bulletOptionsSchema = z.object({
  type: z.enum(["bullet", "number"]).optional(),
  indent: z.number().optional(),
  numberType: bulletNumberTypeSchema.optional(),
  numberStartAt: z.number().optional(),
});

export const alignItemsSchema = z.enum(["start", "center", "end", "stretch"]);

export const justifyContentSchema = z.enum([
  "start",
  "center",
  "end",
  "spaceBetween",
  "spaceAround",
  "spaceEvenly",
]);

export const flexDirectionSchema = z.enum(["row", "column"]);

export const shapeTypeSchema = z.enum([
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
export type Length = z.infer<typeof lengthSchema>;
export type Padding = z.infer<typeof paddingSchema>;
export type BorderDash = z.infer<typeof borderDashSchema>;
export type BorderStyle = z.infer<typeof borderStyleSchema>;
export type FillStyle = z.infer<typeof fillStyleSchema>;
export type ShadowStyle = z.infer<typeof shadowStyleSchema>;
export type BulletNumberType = z.infer<typeof bulletNumberTypeSchema>;
export type BulletOptions = z.infer<typeof bulletOptionsSchema>;
export type AlignItems = z.infer<typeof alignItemsSchema>;
export type JustifyContent = z.infer<typeof justifyContentSchema>;
export type FlexDirection = z.infer<typeof flexDirectionSchema>;
export type ShapeType = z.infer<typeof shapeTypeSchema>;

// ===== Base Node =====
const basePOMNodeSchema = z.object({
  yogaNode: z.custom<YogaNode>().optional(),
  w: lengthSchema.optional(),
  h: lengthSchema.optional(),
  minW: z.number().optional(),
  maxW: z.number().optional(),
  minH: z.number().optional(),
  maxH: z.number().optional(),
  padding: paddingSchema.optional(),
  backgroundColor: z.string().optional(),
  border: borderStyleSchema.optional(),
  borderRadius: z.number().optional(),
});

type BasePOMNode = z.infer<typeof basePOMNodeSchema>;

// ===== Non-recursive Node Types =====
export const textNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  fontPx: z.number().optional(),
  color: z.string().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
  fontFamily: z.string().optional(),
  lineSpacingMultiple: z.number().optional(),
  bullet: z.union([z.boolean(), bulletOptionsSchema]).optional(),
});

export const imageNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("image"),
  src: z.string(),
});

export const tableCellSchema = z.object({
  text: z.string(),
  fontPx: z.number().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
  backgroundColor: z.string().optional(),
});

export const tableRowSchema = z.object({
  cells: z.array(tableCellSchema),
  height: z.number().optional(),
});

export const tableColumnSchema = z.object({
  width: z.number().optional(),
});

export const tableNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("table"),
  columns: z.array(tableColumnSchema),
  rows: z.array(tableRowSchema),
  defaultRowHeight: z.number().optional(),
});

export const shapeNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("shape"),
  shapeType: shapeTypeSchema,
  text: z.string().optional(),
  fill: fillStyleSchema.optional(),
  line: borderStyleSchema.optional(),
  shadow: shadowStyleSchema.optional(),
  fontPx: z.number().optional(),
  color: z.string().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
  bold: z.boolean().optional(),
});

export const chartTypeSchema = z.enum([
  "bar",
  "line",
  "pie",
  "area",
  "doughnut",
  "radar",
]);

export const radarStyleSchema = z.enum(["standard", "marker", "filled"]);

export const chartDataSchema = z.object({
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
export type ImageNode = z.infer<typeof imageNodeSchema>;
export type TableCell = z.infer<typeof tableCellSchema>;
export type TableRow = z.infer<typeof tableRowSchema>;
export type TableColumn = z.infer<typeof tableColumnSchema>;
export type TableNode = z.infer<typeof tableNodeSchema>;
export type ShapeNode = z.infer<typeof shapeNodeSchema>;
export type ChartType = z.infer<typeof chartTypeSchema>;
export type ChartData = z.infer<typeof chartDataSchema>;
export type ChartNode = z.infer<typeof chartNodeSchema>;
export type RadarStyle = z.infer<typeof radarStyleSchema>;

// ===== Timeline Node =====
export const timelineDirectionSchema = z.enum(["horizontal", "vertical"]);

export const timelineItemSchema = z.object({
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

export type TimelineDirection = z.infer<typeof timelineDirectionSchema>;
export type TimelineItem = z.infer<typeof timelineItemSchema>;
export type TimelineNode = z.infer<typeof timelineNodeSchema>;

// ===== Matrix Node =====
export const matrixAxisSchema = z.object({
  x: z.string(),
  y: z.string(),
});

export const matrixQuadrantsSchema = z.object({
  topLeft: z.string(),
  topRight: z.string(),
  bottomLeft: z.string(),
  bottomRight: z.string(),
});

export const matrixItemSchema = z.object({
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

export type MatrixAxis = z.infer<typeof matrixAxisSchema>;
export type MatrixQuadrants = z.infer<typeof matrixQuadrantsSchema>;
export type MatrixItem = z.infer<typeof matrixItemSchema>;
export type MatrixNode = z.infer<typeof matrixNodeSchema>;

// ===== Tree Node =====
export const treeLayoutSchema = z.enum(["vertical", "horizontal"]);

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

export const treeDataItemSchema: z.ZodType<TreeDataItem> = z.lazy(() =>
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

export type TreeLayout = z.infer<typeof treeLayoutSchema>;
export type TreeNodeShape = z.infer<typeof treeNodeShapeSchema>;
export type TreeConnectorStyle = z.infer<typeof treeConnectorStyleSchema>;
export type TreeNode = z.infer<typeof treeNodeSchema>;

// ===== Recursive Types with Explicit Type Definitions =====

// Define the types explicitly to avoid 'any' inference
export type BoxNode = BasePOMNode & {
  type: "box";
  children: POMNode;
};

export type VStackNode = BasePOMNode & {
  type: "vstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

export type HStackNode = BasePOMNode & {
  type: "hstack";
  children: POMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

export type POMNode =
  | TextNode
  | ImageNode
  | TableNode
  | BoxNode
  | VStackNode
  | HStackNode
  | ShapeNode
  | ChartNode
  | TimelineNode
  | MatrixNode
  | TreeNode;

// Define schemas using passthrough to maintain type safety
const boxNodeSchemaBase = basePOMNodeSchema.extend({
  type: z.literal("box"),
  children: z.lazy(() => pomNodeSchema),
});

const vStackNodeSchemaBase = basePOMNodeSchema.extend({
  type: z.literal("vstack"),
  children: z.array(z.lazy(() => pomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
});

const hStackNodeSchemaBase = basePOMNodeSchema.extend({
  type: z.literal("hstack"),
  children: z.array(z.lazy(() => pomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
});

// Export with proper type annotations using z.ZodType
export const boxNodeSchema: z.ZodType<BoxNode> =
  boxNodeSchemaBase as z.ZodType<BoxNode>;
export const vStackNodeSchema: z.ZodType<VStackNode> =
  vStackNodeSchemaBase as z.ZodType<VStackNode>;
export const hStackNodeSchema: z.ZodType<HStackNode> =
  hStackNodeSchemaBase as z.ZodType<HStackNode>;

export const pomNodeSchema: z.ZodType<POMNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    textNodeSchema,
    imageNodeSchema,
    tableNodeSchema,
    boxNodeSchemaBase,
    vStackNodeSchemaBase,
    hStackNodeSchemaBase,
    shapeNodeSchema,
    chartNodeSchema,
    timelineNodeSchema,
    matrixNodeSchema,
    treeNodeSchema,
  ]),
) as z.ZodType<POMNode>;

// ===== Positioned Node Types =====
const positionedBaseSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

type PositionedBase = z.infer<typeof positionedBaseSchema>;

export type PositionedNode =
  | (TextNode & PositionedBase)
  | (ImageNode & PositionedBase & { imageData?: string })
  | (TableNode & PositionedBase)
  | (BoxNode & PositionedBase & { children: PositionedNode })
  | (VStackNode & PositionedBase & { children: PositionedNode[] })
  | (HStackNode & PositionedBase & { children: PositionedNode[] })
  | (ShapeNode & PositionedBase)
  | (ChartNode & PositionedBase)
  | (TimelineNode & PositionedBase)
  | (MatrixNode & PositionedBase)
  | (TreeNode & PositionedBase);

export const positionedNodeSchema: z.ZodType<PositionedNode> = z.lazy(() =>
  z.union([
    textNodeSchema.merge(positionedBaseSchema),
    imageNodeSchema.merge(positionedBaseSchema).extend({
      imageData: z.string().optional(),
    }),
    tableNodeSchema.merge(positionedBaseSchema),
    boxNodeSchemaBase.merge(positionedBaseSchema).extend({
      children: z.lazy(() => positionedNodeSchema),
    }),
    vStackNodeSchemaBase.merge(positionedBaseSchema).extend({
      children: z.array(z.lazy(() => positionedNodeSchema)),
    }),
    hStackNodeSchemaBase.merge(positionedBaseSchema).extend({
      children: z.array(z.lazy(() => positionedNodeSchema)),
    }),
    shapeNodeSchema.merge(positionedBaseSchema),
    chartNodeSchema.merge(positionedBaseSchema),
    timelineNodeSchema.merge(positionedBaseSchema),
    matrixNodeSchema.merge(positionedBaseSchema),
    treeNodeSchema.merge(positionedBaseSchema),
  ]),
) as z.ZodType<PositionedNode>;

// ===== Master Slide Options =====
export const pageNumberPositionSchema = z.enum(["left", "center", "right"]);

export const masterSlideOptionsSchema = z.object({
  header: z.lazy(() => pomNodeSchema).optional(),
  footer: z.lazy(() => pomNodeSchema).optional(),
  pageNumber: z
    .object({
      position: pageNumberPositionSchema,
    })
    .optional(),
  date: z
    .object({
      value: z.string(),
    })
    .optional(),
});

export type PageNumberPosition = z.infer<typeof pageNumberPositionSchema>;
export type MasterSlideOptions = z.infer<typeof masterSlideOptionsSchema>;
