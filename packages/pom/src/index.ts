export { buildPptx } from "./buildPptx.ts";
export type { BuildPptxResult, TextMeasurementMode } from "./buildPptx.ts";
export type {
  PptxOutputType,
  PptxWriteFileOptions,
  PptxWriteOptions,
  WritablePptx,
} from "./renderPptx/writablePptx.ts";
export { DiagnosticsError } from "./diagnostics.ts";
export type { Diagnostic, DiagnosticCode } from "./diagnostics.ts";
export { extractThemeTokensFromPptx } from "./extractThemeTokensFromPptx.ts";
export { extractSlideMastersAsPptx } from "./extractSlideMastersAsPptx.ts";
export { parseXml, ParseXmlError } from "./parseXml/parseXml.ts";
export { serializeXml } from "./parseXml/serializeXml.ts";
export type {
  ThemeTokens,
  SlideMasterOptions,
  SlideMasterBackground,
  SlideMasterMargin,
  MasterObject,
  MasterTextObject,
  MasterImageObject,
  MasterRectObject,
  MasterLineObject,
  SlideNumberOptions,
  POMNode,
} from "./types.ts";
export { FALLBACK_THEME_TOKENS } from "./types.ts";
