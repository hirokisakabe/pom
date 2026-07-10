import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildPptx } from "../../buildPptx.ts";

async function buildSlideXml(xml: string): Promise<string> {
  const { pptx } = await buildPptx(
    xml,
    { w: 1280, h: 720 },
    { autoFit: false },
  );
  const buffer = (await pptx.write({
    outputType: "uint8array",
  })) as Uint8Array;
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("ppt/slides/slide1.xml")!.async("text");
}

function countLineShapes(slideXml: string): number {
  return slideXml.match(/<a:prstGeom prst="line">/g)?.length ?? 0;
}

describe("renderBackgroundAndBorder の辺ごと border", () => {
  it("borderLeft のみ指定すると左辺の line shape だけが描画される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderLeft.color="FF0000" borderLeft.width="4">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(1);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("border と併用した場合は 4 辺とも line shape になり辺ごとの指定が優先される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" border.color="112233" border.width="2" borderTop.color="FF0000">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(4);
    // 上辺は辺ごとの指定色、残り 3 辺は一律 border の色
    expect(slideXml.match(/<a:srgbClr val="FF0000"\/>/g)).toHaveLength(1);
    expect(slideXml.match(/<a:srgbClr val="112233"\/>/g)).toHaveLength(3);
  });

  it("一律 border のみの場合は line shape を描画しない (従来出力を維持)", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" border.color="000000" border.width="2">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(0);
  });

  it("backgroundGradient + shadow は legacy gradient 後処理と shadow XML を共存させる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(90deg, #FF0000, #0000FF)" shadow.type="outer" shadow.blur="4" shadow.offset="2">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).toContain("<a:outerShdw");
    expect(slideXml).not.toContain("pom-gradient:");
  });

  it("backgroundGradient + borderRadius + shadow は roundRect geometry と effectLst を共存させる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderRadius="12" backgroundGradient="linear-gradient(90deg, #FF0000, #0000FF)" shadow.type="outer">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).toContain("<a:outerShdw");
    expect(slideXml).toContain('<a:prstGeom prst="roundRect">');
  });

  it("背景付きルートノード (slide.background 最適化パス) でも辺ごとの border が描画される", async () => {
    const xml = `<Slide><VStack w="100%" h="max" backgroundColor="F8FAFC" borderLeft.color="FF0000" borderLeft.width="6">
      <Text w="200" h="100">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(1);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("背景画像付きルートノードでも辺ごとの border が描画される", async () => {
    const xml = `<Slide><VStack w="100%" h="max" backgroundImage.src="https://example.com/bg.png" borderBottom.color="FF0000" borderBottom.width="3">
      <Text w="200" h="100">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(1);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("borderRadius と併用した場合は辺ごとの指定を無視して一律 border で描画する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderRadius="8" border.color="000000" borderLeft.color="FF0000">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(0);
    expect(slideXml).not.toContain('<a:srgbClr val="FF0000"/>');
  });
});
