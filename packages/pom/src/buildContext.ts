import type { TextMeasurementMode } from "./calcYogaLayout/measureText.ts";
import { FontRegistry, type FontInput } from "./calcYogaLayout/fontLoader.ts";
import { DiagnosticCollector } from "./diagnostics.ts";
import { PptxAuthoringRegistry } from "./renderPptx/pptxAuthoring.ts";

export interface BuildContext {
  textMeasurementMode: TextMeasurementMode;
  fontRegistry: FontRegistry;
  imageSizeCache: Map<string, { widthPx: number; heightPx: number }>;
  imageDataCache: Map<string, string>;
  iconRasterCache: Map<string, string>;
  diagnostics: DiagnosticCollector;
  pptxAuthoring: PptxAuthoringRegistry;
}

export function createBuildContext(
  textMeasurementMode: TextMeasurementMode = "auto",
  fonts: readonly FontInput[] = [],
): BuildContext {
  return {
    textMeasurementMode,
    fontRegistry: new FontRegistry(fonts),
    imageSizeCache: new Map(),
    imageDataCache: new Map(),
    iconRasterCache: new Map(),
    diagnostics: new DiagnosticCollector(),
    pptxAuthoring: new PptxAuthoringRegistry(),
  };
}
