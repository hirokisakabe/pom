import type PptxGenJSType from "pptxgenjs";
import type { PositionedNode } from "../types";

export type SlideInstance = ReturnType<
  InstanceType<typeof PptxGenJSType>["addSlide"]
>;
export type PptxInstance = InstanceType<typeof PptxGenJSType>;

export type RenderContext = {
  slide: SlideInstance;
  pptx: PptxInstance;
};

export type NodeRenderer<T extends PositionedNode> = (
  node: T,
  ctx: RenderContext,
) => void;
