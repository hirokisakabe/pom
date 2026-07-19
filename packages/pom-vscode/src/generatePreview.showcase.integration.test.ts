import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { generatePreviewSvg, type InputFormat } from "./generatePreview.js";

const fontDirs = [resolve(__dirname, "../fonts")];

const showcaseSamples: { filename: string; format: InputFormat }[] = [
  { filename: "sample.pom.md", format: "markdown" },
  { filename: "sample.pom.xml", format: "xml" },
];

describe("展示用サンプルのプレビュー変換", () => {
  it.each(showcaseSamples)(
    "$filename から SVG を生成する",
    { timeout: 30000 },
    async ({ filename, format }) => {
      const content = readFileSync(
        resolve(__dirname, `../${filename}`),
        "utf-8",
      );
      const result = await generatePreviewSvg(content, fontDirs, format);

      if (result.type === "error") {
        throw new Error(`${filename} processing failed: ${result.message}`);
      }
      expect(result.type).toBe("success");
      if (result.type === "success") {
        expect(result.svgs.length).toBeGreaterThan(0);
        for (const svg of result.svgs) {
          expect(svg).toContain("<svg");
        }
      }
    },
  );
});
