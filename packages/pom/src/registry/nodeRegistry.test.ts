import { describe, it, expect } from "vitest";
import type { POMNode } from "../types.ts";
import { getNodeDef } from "./index.ts";

/**
 * POMNode の全 type リテラル一覧。
 * types.ts の POMNode union に新しいノードを追加した場合、ここにも追加すること。
 */
const ALL_NODE_TYPES: POMNode["type"][] = [
  "text",
  "ul",
  "ol",
  "image",
  "table",
  "vstack",
  "hstack",
  "shape",
  "chart",
  "timeline",
  "matrix",
  "tree",
  "flow",
  "processArrow",
  "pyramid",
  "line",
  "arrow",
  "layer",
  "icon",
];

describe("NodeRegistry", () => {
  it("全ノードタイプが登録されていること", () => {
    for (const type of ALL_NODE_TYPES) {
      expect(() => getNodeDef(type)).not.toThrow();
    }
  });

  it("leaf ノードは render 関数を持つこと", () => {
    for (const type of ALL_NODE_TYPES) {
      const def = getNodeDef(type);
      if (def.category === "leaf") {
        expect(def.render).toBeDefined();
      }
    }
  });

  it("absolute-child ノードは toPositioned 関数を持つこと", () => {
    for (const type of ALL_NODE_TYPES) {
      const def = getNodeDef(type);
      if (def.category === "absolute-child") {
        expect(def.toPositioned).toBeDefined();
      }
    }
  });

  it("カテゴリが正しく設定されていること", () => {
    expect(getNodeDef("vstack").category).toBe("multi-child");
    expect(getNodeDef("hstack").category).toBe("multi-child");
    expect(getNodeDef("layer").category).toBe("absolute-child");

    const leafTypes: POMNode["type"][] = [
      "text",
      "ul",
      "ol",
      "image",
      "table",
      "shape",
      "chart",
      "timeline",
      "matrix",
      "tree",
      "flow",
      "processArrow",
      "pyramid",
      "line",
      "arrow",
      "icon",
    ];
    for (const type of leafTypes) {
      expect(getNodeDef(type).category).toBe("leaf");
    }
  });
});
