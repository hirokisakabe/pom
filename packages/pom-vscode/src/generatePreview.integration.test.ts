import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { generatePreviewSvg } from "./generatePreview.js";

// macOS の全 system font を読むと fixture の内容に関係なく worker が OOM するため、
// 通常テストでは同梱 font だけを使う。展示用専用テストは production と同じ設定で実行する。
vi.mock("pptx-glimpse", async (importOriginal) => {
  const actual = await importOriginal<typeof import("pptx-glimpse")>();
  return {
    ...actual,
    convertPptxToSvg: (
      input: Parameters<typeof actual.convertPptxToSvg>[0],
      options: Parameters<typeof actual.convertPptxToSvg>[1],
    ) =>
      actual.convertPptxToSvg(input, {
        ...options,
        skipSystemFonts: true,
      }),
  };
});

const fontDirs = [resolve(__dirname, "../fonts")];

describe("generatePreviewSvg 統合テスト", () => {
  it(
    "軽量な Markdown fixture から SVG を生成する",
    { timeout: 30000 },
    async () => {
      const fixtureMarkdown = readFileSync(
        resolve(__dirname, "../test-fixtures/generate-preview.pom.md"),
        "utf-8",
      );
      const result = await generatePreviewSvg(fixtureMarkdown, fontDirs);
      expect(result.type).toBe("success");
      if (result.type === "success") {
        expect(result.svgs.length).toBeGreaterThan(0);
        for (const svg of result.svgs) {
          expect(svg).toContain("<svg");
        }
      }
    },
  );

  it("軽量な XML fixture から SVG を生成する", { timeout: 30000 }, async () => {
    const fixtureXml = readFileSync(
      resolve(__dirname, "../test-fixtures/generate-preview.pom.xml"),
      "utf-8",
    );
    const result = await generatePreviewSvg(fixtureXml, fontDirs, "xml");
    if (result.type === "error") {
      throw new Error(`XML processing failed: ${result.message}`);
    }
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.svgs.length).toBeGreaterThan(0);
      for (const svg of result.svgs) {
        expect(svg).toContain("<svg");
      }
    }
  });
});
