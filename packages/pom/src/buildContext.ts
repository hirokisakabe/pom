import type { TextMeasurementMode } from "./calcYogaLayout/measureText.ts";
import { DiagnosticCollector } from "./diagnostics.ts";
import { GlimpseTextBoxRegistry } from "./renderPptx/glimpseTextBoxes.ts";

export interface BuildContext {
  textMeasurementMode: TextMeasurementMode;
  imageSizeCache: Map<string, { widthPx: number; heightPx: number }>;
  imageDataCache: Map<string, string>;
  iconRasterCache: Map<string, string>;
  diagnostics: DiagnosticCollector;
  glimpseTextBoxes: GlimpseTextBoxRegistry;
}

export function createBuildContext(
  textMeasurementMode: TextMeasurementMode = "auto",
): BuildContext {
  return {
    textMeasurementMode,
    imageSizeCache: new Map(),
    imageDataCache: new Map(),
    iconRasterCache: new Map(),
    diagnostics: new DiagnosticCollector(),
    glimpseTextBoxes: new GlimpseTextBoxRegistry(),
  };
}
