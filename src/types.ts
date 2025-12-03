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
