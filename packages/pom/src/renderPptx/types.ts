import type { BuildContext } from "../buildContext.ts";

type PptxGenJSClass = import("pptxgenjs").default;
export type SlideInstance = ReturnType<PptxGenJSClass["addSlide"]>;
export type PptxInstance = PptxGenJSClass;

export type NodeBounds = { x: number; y: number; w: number; h: number };

export type RenderContext = {
  slide: SlideInstance;
  pptx: PptxInstance;
  buildContext: BuildContext;
  idPositionMap: Map<string, NodeBounds>;
};
