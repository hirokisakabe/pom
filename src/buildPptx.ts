import { calcYogaLayout } from "./calcYogaLayout/calcYogaLayout";
import { renderPptx } from "./renderPptx/renderPptx";
import { toPositioned } from "./toPositioned/toPositioned";
import { POMNode, PositionedNode } from "./types";

export async function buildPptx(
  nodes: POMNode[],
  slideSize: { w: number; h: number },
) {
  const positionedPages: PositionedNode[] = [];

  for (const node of nodes) {
    await calcYogaLayout(node, slideSize);
    const positioned = toPositioned(node);
    positionedPages.push(positioned);
  }

  const pptx = renderPptx(positionedPages, slideSize);

  return pptx;
}
