import JSZip from "jszip";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { buildPptx } from "../buildPptx.ts";
import { GlowEffectRegistry } from "./glowEffects.ts";

async function readSlideXml(buffer: Uint8Array | ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("ppt/slides/slide1.xml")!.async("text");
}

describe("GlowEffectRegistry", () => {
  it("同一スペックには同じマーカーを返し、異なるスペックには別マーカーを返す", () => {
    const registry = new GlowEffectRegistry();
    const m1 = registry.register({ size: 8, opacity: 0.5, color: "FF3399" });
    const m2 = registry.register({ size: 8, opacity: 0.5, color: "FF3399" });
    const m3 = registry.register({ size: 12, opacity: 0.5, color: "FF3399" });
    expect(m1).toBe(m2);
    expect(m3).not.toBe(m1);
    expect(registry.entries).toHaveLength(2);
  });

  it("マーカーは pom-glow: プレフィックス付き連番になる", () => {
    const registry = new GlowEffectRegistry();
    const m1 = registry.register({ size: 8 });
    const m2 = registry.register({ size: 12 });
    expect(m1).toBe("pom-glow:0");
    expect(m2).toBe("pom-glow:1");
  });

  it("色は # を取り除いて大文字に正規化する", () => {
    const registry = new GlowEffectRegistry();
    const m1 = registry.register({ color: "#ff3399" });
    const m2 = registry.register({ color: "FF3399" });
    expect(m1).toBe(m2);
  });
});

describe("buildPptx with Shape glow", () => {
  it("Shape の glow がネイティブの effectLst として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="100" h="100" fill.color="FF0000" glow.size="12" glow.opacity="0.5" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // 12 px = 114300 EMU (12 * 9525)
    expect(slideXml).toContain(
      '<a:effectLst><a:glow rad="114300"><a:srgbClr val="00FF00"><a:alpha val="50000"/></a:srgbClr></a:glow></a:effectLst>',
    );
    expect(slideXml).not.toContain("pom-glow:");
  });

  it("Shape glow 単独でも stream 経路で effectLst として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="100" h="100" fill.color="FF0000" glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.stream({ compression: true })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:effectLst><a:glow");
  });

  it("Shape glow 単独でも default write 経路で effectLst として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="100" h="100" fill.color="FF0000" glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const blob = (await pptx.write()) as Blob;
    const slideXml = await readSlideXml(await blob.arrayBuffer());

    expect(slideXml).toContain("<a:effectLst><a:glow");
  });

  it("Shape の outline は line のエイリアスとして反映される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" outline.size="3" outline.color="0088CC"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // 3 px = 2.25 pt → 28575 EMU (pptxgenjs が w 属性に EMU を入れる)
    // outline.color が ln 要素内の solidFill に反映されることを確認
    expect(slideXml).toMatch(/<a:ln[^>]*w="28575"/);
    expect(slideXml).toContain('<a:srgbClr val="0088CC"/>');
  });

  it("Shape に line と outline 両方指定された場合は outline が優先される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" line.color="111111" line.width="1" outline.size="5" outline.color="EEEEEE"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain('<a:srgbClr val="EEEEEE"/>');
    expect(slideXml).not.toContain('<a:srgbClr val="111111"/>');
  });

  it("複数 Shape で同じ glow を指定した場合に同じ marker / effectLst が複数挿入される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="50" h="50" fill.color="AAAAAA" glow.size="8" glow.color="FF0000"/>
      <Shape shapeType="ellipse" w="50" h="50" fill.color="BBBBBB" glow.size="8" glow.color="FF0000"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml.match(/<a:effectLst><a:glow/g)).toHaveLength(2);
    expect(slideXml).not.toContain("pom-glow:");
  });

  it("glow / outline 未指定時は effectLst / 余計な ln が挿入されない", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" fill.color="ABCDEF"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).not.toContain("<a:effectLst><a:glow");
    expect(slideXml).not.toContain("pom-glow");
  });

  it("Shape の text 指定時も glow が effectLst として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" text="Hi" w="100" h="100" fill.color="FF0000" glow.size="10" glow.color="00FFFF"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:effectLst><a:glow");
    expect(slideXml).not.toContain("pom-glow:");
  });

  it("Icon variant の背景図形に glow / outline が適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Icon name="star" variant="circle-filled" bgColor="FF0000" glow.size="8" glow.color="FFFF00" outline.size="2" outline.color="00AAFF"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:effectLst><a:glow");
    expect(slideXml).toContain('name="pom-glow:0"');
    expect(slideXml).toContain('<a:srgbClr val="00AAFF"/>');
  });

  it("writeFile でも glow 後処理が適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="100" h="100" fill.color="FF0000" glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-glow-"));
    const filePath = path.join(tmpDir, "out.pptx");
    try {
      await pptx.writeFile({ fileName: filePath });
      const slideXml = await readSlideXml(fs.readFileSync(filePath));
      expect(slideXml).toContain("<a:effectLst><a:glow");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it("gradFill と glow を同時指定しても双方が正しく出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="ellipse" w="100" h="100" backgroundGradient="linear-gradient(90deg, #FF0000, #0000FF)" glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).toContain("<a:glow");
  });

  it("Text glimpse writer と Shape glow を併用しても stream 経路で双方が出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text fontSize="24">Hello</Text>
      <Shape shapeType="ellipse" w="100" h="100" fill.color="FF0000" glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.stream({ compression: true })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:t>Hello</a:t>");
    expect(slideXml).toContain("<a:glow");
    expect(slideXml).not.toContain("pom-text:");
  });

  it("shadow と glow を併用した shape で effectLst が 1 つに統合される", async () => {
    // pptxgenjs は shadow 指定時に <a:spPr> 配下に <a:effectLst><a:outerShdw/></a:effectLst>
    // を出力する。glow を追加する際に新たな <a:effectLst> を別途並べると
    // OOXML として不正になるため、既存 effectLst の内側に <a:glow> を追加する。
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" fill.color="FF0000"
        shadow.type="outer" shadow.blur="4" shadow.offset="2" shadow.color="000000"
        glow.size="8" glow.color="00FF00"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // 該当 shape の <p:spPr> に effectLst は 1 つだけ存在し、その中に
    // outerShdw と glow の両方が含まれる
    const glowStart = slideXml.indexOf("<a:glow");
    expect(glowStart).toBeGreaterThanOrEqual(0);
    const spStart = slideXml.lastIndexOf("<p:sp>", glowStart);
    const spEnd = slideXml.indexOf("</p:sp>", spStart);
    const spBlock = slideXml.substring(spStart, spEnd);
    expect(spBlock.match(/<a:effectLst[^>]*>/g)).toHaveLength(1);
    expect(spBlock).toContain("<a:outerShdw");
    expect(spBlock).toContain("<a:glow");
  });

  it("Shape の outline.color のみ指定時、line.width は既存値 (なければ default) を保持する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" line.width="2" outline.color="AABBCC"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // outline.color で AABBCC、line.width=2px → 1.5pt → 19050 EMU
    expect(slideXml).toContain('<a:srgbClr val="AABBCC"/>');
    expect(slideXml).toMatch(/<a:ln[^>]*w="19050"/);
  });

  it("Shape の outline.size のみ指定時、line.color は既存値を保持する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Shape shapeType="rect" w="100" h="100" line.color="112233" outline.size="4"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // outline.size=4px → 3pt → 38100 EMU、line.color の 112233 を維持
    expect(slideXml).toContain('<a:srgbClr val="112233"/>');
    expect(slideXml).toMatch(/<a:ln[^>]*w="38100"/);
  });

  it("Icon outlined variant + outline.color のみ指定時、variant 既定の 1.5pt 太さを保持する", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Icon name="star" color="111111" variant="circle-outlined" outline.color="AABBCC"/>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    // outline.color で AABBCC、太さは variant default の 1.5pt → 19050 EMU を維持
    expect(slideXml).toContain('<a:srgbClr val="AABBCC"/>');
    expect(slideXml).toMatch(/<a:ln[^>]*w="19050"/);
  });
});
