import { describe, it, expect } from "vitest";
import type { POMNode } from "../types.ts";
import { getNodeDef } from "./index.ts";
import { NODE_METADATA } from "./nodeMetadata.ts";

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
  "svg",
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
      "svg",
    ];
    for (const type of leafTypes) {
      expect(getNodeDef(type).category).toBe("leaf");
    }
  });

  it("全ノード定義から XML metadata と schema を参照できること", () => {
    for (const type of ALL_NODE_TYPES) {
      const def = getNodeDef(type);
      expect(def.tagName).toMatch(/^[A-Z]/);
      expect(def.schema).toBeDefined();
      expect(["none", "pom-children", "custom"]).toContain(
        def.childPolicy.kind,
      );
    }
  });

  it("NodeDefinition metadata は nodeMetadata を単一ソースとして持つこと", () => {
    for (const metadata of NODE_METADATA) {
      const def = getNodeDef(metadata.type);
      expect({
        type: def.type,
        tagName: def.tagName,
        category: def.category,
        schema: def.schema,
        defaults: def.defaults,
        childPolicy: def.childPolicy,
        textContentProperty: def.textContentProperty,
        supportsInlineRuns: def.supportsInlineRuns,
      }).toEqual(metadata);
    }
  });
});
