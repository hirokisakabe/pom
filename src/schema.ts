/**
 * Browser-compatible schema exports
 *
 * This module exports only the Zod schemas and types without any Node.js dependencies.
 * Use this entry point when you need to validate LLM-generated JSON in browser environments.
 *
 * @example
 * ```typescript
 * import { inputPomNodeSchema } from "@hirokisakabe/pom/schema";
 *
 * const result = inputPomNodeSchema.safeParse(llmResponse);
 * if (result.success) {
 *   // Send to server for PPTX generation
 *   await fetch("/api/generate-pptx", {
 *     method: "POST",
 *     body: JSON.stringify(result.data),
 *   });
 * }
 * ```
 */

// Input schemas for LLM/external input validation
export {
  inputPomNodeSchema,
  inputTextNodeSchema,
  inputImageNodeSchema,
  inputTableNodeSchema,
  inputBoxNodeSchema,
  inputVStackNodeSchema,
  inputHStackNodeSchema,
  inputShapeNodeSchema,
  inputChartNodeSchema,
  inputSlideMasterOptionsSchema,
  inputMasterTextObjectSchema,
  inputMasterImageObjectSchema,
  inputMasterRectObjectSchema,
  inputMasterLineObjectSchema,
  inputMasterObjectSchema,
  inputSlideNumberOptionsSchema,
  inputSlideMasterBackgroundSchema,
  inputSlideMasterMarginSchema,
  inputBaseNodeSchema,
  type InputPOMNode,
  type InputTextNode,
  type InputImageNode,
  type InputTableNode,
  type InputBoxNode,
  type InputVStackNode,
  type InputHStackNode,
  type InputShapeNode,
  type InputChartNode,
  type InputSlideMasterOptions,
} from "./inputSchema.ts";

// Basic type schemas (browser-compatible)
export {
  lengthSchema,
  paddingSchema,
  borderStyleSchema,
  borderDashSchema,
  fillStyleSchema,
  shadowStyleSchema,
  alignItemsSchema,
  justifyContentSchema,
  shapeTypeSchema,
  chartTypeSchema,
  chartDataSchema,
  bulletOptionsSchema,
  bulletNumberTypeSchema,
  tableColumnSchema,
  tableRowSchema,
  tableCellSchema,
  slideMasterOptionsSchema,
  masterTextObjectSchema,
  masterImageObjectSchema,
  masterRectObjectSchema,
  masterLineObjectSchema,
  masterObjectSchema,
  slideNumberOptionsSchema,
  slideMasterBackgroundSchema,
  slideMasterMarginSchema,
  type Length,
  type Padding,
  type BorderStyle,
  type BorderDash,
  type FillStyle,
  type ShadowStyle,
  type AlignItems,
  type JustifyContent,
  type ShapeType,
  type ChartType,
  type ChartData,
  type BulletOptions,
  type BulletNumberType,
  type TableColumn,
  type TableRow,
  type TableCell,
  type SlideMasterOptions,
  type MasterTextObject,
  type MasterImageObject,
  type MasterRectObject,
  type MasterLineObject,
  type MasterObject,
  type SlideNumberOptions,
  type SlideMasterBackground,
  type SlideMasterMargin,
} from "./types.ts";
