import JSZip from "jszip";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { buildPptx } from "../buildPptx.ts";
import { ParseXmlError } from "../parseXml/parseXml.ts";

async function readSlideXml(buffer: Uint8Array | ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("ppt/slides/slide1.xml")!.async("text");
}

describe("buildPptx with backgroundGradient", () => {
  it("shape の背景がネイティブの gradFill として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(45deg, #FF0000 0%, #0000FF 100%)" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:gradFill><a:gsLst>");
    expect(slideXml).toContain(
      '<a:gs pos="0"><a:srgbClr val="FF0000"/></a:gs>',
    );
    expect(slideXml).toContain(
      '<a:gs pos="100000"><a:srgbClr val="0000FF"/></a:gs>',
    );
    expect(slideXml).toContain('<a:lin ang="18900000" scaled="1"/>');
  });

  it("backgroundGradient 単独でも stream 経路で gradFill として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="200" h="100" backgroundGradient="linear-gradient(45deg, #FF0000 0%, #0000FF 100%)"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.stream();
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).not.toContain('<a:solidFill><a:srgbClr val="0F7A3D"/>');
  });

  it("backgroundGradient 単独でも default write 経路で gradFill として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="200" h="100" backgroundGradient="linear-gradient(45deg, #FF0000 0%, #0000FF 100%)"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const blob = await pptx.write();
    const slideXml = await readSlideXml(await blob.arrayBuffer());

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).not.toContain('<a:solidFill><a:srgbClr val="0F7A3D"/>');
  });

  it("ルートノードの backgroundGradient はスライド背景に適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max" backgroundGradient="linear-gradient(to right, #11998E, #38EF7D)">
      <Text fontSize="24">test</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toMatch(/<p:bgPr><a:gradFill/);
    expect(slideXml).toContain('<a:lin ang="0" scaled="1"/>');
  });

  it("ルート backgroundGradient は別スライドの通常背景色へ影響しない", async () => {
    const xml = `
      <Slide><VStack w="100%" h="max" backgroundGradient="linear-gradient(to right, #11998E, #38EF7D)">
        <Text fontSize="24">gradient</Text>
      </VStack></Slide>
      <Slide><VStack w="100%" h="max" backgroundColor="0F7A3D">
        <Text fontSize="24">solid</Text>
      </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const zip = await JSZip.loadAsync(buffer);
    const slide1Xml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const slide2Xml = await zip.file("ppt/slides/slide2.xml")!.async("text");

    expect(slide1Xml).toMatch(/<p:bgPr><a:gradFill/);
    expect(slide2Xml).toContain('<a:srgbClr val="0F7A3D"/>');
    expect(slide2Xml).not.toContain("<a:gradFill");
  });

  it("opacity 指定時は各カラーストップに alpha が付く", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(#FF0000, #0000FF)" opacity="0.5" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain(
      '<a:srgbClr val="FF0000"><a:alpha val="50000"/></a:srgbClr>',
    );
  });

  it("backgroundColor と backgroundGradient 併用時は gradient が優先される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundColor="ABCDEF" backgroundGradient="linear-gradient(#FF0000, #0000FF)" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).not.toContain("ABCDEF");
  });

  it("複数スライド・複数グラデーション混在時にそれぞれ正しく置換される", async () => {
    const xml = `
    <Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(90deg, #FF0000, #00FF00)" text=""></Text>
      <Text w="200" h="100" backgroundGradient="linear-gradient(90deg, #112233, #445566)" text=""></Text>
      <Text w="200" h="100" backgroundColor="ABCDEF" text=""></Text>
    </VStack></Slide>
    <Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(90deg, #AA0000, #BB0000)" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const zip = await JSZip.loadAsync(buffer);
    const slide1Xml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const slide2Xml = await zip.file("ppt/slides/slide2.xml")!.async("text");

    // slide1: 2 種類のグラデーションがそれぞれのカラーストップで置換される
    expect(slide1Xml.match(/<a:gradFill/g)).toHaveLength(2);
    expect(slide1Xml).toContain('<a:gs pos="0"><a:srgbClr val="FF0000"/>');
    expect(slide1Xml).toContain('<a:gs pos="0"><a:srgbClr val="112233"/>');
    // 単色背景はそのまま残る
    expect(slide1Xml).toContain('<a:srgbClr val="ABCDEF"/>');

    // slide2: 別スライドのグラデーションも置換される
    expect(slide2Xml.match(/<a:gradFill/g)).toHaveLength(1);
    expect(slide2Xml).toContain('<a:gs pos="0"><a:srgbClr val="AA0000"/>');
  });

  it("writeFile でもグラデーション後処理が適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(#FF0000, #0000FF)" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-gradient-"));
    const filePath = path.join(tmpDir, "out.pptx");
    try {
      await pptx.writeFile({ fileName: filePath });
      const slideXml = await readSlideXml(fs.readFileSync(filePath));
      expect(slideXml).toContain("<a:gradFill");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("グラデーション未使用時は write の出力に gradFill が含まれない", async () => {
    const xml = `<Slide><VStack w="100%" h="max" backgroundColor="FF0000">
      <Text fontSize="24">test</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).not.toContain("<a:gradFill");
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("不正なグラデーション構文は ParseXmlError になる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(invalid)" text=""></Text>
    </VStack></Slide>`;
    await expect(buildPptx(xml, { w: 1280, h: 720 })).rejects.toThrow(
      ParseXmlError,
    );
  });

  describe("radial-gradient", () => {
    it("shape の背景がネイティブの radial gradFill (path=circle) として出力される", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(circle at center, #FF0000 0%, #0000FF 100%)" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      // 中心 50% 50% → fillToRect l=t=r=b=50000
      expect(slideXml).toContain("<a:gradFill><a:gsLst>");
      expect(slideXml).toContain(
        '<a:path path="circle"><a:fillToRect l="50000" t="50000" r="50000" b="50000"/></a:path>',
      );
    });

    it("at <position> でキーワード位置が fillToRect に反映される", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(circle at top right, #FF0000, #0000FF)" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      // top right = (100%, 0%) → l=100000 t=0 r=0 b=100000
      expect(slideXml).toContain(
        '<a:fillToRect l="100000" t="0" r="0" b="100000"/>',
      );
    });

    it("at <position> で % 位置が fillToRect に反映される", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(ellipse at 25% 75%, #11998E, #38EF7D)" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      // 25% 75% → l=25000 t=75000 r=75000 b=25000
      expect(slideXml).toContain(
        '<a:fillToRect l="25000" t="75000" r="75000" b="25000"/>',
      );
    });

    it("shape / at 省略時は ellipse / 中心扱いになる", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(#FF0000, #0000FF)" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      expect(slideXml).toContain('<a:path path="circle">');
      expect(slideXml).toContain(
        '<a:fillToRect l="50000" t="50000" r="50000" b="50000"/>',
      );
    });

    it("ルートノードの radial backgroundGradient はスライド背景に適用される", async () => {
      const xml = `<Slide><VStack w="100%" h="max" backgroundGradient="radial-gradient(circle at center, #0F172A 0%, #1E293B 100%)">
        <Text fontSize="24">test</Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      expect(slideXml).toMatch(/<p:bgPr><a:gradFill/);
      expect(slideXml).toContain('<a:path path="circle">');
    });

    it("opacity 指定時は radial カラーストップにも alpha が付く", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(circle, #FF0000, #0000FF)" opacity="0.4" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      expect(slideXml).toContain(
        '<a:srgbClr val="FF0000"><a:alpha val="40000"/></a:srgbClr>',
      );
      expect(slideXml).toContain('<a:path path="circle">');
    });

    it("linear と radial が同スライド上で同居しても各々の gradFill に置換される", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="linear-gradient(90deg, #FF0000, #00FF00)" text=""></Text>
        <Text w="200" h="100" backgroundGradient="radial-gradient(circle at center, #112233, #445566)" text=""></Text>
      </VStack></Slide>`;
      const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
      const buffer = await pptx.write({
        outputType: "uint8array",
      });
      const slideXml = await readSlideXml(buffer);

      expect(slideXml.match(/<a:gradFill/g)).toHaveLength(2);
      expect(slideXml).toMatch(
        /<a:gradFill[^>]*>[^<]*<a:gsLst>[^<]*<a:gs[^>]*><a:srgbClr val="FF0000"\/><\/a:gs>[\s\S]*?<a:lin/,
      );
      expect(slideXml).toContain('<a:path path="circle">');
      expect(slideXml).toContain('<a:srgbClr val="112233"/>');
    });

    it("不正な radial-gradient 構文は ParseXmlError になる", async () => {
      const xml = `<Slide><VStack w="100%" h="max">
        <Text w="200" h="100" backgroundGradient="radial-gradient(square, #FF0000, #0000FF)" text=""></Text>
      </VStack></Slide>`;
      await expect(buildPptx(xml, { w: 1280, h: 720 })).rejects.toThrow(
        ParseXmlError,
      );
    });
  });
});

describe("buildPptx with textGradient", () => {
  it("Text の textGradient が text run の gradFill として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text fontSize="32" textGradient="linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)">Hello</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    // text run 内に gradFill が描画される (a:rPr 配下)
    expect(slideXml).toMatch(/<a:rPr[^>]*><a:gradFill/);
    expect(slideXml).toContain(
      "<a:gradFill><a:gsLst>" +
        '<a:gs pos="0"><a:srgbClr val="38BDF8"/></a:gs>' +
        '<a:gs pos="100000"><a:srgbClr val="A78BFA"/></a:gs>' +
        '</a:gsLst><a:lin ang="0" scaled="1"/></a:gradFill>',
    );
    expect(slideXml).not.toContain("pom-text:");
  });

  it("textGradient 指定時は node の color よりも gradient が優先される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text fontSize="24" color="FF0000" textGradient="linear-gradient(#0000FF, #00FF00)">x</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    // gradient のカラーストップが出力される
    expect(slideXml).toContain('<a:srgbClr val="0000FF"/>');
    expect(slideXml).toContain('<a:srgbClr val="00FF00"/>');
    // 元の color (FF0000) は単色塗りとしては残らない
    expect(slideXml).not.toContain(
      '<a:solidFill><a:srgbClr val="FF0000"/></a:solidFill>',
    );
  });

  it("textGradient は runs (Span) の color も含め全 run に適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text fontSize="24" textGradient="linear-gradient(90deg, #11998E, #38EF7D)">A<Span color="FF0000">B</Span>C</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    // 3 つの text run 全てが gradient で塗られる
    const gradFillCount = (slideXml.match(/<a:gradFill/g) ?? []).length;
    expect(gradFillCount).toBeGreaterThanOrEqual(3);
    // Span の color (FF0000) は単色塗りとしては残らない
    expect(slideXml).not.toContain(
      '<a:solidFill><a:srgbClr val="FF0000"/></a:solidFill>',
    );
  });

  it("textGradient と backgroundGradient が同 Text 上で併用できる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="240" h="80" fontSize="24"
            backgroundGradient="linear-gradient(90deg, #0F172A, #1E293B)"
            textGradient="linear-gradient(90deg, #38BDF8, #A78BFA)">Hi</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = await pptx.write({
      outputType: "uint8array",
    });
    const slideXml = await readSlideXml(buffer);

    // それぞれのカラーストップが出力される
    expect(slideXml).toContain('<a:srgbClr val="0F172A"/>');
    expect(slideXml).toContain('<a:srgbClr val="1E293B"/>');
    expect(slideXml).toContain('<a:srgbClr val="38BDF8"/>');
    expect(slideXml).toContain('<a:srgbClr val="A78BFA"/>');
    // gradFill が 2 つ以上 (背景 + 文字) 描画される
    const gradFillCount = (slideXml.match(/<a:gradFill/g) ?? []).length;
    expect(gradFillCount).toBeGreaterThanOrEqual(2);
  });

  it("不正な textGradient 構文は ParseXmlError になる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text textGradient="linear-gradient(broken)">x</Text>
    </VStack></Slide>`;
    await expect(buildPptx(xml, { w: 1280, h: 720 })).rejects.toThrow(
      ParseXmlError,
    );
  });

  it("textGradient は radial-gradient を受け付けない (ParseXmlError)", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text textGradient="radial-gradient(circle at center, #38BDF8, #A78BFA)">x</Text>
    </VStack></Slide>`;
    await expect(buildPptx(xml, { w: 1280, h: 720 })).rejects.toThrow(
      ParseXmlError,
    );
  });
});
