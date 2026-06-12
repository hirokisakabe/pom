import { describe, it, expect } from "vitest";
import { NODE_METADATA } from "./nodeMetadata.ts";
import {
  INLINE_BOOLEAN_FORMATS,
  INLINE_FORMAT_TAG_LIST,
  INLINE_FORMAT_TAGS,
  INLINE_LINK_TAG,
  INLINE_MARK_TAG,
  INLINE_SPAN_TAG,
  formatExpectedTags,
} from "./xmlChildRules.ts";

describe("xmlChildRules", () => {
  describe("NODE_METADATA との整合性", () => {
    it("childPolicy.kind === 'custom' のノードは必ず xmlChildRule を持つ", () => {
      for (const metadata of NODE_METADATA) {
        if (metadata.childPolicy.kind === "custom") {
          expect(
            metadata.xmlChildRule,
            `${metadata.type} は childPolicy.kind === "custom" なのに xmlChildRule が未定義`,
          ).toBeDefined();
        } else {
          expect(
            metadata.xmlChildRule,
            `${metadata.type} は childPolicy.kind === "${metadata.childPolicy.kind}" なのに xmlChildRule が定義されている`,
          ).toBeUndefined();
        }
      }
    });

    it("repeated ルールの property は childPolicy.optionalProperties に含まれる", () => {
      for (const metadata of NODE_METADATA) {
        if (metadata.xmlChildRule?.kind !== "repeated") continue;
        if (metadata.childPolicy.kind !== "custom") continue;
        const optionalProperties = metadata.childPolicy.optionalProperties;
        if (!optionalProperties) continue;
        expect(
          optionalProperties,
          `${metadata.type} の repeated ルール property "${metadata.xmlChildRule.property}" が optionalProperties に含まれていない`,
        ).toContain(metadata.xmlChildRule.property);
      }
    });
  });

  describe("インライン装飾タグ定義", () => {
    it("INLINE_FORMAT_TAG_LIST は boolean 装飾 + A/Mark/Span と一致する", () => {
      const derived = new Set([
        ...INLINE_BOOLEAN_FORMATS.map((format) => format.tag),
        INLINE_LINK_TAG,
        INLINE_MARK_TAG,
        INLINE_SPAN_TAG,
      ]);
      expect(new Set(INLINE_FORMAT_TAG_LIST)).toEqual(derived);
      expect(INLINE_FORMAT_TAGS).toEqual(new Set(INLINE_FORMAT_TAG_LIST));
    });
  });

  describe("formatExpectedTags", () => {
    it("タグ数に応じて列挙を整形する", () => {
      expect(formatExpectedTags(["TreeItem"])).toBe("<TreeItem>");
      expect(formatExpectedTags(["Col", "Tr"])).toBe("<Col> or <Tr>");
      expect(
        formatExpectedTags(["MatrixAxes", "MatrixQuadrants", "MatrixItem"]),
      ).toBe("<MatrixAxes>, <MatrixQuadrants>, or <MatrixItem>");
    });
  });
});
