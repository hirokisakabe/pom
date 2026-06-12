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

describe("Layer の絶対配置", () => {
  it("Layer の子が layer 左上からの相対座標で絶対配置される", async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <Layer w="600" h="400">
          <Shape shapeType="rect" x="50" y="50" w="120" h="80" />
          <Line x1="170" y1="90" x2="300" y2="90" />
          <VStack x="300" y="20" w="200" h="100">
            <Shape shapeType="rect" w="100" h="40" />
          </VStack>
        </Layer>
      </Slide>`,
    );
    expect(positioned.type).toBe("layer");
    const [shape, line, vstack] = childrenOf(positioned);

    expect(shape).toMatchObject({
      x: positioned.x + 50,
      y: positioned.y + 50,
      w: 120,
      h: 80,
    });

    // Line は x1/y1/x2/y2 が layer 内相対座標として加算される
    expect(line).toMatchObject({
      x1: positioned.x + 170,
      y1: positioned.y + 90,
      x2: positioned.x + 300,
      y2: positioned.y + 90,
      x: positioned.x + 170,
      w: 130,
    });

    // VStack は recurse 経由で通常のフロー配置に戻る
    expect(vstack).toMatchObject({ x: positioned.x + 300, y: positioned.y + 20 });
    const [inner] = childrenOf(vstack);
    expect(inner).toMatchObject({ x: vstack.x, y: vstack.y, w: 100, h: 40 });
  });

  it("Layer 内の Arrow は layer の絶対座標とサイズ 0 で配置される", async () => {
    const positioned = await layoutSlide(
      `<Slide>
        <Layer w="600" h="400">
          <Shape id="a" shapeType="rect" x="50" y="50" w="120" h="40" />
          <Shape id="b" shapeType="rect" x="50" y="200" w="120" h="40" />
          <Arrow x="0" y="0" from="a" to="b" />
        </Layer>
      </Slide>`,
    );
    const [, , arrow] = childrenOf(positioned);
    expect(arrow).toMatchObject({
      x: positioned.x,
      y: positioned.y,
      w: 0,
      h: 0,
    });
  });
});
