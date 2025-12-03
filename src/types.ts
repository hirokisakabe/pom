import type { Node as YogaNode } from "yoga-layout";
import type PptxGenJS from "pptxgenjs";
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

// ===== TypeScript Types (defined early for recursive references) =====
export type Length = z.infer<typeof lengthSchema>;
export type Padding = z.infer<typeof paddingSchema>;
export type BorderDash = z.infer<typeof borderDashSchema>;
export type BorderStyle = z.infer<typeof borderStyleSchema>;
export type FillStyle = z.infer<typeof fillStyleSchema>;
export type ShadowStyle = z.infer<typeof shadowStyleSchema>;
export type AlignItems = z.infer<typeof alignItemsSchema>;
export type JustifyContent = z.infer<typeof justifyContentSchema>;
export type FlexDirection = z.infer<typeof flexDirectionSchema>;

// ===== Base Node =====
// Input schema (for LLM/external input validation - no internal properties)
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

// Internal schema (extends input with internal properties)
const basePOMNodeSchema = inputBaseNodeSchema.extend({
  yogaNode: z.custom<YogaNode>().optional(),
});

type BasePOMNode = z.infer<typeof basePOMNodeSchema>;
type InputBaseNode = z.infer<typeof inputBaseNodeSchema>;

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
  width: z.number(),
});

export const tableNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("table"),
  columns: z.array(tableColumnSchema),
  rows: z.array(tableRowSchema),
  defaultRowHeight: z.number().optional(),
});

export const shapeNodeSchema = basePOMNodeSchema.extend({
  type: z.literal("shape"),
  shapeType: z.custom<PptxGenJS.SHAPE_NAME>(),
  text: z.string().optional(),
  fill: fillStyleSchema.optional(),
  line: borderStyleSchema.optional(),
  shadow: shadowStyleSchema.optional(),
  fontPx: z.number().optional(),
  fontColor: z.string().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
});

export type TextNode = z.infer<typeof textNodeSchema>;
export type ImageNode = z.infer<typeof imageNodeSchema>;
export type TableCell = z.infer<typeof tableCellSchema>;
export type TableRow = z.infer<typeof tableRowSchema>;
export type TableColumn = z.infer<typeof tableColumnSchema>;
export type TableNode = z.infer<typeof tableNodeSchema>;
export type ShapeNode = z.infer<typeof shapeNodeSchema>;

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
  | ShapeNode;

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
  | (ImageNode & PositionedBase)
  | (TableNode & PositionedBase)
  | (BoxNode & PositionedBase & { children: PositionedNode })
  | (VStackNode & PositionedBase & { children: PositionedNode[] })
  | (HStackNode & PositionedBase & { children: PositionedNode[] })
  | (ShapeNode & PositionedBase);

export const positionedNodeSchema: z.ZodType<PositionedNode> = z.lazy(() =>
  z.union([
    textNodeSchema.merge(positionedBaseSchema),
    imageNodeSchema.merge(positionedBaseSchema),
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
  ]),
) as z.ZodType<PositionedNode>;

// ===== Master Slide Options =====
export const pageNumberPositionSchema = z.enum(["left", "center", "right"]);
export const dateFormatSchema = z.enum(["YYYY/MM/DD", "locale"]);

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
      format: dateFormatSchema,
    })
    .optional(),
});

export type PageNumberPosition = z.infer<typeof pageNumberPositionSchema>;
export type DateFormat = z.infer<typeof dateFormatSchema>;
export type MasterSlideOptions = z.infer<typeof masterSlideOptionsSchema>;

// ===== Input Schemas (for LLM/external input - no internal properties like yogaNode) =====
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
  shapeType: z.custom<PptxGenJS.SHAPE_NAME>(),
  text: z.string().optional(),
  fill: fillStyleSchema.optional(),
  line: borderStyleSchema.optional(),
  shadow: shadowStyleSchema.optional(),
  fontPx: z.number().optional(),
  fontColor: z.string().optional(),
  alignText: z.enum(["left", "center", "right"]).optional(),
});

export type InputTextNode = z.infer<typeof inputTextNodeSchema>;
export type InputImageNode = z.infer<typeof inputImageNodeSchema>;
export type InputTableNode = z.infer<typeof inputTableNodeSchema>;
export type InputShapeNode = z.infer<typeof inputShapeNodeSchema>;

// Input recursive types
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
  | InputShapeNode;

// Input schemas for recursive nodes
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
 * Use this schema when validating JSON from OpenAI, Claude, or other LLMs.
 *
 * @example
 * ```typescript
 * import { inputPomNodeSchema } from "@hirokisakabe/pom";
 * import { zodResponseFormat } from "openai/helpers/zod";
 *
 * const response = await openai.chat.completions.create({
 *   model: "gpt-4o",
 *   messages: [...],
 *   response_format: zodResponseFormat(inputPomNodeSchema, "slide"),
 * });
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
  ]),
) as z.ZodType<InputPOMNode>;

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
