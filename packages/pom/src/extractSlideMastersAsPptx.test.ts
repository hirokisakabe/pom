import { readPptx } from "@pptx-glimpse/document";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { extractSlideMastersAsPptx } from "./extractSlideMastersAsPptx.ts";
import { createPptxFixture } from "./testUtils/pptxFixture.ts";

describe("extractSlideMastersAsPptx", () => {
  it("slideMaster ごと × 表示 layout 数のスライドを持つ PPTX を生成する", async () => {
    const buffer = await createPptxFixture([
      { layoutShows: [undefined, undefined] },
      { layoutShows: [undefined] },
    ]);

    const result = await extractSlideMastersAsPptx(buffer);
    const zip = await JSZip.loadAsync(result);

    const slidePaths = Object.keys(zip.files)
      .filter((path) => /^ppt\/slides\/slide\d+\.xml$/.test(path))
      .sort();
    expect(slidePaths).toEqual([
      "ppt/slides/slide1.xml",
      "ppt/slides/slide2.xml",
      "ppt/slides/slide3.xml",
    ]);

    const relsTargets = await Promise.all(
      slidePaths.map(async (_, index) => {
        const relsXml = await zip
          .file(`ppt/slides/_rels/slide${index + 1}.xml.rels`)!
          .async("text");
        return /Target="\.\.\/slideLayouts\/(slideLayout\d+\.xml)"/.exec(
          relsXml,
        )?.[1];
      }),
    );
    expect(relsTargets).toEqual([
      "slideLayout1.xml",
      "slideLayout2.xml",
      "slideLayout3.xml",
    ]);
  });

  it('show="0" / show="false" の layout を除外する', async () => {
    const buffer = await createPptxFixture([
      { layoutShows: [undefined, "0", "false", "1"] },
    ]);

    const result = await extractSlideMastersAsPptx(buffer);
    const zip = await JSZip.loadAsync(result);

    const slidePaths = Object.keys(zip.files).filter((path) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(path),
    );
    expect(slidePaths).toHaveLength(2);

    const rels1 = await zip
      .file("ppt/slides/_rels/slide1.xml.rels")!
      .async("text");
    const rels2 = await zip
      .file("ppt/slides/_rels/slide2.xml.rels")!
      .async("text");
    expect(rels1).toContain("slideLayout1.xml");
    expect(rels2).toContain("slideLayout4.xml");
  });

  it("元のスライドを全て削除し、レイアウト由来のスライドだけを残す", async () => {
    const buffer = await createPptxFixture([
      { layoutShows: [undefined, undefined] },
    ]);

    const result = await extractSlideMastersAsPptx(buffer);
    const zip = await JSZip.loadAsync(result);

    const slidePaths = Object.keys(zip.files).filter((path) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(path),
    );
    expect(slidePaths).toHaveLength(2);
  });

  it("presentation.xml / presentation.xml.rels / [Content_Types].xml が生成スライド数と整合する", async () => {
    const buffer = await createPptxFixture([
      { layoutShows: [undefined, undefined, "0"] },
      { layoutShows: [undefined] },
    ]);

    const result = await extractSlideMastersAsPptx(buffer);
    const zip = await JSZip.loadAsync(result);

    const slidePaths = Object.keys(zip.files).filter((path) =>
      /^ppt\/slides\/slide\d+\.xml$/.test(path),
    );
    expect(slidePaths).toHaveLength(3);

    const presentationXml = await zip
      .file("ppt/presentation.xml")!
      .async("text");
    expect((presentationXml.match(/<p:sldId\b/g) ?? []).length).toBe(
      slidePaths.length,
    );

    const presentationRelsXml = await zip
      .file("ppt/_rels/presentation.xml.rels")!
      .async("text");
    expect(
      (presentationRelsXml.match(/Type="[^"]*relationships\/slide"/g) ?? [])
        .length,
    ).toBe(slidePaths.length);

    const contentTypesXml = await zip
      .file("[Content_Types].xml")!
      .async("text");
    expect(
      (contentTypesXml.match(/PartName="\/ppt\/slides\/slide\d+\.xml"/g) ?? [])
        .length,
    ).toBe(slidePaths.length);
  });

  it("出力 PPTX を PPTX パーサで再読込しても破損せず、期待通りのスライド構造になる", async () => {
    const buffer = await createPptxFixture([
      { layoutShows: [undefined, "0", undefined] },
      { layoutShows: [undefined] },
    ]);

    const result = await extractSlideMastersAsPptx(buffer);

    expect(() => readPptx(new Uint8Array(result))).not.toThrow();
    const reopened = readPptx(new Uint8Array(result));
    expect(reopened.slides).toHaveLength(3);
    for (const slide of reopened.slides) {
      expect(slide.layoutPartPath).toBeDefined();
    }
  });

  it("不正な PPTX バッファは reject する", async () => {
    const garbage = new Uint8Array([0, 1, 2, 3, 4, 5]);
    await expect(extractSlideMastersAsPptx(garbage)).rejects.toThrow();
  });
});
