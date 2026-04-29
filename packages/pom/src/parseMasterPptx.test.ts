import { describe, expect, it } from "vitest";
import { buildPptx } from "./buildPptx.ts";
import { parseMasterPptx } from "./parseMasterPptx.ts";

/**
 * buildPptx で PPTX を生成し、そのバッファを返すヘルパー
 */
async function generatePptxBuffer(
  masterBackground?: { color: string } | { data: string },
): Promise<Uint8Array> {
  const xml = '<Slide><VStack><Text fontSize="24">test</Text></VStack></Slide>';
  const slideSize = { w: 960, h: 540 };
  const result = await buildPptx(xml, slideSize, {
    master: masterBackground ? { background: masterBackground } : undefined,
  });
  return (await result.pptx.write({ outputType: "uint8array" })) as Uint8Array;
}

describe("parseMasterPptx", () => {
  it("単色背景を抽出できる", async () => {
    const buffer = await generatePptxBuffer({ color: "FF0000" });
    const bg = await parseMasterPptx(buffer);
    expect(bg).toEqual({ color: "FF0000" });
  });

  it("背景なしの PPTX では undefined を返す", async () => {
    const buffer = await generatePptxBuffer();
    const bg = await parseMasterPptx(buffer);
    expect(bg).toBeUndefined();
  });

  it("画像背景を抽出できる（data URI）", async () => {
    // 1x1 赤ピクセルの PNG を data URI として背景に設定
    const redPixelPng =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const buffer = await generatePptxBuffer({ data: redPixelPng });
    const bg = await parseMasterPptx(buffer);

    expect(bg).toBeDefined();
    expect(bg).toHaveProperty("data");
    if (bg && "data" in bg) {
      expect(bg.data).toMatch(/^data:image\/[a-z]+;base64,/);
    }
  });
});

describe("buildPptx with masterPptx option", () => {
  it("masterPptx を指定して PPTX を生成できる", async () => {
    // 背景付きの PPTX を生成
    const templateBuffer = await generatePptxBuffer({ color: "0000FF" });

    // masterPptx として渡して新しい PPTX を生成
    const xml =
      '<Slide><VStack><Text fontSize="24">hello</Text></VStack></Slide>';
    const result = await buildPptx(
      xml,
      { w: 960, h: 540 },
      {
        masterPptx: templateBuffer,
      },
    );

    expect(result.pptx).toBeDefined();
    expect(result.diagnostics).toEqual([]);
  });

  it("不正な masterPptx を渡した場合は diagnostics に警告が追加される", async () => {
    const xml =
      '<Slide><VStack><Text fontSize="24">hello</Text></VStack></Slide>';
    const result = await buildPptx(
      xml,
      { w: 960, h: 540 },
      {
        masterPptx: new Uint8Array([0, 1, 2, 3]), // 壊れたデータ
      },
    );

    expect(result.pptx).toBeDefined();
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0].code).toBe("MASTER_PPTX_PARSE_FAILED");
  });

  it("master.background が明示指定されている場合は masterPptx の背景より優先", async () => {
    const templateBuffer = await generatePptxBuffer({ color: "0000FF" });

    // masterPptx と master.background の両方を指定
    const xml =
      '<Slide><VStack><Text fontSize="24">hello</Text></VStack></Slide>';
    const result = await buildPptx(
      xml,
      { w: 960, h: 540 },
      {
        masterPptx: templateBuffer,
        master: { background: { color: "FF0000" } },
      },
    );

    // 生成された PPTX を再パースして背景を確認
    const outputBuffer = (await result.pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const bg = await parseMasterPptx(outputBuffer);
    expect(bg).toEqual({ color: "FF0000" });
  });
});
