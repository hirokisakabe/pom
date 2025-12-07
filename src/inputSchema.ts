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
  fillStyleSchema,
  shadowStyleSchema,
  alignItemsSchema,
  justifyContentSchema,
  shapeTypeSchema,
  tableColumnSchema,
  tableRowSchema,
  pageNumberPositionSchema,
  dateFormatSchema,
  chartTypeSchema,
  chartDataSchema,
  type AlignItems,
  type JustifyContent,
} from "./types";

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
  fontColor: z.string().optional(),
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
});

export type InputTextNode = z.infer<typeof inputTextNodeSchema>;
export type InputImageNode = z.infer<typeof inputImageNodeSchema>;
export type InputTableNode = z.infer<typeof inputTableNodeSchema>;
export type InputShapeNode = z.infer<typeof inputShapeNodeSchema>;
export type InputChartNode = z.infer<typeof inputChartNodeSchema>;

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

export type InputPOMNode =
  | InputTextNode
  | InputImageNode
  | InputTableNode
  | InputBoxNode
  | InputVStackNode
  | InputHStackNode
  | InputShapeNode
  | InputChartNode;

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

export const inputBoxNodeSchema: z.ZodType<InputBoxNode> =
  inputBoxNodeSchemaBase as z.ZodType<InputBoxNode>;
export const inputVStackNodeSchema: z.ZodType<InputVStackNode> =
  inputVStackNodeSchemaBase as z.ZodType<InputVStackNode>;
export const inputHStackNodeSchema: z.ZodType<InputHStackNode> =
  inputHStackNodeSchemaBase as z.ZodType<InputHStackNode>;

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
  ]),
) as z.ZodType<InputPOMNode>;

// ===== Master Slide Options Schema =====
export const inputMasterSlideOptionsSchema = z.object({
  header: z.lazy(() => inputPomNodeSchema).optional(),
  footer: z.lazy(() => inputPomNodeSchema).optional(),
  pageNumber: z
    .object({
      position: pageNumberPositionSchema,
    })
    .optional(),
  date: z
    .object({
      format: dateFormatSchema,
    })
    .optional(),
});

export type InputMasterSlideOptions = z.infer<
  typeof inputMasterSlideOptionsSchema
>;
