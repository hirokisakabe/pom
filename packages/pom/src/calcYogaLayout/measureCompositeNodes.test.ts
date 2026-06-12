import { describe, it, expect } from "vitest";
import { measureProcessArrow } from "./measureCompositeNodes.ts";
import type { ProcessArrowNode } from "../types.ts";
import {
  ARROW_DEPTH_RATIO,
  DEFAULT_PROCESS_ARROW_ITEM_HEIGHT,
  DEFAULT_PROCESS_ARROW_ITEM_WIDTH,
} from "../shared/processArrowConstants.ts";

function makeNode(overrides: Partial<ProcessArrowNode> = {}): ProcessArrowNode {
  return {
    type: "processArrow",
    steps: [{ label: "A" }, { label: "B" }, { label: "C" }],
    ...overrides,
  };
}

describe("measureProcessArrow", () => {
  it("空ステップの場合 0x0 を返す", () => {
    const result = measureProcessArrow(makeNode({ steps: [] }));
    expect(result).toEqual({ width: 0, height: 0 });
  });

  it("デフォルト値で水平レイアウトのサイズを計算する", () => {
    const node = makeNode();
    const result = measureProcessArrow(node);
    const itemWidth = DEFAULT_PROCESS_ARROW_ITEM_WIDTH;
    const itemHeight = DEFAULT_PROCESS_ARROW_ITEM_HEIGHT;
    const arrowDepth = itemHeight * ARROW_DEPTH_RATIO;
    const gap = -arrowDepth;
    expect(result).toEqual({
      width: 3 * itemWidth + 2 * gap,
      height: itemHeight,
    });
  });

  it("デフォルト値で垂直レイアウトのサイズを計算する", () => {
    const node = makeNode({ direction: "vertical" });
    const result = measureProcessArrow(node);
    const itemWidth = DEFAULT_PROCESS_ARROW_ITEM_WIDTH;
    const itemHeight = DEFAULT_PROCESS_ARROW_ITEM_HEIGHT;
    const arrowDepth = itemHeight * ARROW_DEPTH_RATIO;
    const gap = -arrowDepth;
    expect(result).toEqual({
      width: itemWidth,
      height: 3 * itemHeight + 2 * gap,
    });
  });

  it("カスタム gap が指定された場合はデフォルトより優先される", () => {
    const node = makeNode({ gap: -10 });
    const result = measureProcessArrow(node);
    const itemWidth = DEFAULT_PROCESS_ARROW_ITEM_WIDTH;
    const itemHeight = DEFAULT_PROCESS_ARROW_ITEM_HEIGHT;
    expect(result).toEqual({
      width: 3 * itemWidth + 2 * -10,
      height: itemHeight,
    });
  });

  it("カスタム itemWidth/itemHeight を正しく反映する", () => {
    const node = makeNode({ itemWidth: 200, itemHeight: 100 });
    const result = measureProcessArrow(node);
    const arrowDepth = 100 * ARROW_DEPTH_RATIO;
    expect(result).toEqual({
      width: 3 * 200 + 2 * -arrowDepth,
      height: 100,
    });
  });

  it("itemWidth が小さい場合でも正の幅を返す", () => {
    const node = makeNode({ itemWidth: 30, itemHeight: 80 });
    const result = measureProcessArrow(node);
    // arrowDepth = 80 * 0.35 = 28, gap = -28
    // width = 3 * 30 + 2 * (-28) = 90 - 56 = 34 > 0
    expect(result.width).toBeGreaterThan(0);
  });

  it("単一ステップの場合は gap が影響しない", () => {
    const node = makeNode({ steps: [{ label: "Only" }] });
    const result = measureProcessArrow(node);
    expect(result).toEqual({
      width: DEFAULT_PROCESS_ARROW_ITEM_WIDTH,
      height: DEFAULT_PROCESS_ARROW_ITEM_HEIGHT,
    });
  });
});
