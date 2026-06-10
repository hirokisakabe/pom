import { describe, expect, it } from "vitest";
import { createBuildContext } from "../buildContext.ts";
import { parseXml } from "../parseXml/parseXml.ts";
import { freeYogaTree } from "../shared/freeYogaTree.ts";
import { toPositioned } from "../toPositioned/toPositioned.ts";
import type { PositionedNode } from "../types.ts";
import { calcYogaLayout } from "./calcYogaLayout.ts";
import { extractLayoutResults } from "./types.ts";

const slideSize = { w: 1200, h: 600 };

async function layoutSlide(xml: string): Promise<PositionedNode> {
  const [root] = parseXml(xml);
  const ctx = createBuildContext("fallback");
  const map = await calcYogaLayout(root, slideSize, ctx);
  try {
    return await toPositioned(root, ctx, extractLayoutResults(map));
  } finally {
    freeYogaTree(map);
  }
}

function childrenOf(node: PositionedNode): PositionedNode[] {
  if (!("children" in node)) {
    throw new Error(`Node type "${node.type}" has no children`);
  }
  return node.children as PositionedNode[];
}

describe("calcYogaLayout grow 属性", () => {
  it("HStack の子で grow の比率どおりに幅が配分される", async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <HStack w="600" h="100">
          <Shape shapeType="rect" grow="2" />
          <Shape shapeType="rect" grow="1" />
        </HStack>
      </Slide>`,
    );
    const [left, right] = childrenOf(positioned);
    expect(left.w).toBeCloseTo(400);
    expect(right.w).toBeCloseTo(200);
  });

  it("VStack の子で grow の比率どおりに余白が配分される", async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <VStack w="200" h="300">
          <Shape shapeType="rect" grow="3" />
          <Shape shapeType="rect" grow="1" />
        </VStack>
      </Slide>`,
    );
    const [top, bottom] = childrenOf(positioned);
    expect(top.h).toBeCloseTo(225);
    expect(bottom.h).toBeCloseTo(75);
  });

  it('grow と w="max" が同時指定された場合は grow が優先される', async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <HStack w="600" h="100">
          <Shape shapeType="rect" w="max" grow="2" />
          <Shape shapeType="rect" w="max" />
        </HStack>
      </Slide>`,
    );
    const [left, right] = childrenOf(positioned);
    expect(left.w).toBeCloseTo(400);
    expect(right.w).toBeCloseTo(200);
  });

  it('w="max" のみの指定は grow="1" 相当として動作する（後方互換）', async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <HStack w="600" h="100">
          <Shape shapeType="rect" w="max" />
          <Shape shapeType="rect" w="max" />
        </HStack>
      </Slide>`,
    );
    const [left, right] = childrenOf(positioned);
    expect(left.w).toBeCloseTo(300);
    expect(right.w).toBeCloseTo(300);
  });

  it('h="max" のみの指定は grow="1" 相当として動作する（後方互換）', async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <VStack w="200" h="300">
          <Shape shapeType="rect" h="max" />
          <Shape shapeType="rect" h="max" />
        </VStack>
      </Slide>`,
    );
    const [top, bottom] = childrenOf(positioned);
    expect(top.h).toBeCloseTo(150);
    expect(bottom.h).toBeCloseTo(150);
  });

  it("gap がある場合も残余スペースが grow の比率で配分される", async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <HStack w="630" h="100" gap="30">
          <Shape shapeType="rect" grow="2" />
          <Shape shapeType="rect" grow="1" />
        </HStack>
      </Slide>`,
    );
    const [left, right] = childrenOf(positioned);
    expect(left.w).toBeCloseTo(400);
    expect(right.w).toBeCloseTo(200);
  });
});
