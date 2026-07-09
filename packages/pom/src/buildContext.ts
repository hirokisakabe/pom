import type { TextMeasurementMode } from "./calcYogaLayout/measureText.ts";
import { DiagnosticCollector } from "./diagnostics.ts";
import { GlowEffectRegistry } from "./renderPptx/glowEffects.ts";
import { GradientFillRegistry } from "./renderPptx/gradientFills.ts";
import { GlimpseTextBoxRegistry } from "./renderPptx/glimpseTextBoxes.ts";

export interface BuildContext {
  textMeasurementMode: TextMeasurementMode;
  imageSizeCache: Map<string, { widthPx: number; heightPx: number }>;
  imageDataCache: Map<string, string>;
  iconRasterCache: Map<string, string>;
  diagnostics: DiagnosticCollector;
  gradientFills: GradientFillRegistry;
  glowEffects: GlowEffectRegistry;
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
    gradientFills: new GradientFillRegistry(),
    glowEffects: new GlowEffectRegistry(),
    glimpseTextBoxes: new GlimpseTextBoxRegistry(),
  };
}
