import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildPptx } from "../../buildPptx.ts";

async function buildSlideXml(xml: string): Promise<string> {
  const { pptx } = await buildPptx(
    xml,
    { w: 1280, h: 720 },
    { autoFit: false },
  );
  const buffer = await pptx.write({
    outputType: "uint8array",
  });
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
    expect(slideXml).toContain('<a:gd name="adj" fmla="val 12000"/>');
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

  it("backgroundImage と背景色・一律 border を正しい描画順で分割する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundColor="F8FAFC" backgroundImage.src="https://example.com/bg.png" border.color="FF0000" border.width="3">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml).toContain('<a:srgbClr val="F8FAFC"/>');
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });

  it("borderRadius と併用した場合は辺ごとに custGeom path として描画され、辺ごとの色が反映される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderRadius="8" borderTop.color="FF0000" borderTop.width="4">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    // borderTop のみなので custGeom shape は 1 個。角丸は複数の
    // lineTo セグメントへ展開される
    expect(slideXml.match(/<a:custGeom>/g) ?? []).toHaveLength(1);
    expect(slideXml.match(/<a:lnTo>/g)?.length ?? 0).toBeGreaterThan(10);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("borderRadius + 背景色 + 辺ごと border の併用では roundRect 背景と custGeom path が共存する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundColor="EFEFEF" borderRadius="8" borderTop.color="FF0000" borderTop.width="4">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml).toContain('<a:prstGeom prst="roundRect">');
    expect(slideXml.match(/<a:custGeom>/g) ?? []).toHaveLength(1);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
    expect(slideXml).toContain('<a:srgbClr val="EFEFEF"/>');
  });

  it("borderRadius + 4 辺全部の指定では 4 個の custGeom path が描画される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderRadius="8"
        borderTop.color="FF0000" borderTop.width="3"
        borderRight.color="00FF00" borderRight.width="3"
        borderBottom.color="0000FF" borderBottom.width="3"
        borderLeft.color="FFFF00" borderLeft.width="3">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml.match(/<a:custGeom>/g) ?? []).toHaveLength(4);
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
    expect(slideXml).toContain('<a:srgbClr val="00FF00"/>');
    expect(slideXml).toContain('<a:srgbClr val="0000FF"/>');
    expect(slideXml).toContain('<a:srgbClr val="FFFF00"/>');
  });

  it("borderRadius が無い場合は従来通り line shape が使われる (radius 無し経路の後方互換)", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderTop.color="FF0000" borderTop.width="4">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(countLineShapes(slideXml)).toBe(1);
    expect(slideXml).not.toContain("<a:custGeom>");
  });

  it("borderRadius と一律 border のみの組み合わせは従来通り roundRect 1 個で描画する (後方互換)", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" borderRadius="8" border.color="123456" border.width="2">test</Text>
    </VStack></Slide>`;
    const slideXml = await buildSlideXml(xml);

    expect(slideXml).toContain('<a:prstGeom prst="roundRect">');
    expect(slideXml).not.toContain("<a:custGeom>");
  });
});
