/**
 * Input schemas for LLM/external input validation
 *
 * These schemas do not include internal properties like `yogaNode`.
 * Use these when validating JSON from OpenAI, Claude, or other LLMs.
 *
 * @example
 * ```typescript
 * import { inputPomNodeSchema, InputPOMNode } from "@hirokisakabe/pom";
 *
 * // Validate and parse JSON from LLM
 * const json = JSON.parse(llmResponse);
 * const result = inputPomNodeSchema.safeParse(json);
 * if (result.success) {
 *   const pptx = await buildPptx([result.data], { w: 1280, h: 720 });
 * }
 * ```
 */

import { z } from "zod";
import {
  lengthSchema,
  paddingSchema,
  borderStyleSchema,
  borderDashSchema,
  fillStyleSchema,
  shadowStyleSchema,
  alignItemsSchema,
  justifyContentSchema,
  shapeTypeSchema,
  tableColumnSchema,
  tableRowSchema,
  chartTypeSchema,
  chartDataSchema,
  bulletOptionsSchema,
  radarStyleSchema,
  timelineDirectionSchema,
  timelineItemSchema,
  matrixAxisSchema,
  matrixQuadrantsSchema,
  matrixItemSchema,
  treeLayoutSchema,
  treeNodeShapeSchema,
  treeConnectorStyleSchema,
  flowDirectionSchema,
  flowNodeItemSchema,
  flowConnectionSchema,
  flowConnectorStyleSchema,
  processArrowDirectionSchema,
  processArrowStepSchema,
  lineArrowSchema,
  type AlignItems,
  type JustifyContent,
  type TreeDataItem,
} from "./types.ts";

// ===== Base Node Schema =====
export const inputBaseNodeSchema = z.object({
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

type InputBaseNode = z.infer<typeof inputBaseNodeSchema>;

// ===== Node Schemas =====
export const inputTextNodeSchema = inputBaseNodeSchema.extend({
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

export const inputImageNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("image"),
  src: z.string(),
});

export const inputTableNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("table"),
  columns: z.array(tableColumnSchema),
  rows: z.array(tableRowSchema),
  defaultRowHeight: z.number().optional(),
});

export const inputShapeNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("shape"),
  shapeType: shapeTypeSchema,
  text: z.string().optional(),
  fill: fillStyleSchema.optional(),
  line: borderStyleSchema.optional(),
  shadow: shadowStyleSchema.optional(),
  fontPx: z.number().optional(),
  color: z.string().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
});

export const inputChartNodeSchema = inputBaseNodeSchema.extend({
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

export const inputTimelineNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("timeline"),
  direction: timelineDirectionSchema.optional(),
  items: z.array(timelineItemSchema),
});

export const inputMatrixNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("matrix"),
  axes: matrixAxisSchema,
  quadrants: matrixQuadrantsSchema.optional(),
  items: z.array(matrixItemSchema),
});

export const inputTreeDataItemSchema: z.ZodType<TreeDataItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    color: z.string().optional(),
    children: z.array(inputTreeDataItemSchema).optional(),
  }),
);

export const inputTreeNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("tree"),
  layout: treeLayoutSchema.optional(),
  nodeShape: treeNodeShapeSchema.optional(),
  data: inputTreeDataItemSchema,
  connectorStyle: treeConnectorStyleSchema.optional(),
  nodeWidth: z.number().optional(),
  nodeHeight: z.number().optional(),
  levelGap: z.number().optional(),
  siblingGap: z.number().optional(),
});

export const inputFlowNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("flow"),
  direction: flowDirectionSchema.optional(),
  nodes: z.array(flowNodeItemSchema),
  connections: z.array(flowConnectionSchema),
  connectorStyle: flowConnectorStyleSchema.optional(),
  nodeWidth: z.number().optional(),
  nodeHeight: z.number().optional(),
  nodeGap: z.number().optional(),
});

export const inputProcessArrowNodeSchema = inputBaseNodeSchema.extend({
  type: z.literal("processArrow"),
  direction: processArrowDirectionSchema.optional(),
  steps: z.array(processArrowStepSchema),
  itemWidth: z.number().optional(),
  itemHeight: z.number().optional(),
  gap: z.number().optional(),
  fontPx: z.number().optional(),
  bold: z.boolean().optional(),
});

export const inputLineNodeSchema = inputBaseNodeSchema.extend({
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

export type InputTextNode = z.infer<typeof inputTextNodeSchema>;
export type InputImageNode = z.infer<typeof inputImageNodeSchema>;
export type InputTableNode = z.infer<typeof inputTableNodeSchema>;
export type InputShapeNode = z.infer<typeof inputShapeNodeSchema>;
export type InputChartNode = z.infer<typeof inputChartNodeSchema>;
export type InputTimelineNode = z.infer<typeof inputTimelineNodeSchema>;
export type InputMatrixNode = z.infer<typeof inputMatrixNodeSchema>;
export type InputTreeNode = z.infer<typeof inputTreeNodeSchema>;
export type InputFlowNode = z.infer<typeof inputFlowNodeSchema>;
export type InputProcessArrowNode = z.infer<typeof inputProcessArrowNodeSchema>;
export type InputLineNode = z.infer<typeof inputLineNodeSchema>;

// ===== Recursive Types =====
export type InputBoxNode = InputBaseNode & {
  type: "box";
  children: InputPOMNode;
};

export type InputVStackNode = InputBaseNode & {
  type: "vstack";
  children: InputPOMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

export type InputHStackNode = InputBaseNode & {
  type: "hstack";
  children: InputPOMNode[];
  gap?: number;
  alignItems?: AlignItems;
  justifyContent?: JustifyContent;
};

// Layer の子要素は x, y を必須とする
export type InputLayerChild = InputPOMNode & {
  x: number;
  y: number;
};

export type InputLayerNode = InputBaseNode & {
  type: "layer";
  children: InputLayerChild[];
};

export type InputPOMNode =
  | InputTextNode
  | InputImageNode
  | InputTableNode
  | InputBoxNode
  | InputVStackNode
  | InputHStackNode
  | InputShapeNode
  | InputChartNode
  | InputTimelineNode
  | InputMatrixNode
  | InputTreeNode
  | InputFlowNode
  | InputProcessArrowNode
  | InputLineNode
  | InputLayerNode;

// ===== Recursive Node Schemas =====
const inputBoxNodeSchemaBase = inputBaseNodeSchema.extend({
  type: z.literal("box"),
  children: z.lazy(() => inputPomNodeSchema),
});

const inputVStackNodeSchemaBase = inputBaseNodeSchema.extend({
  type: z.literal("vstack"),
  children: z.array(z.lazy(() => inputPomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
});

const inputHStackNodeSchemaBase = inputBaseNodeSchema.extend({
  type: z.literal("hstack"),
  children: z.array(z.lazy(() => inputPomNodeSchema)),
  gap: z.number().optional(),
  alignItems: alignItemsSchema.optional(),
  justifyContent: justifyContentSchema.optional(),
});

const inputLayerChildSchemaBase = z.lazy(() =>
  inputPomNodeSchema.and(
    z.object({
      x: z.number(),
      y: z.number(),
    }),
  ),
);

const inputLayerNodeSchemaBase = inputBaseNodeSchema.extend({
  type: z.literal("layer"),
  children: z.array(inputLayerChildSchemaBase),
});

export const inputBoxNodeSchema: z.ZodType<InputBoxNode> =
  inputBoxNodeSchemaBase as z.ZodType<InputBoxNode>;
export const inputVStackNodeSchema: z.ZodType<InputVStackNode> =
  inputVStackNodeSchemaBase as z.ZodType<InputVStackNode>;
export const inputHStackNodeSchema: z.ZodType<InputHStackNode> =
  inputHStackNodeSchemaBase as z.ZodType<InputHStackNode>;
export const inputLayerNodeSchema: z.ZodType<InputLayerNode> =
  inputLayerNodeSchemaBase as z.ZodType<InputLayerNode>;

/**
 * Input schema for POM nodes (for LLM/external input validation)
 *
 * @example
 * ```typescript
 * import { inputPomNodeSchema, buildPptx } from "@hirokisakabe/pom";
 *
 * const json = JSON.parse(llmResponse);
 * const result = inputPomNodeSchema.safeParse(json);
 *
 * if (result.success) {
 *   const pptx = await buildPptx([result.data], { w: 1280, h: 720 });
 *   await pptx.writeFile({ fileName: "output.pptx" });
 * } else {
 *   console.error("Validation failed:", result.error);
 * }
 * ```
 */
export const inputPomNodeSchema: z.ZodType<InputPOMNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    inputTextNodeSchema,
    inputImageNodeSchema,
    inputTableNodeSchema,
    inputBoxNodeSchemaBase,
    inputVStackNodeSchemaBase,
    inputHStackNodeSchemaBase,
    inputShapeNodeSchema,
    inputChartNodeSchema,
    inputTimelineNodeSchema,
    inputMatrixNodeSchema,
    inputTreeNodeSchema,
    inputFlowNodeSchema,
    inputProcessArrowNodeSchema,
    inputLineNodeSchema,
    inputLayerNodeSchemaBase,
  ]),
) as z.ZodType<InputPOMNode>;

// ===== Slide Master Options Schema =====
export const inputMasterTextObjectSchema = z.object({
  type: z.literal("text"),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  fontPx: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  bold: z.boolean().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
});

export const inputMasterImageObjectSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

export const inputMasterRectObjectSchema = z.object({
  type: z.literal("rect"),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  fill: fillStyleSchema.optional(),
  border: borderStyleSchema.optional(),
});

export const inputMasterLineObjectSchema = z.object({
  type: z.literal("line"),
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
  line: borderStyleSchema.optional(),
});

export const inputMasterObjectSchema = z.discriminatedUnion("type", [
  inputMasterTextObjectSchema,
  inputMasterImageObjectSchema,
  inputMasterRectObjectSchema,
  inputMasterLineObjectSchema,
]);

export const inputSlideNumberOptionsSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number().optional(),
  h: z.number().optional(),
  fontPx: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
});

export const inputSlideMasterBackgroundSchema = z.union([
  z.object({ color: z.string() }),
  z.object({ path: z.string() }),
  z.object({ data: z.string() }),
]);

export const inputSlideMasterMarginSchema = z.union([
  z.number(),
  z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
  }),
]);

/**
 * Input schema for slide master options (for LLM/external input validation)
 *
 * @example
 * ```typescript
 * import { inputSlideMasterOptionsSchema, buildPptx } from "@hirokisakabe/pom";
 *
 * const masterOptions = inputSlideMasterOptionsSchema.parse({
 *   title: "MY_MASTER",
 *   background: { color: "F0F0F0" },
 *   objects: [
 *     { type: "text", text: "Header", x: 48, y: 12, w: 200, h: 28, fontPx: 14 },
 *   ],
 *   slideNumber: { x: 1100, y: 680, fontPx: 10 },
 * });
 *
 * const pptx = await buildPptx([page], { w: 1280, h: 720 }, { master: masterOptions });
 * ```
 */
export const inputSlideMasterOptionsSchema = z.object({
  title: z.string().optional(),
  background: inputSlideMasterBackgroundSchema.optional(),
  margin: inputSlideMasterMarginSchema.optional(),
  objects: z.array(inputMasterObjectSchema).optional(),
  slideNumber: inputSlideNumberOptionsSchema.optional(),
});

export type InputSlideMasterOptions = z.infer<
  typeof inputSlideMasterOptionsSchema
>;
