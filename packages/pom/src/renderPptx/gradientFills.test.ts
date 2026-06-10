import JSZip from "jszip";
import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { buildPptx } from "../buildPptx.ts";
import { GradientFillRegistry } from "./gradientFills.ts";

async function readSlideXml(buffer: Uint8Array): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  return zip.file("ppt/slides/slide1.xml")!.async("text");
}

describe("GradientFillRegistry", () => {
  const gradient = {
    angle: 90,
    stops: [
      { color: "FF0000", position: 0 },
      { color: "0000FF", position: 100 },
    ],
  };

  it("同一スペックには同じマーカーを返し、異なるスペックには別マーカーを返す", () => {
    const registry = new GradientFillRegistry();
    const marker1 = registry.register(gradient);
    const marker2 = registry.register({ ...gradient });
    const marker3 = registry.register(gradient, 0.5);
    expect(marker1).toMatch(/^[0-9A-F]{6}$/);
    expect(marker2).toBe(marker1);
    expect(marker3).not.toBe(marker1);
    expect(registry.entries).toHaveLength(2);
  });

  it("予約済みの色はマーカーとして使用しない", () => {
    const plain = new GradientFillRegistry();
    const firstMarker = plain.register(gradient);

    const registry = new GradientFillRegistry();
    registry.reserveColors(`<Text backgroundColor="${firstMarker}"/>`);
    expect(registry.register(gradient)).not.toBe(firstMarker);
  });
});

describe("buildPptx with backgroundGradient", () => {
  it("shape の背景がネイティブの gradFill として出力される", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(45deg, #FF0000 0%, #0000FF 100%)" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain(
      '<a:gradFill flip="none" rotWithShape="1"><a:gsLst>' +
        '<a:gs pos="0"><a:srgbClr val="FF0000"/></a:gs>' +
        '<a:gs pos="100000"><a:srgbClr val="0000FF"/></a:gs>' +
        '</a:gsLst><a:lin ang="18900000" scaled="0"/></a:gradFill>',
    );
  });

  it("ルートノードの backgroundGradient はスライド背景 (p:bgPr) に適用される", async () => {
    const xml = `<Slide><VStack w="100%" h="max" backgroundGradient="linear-gradient(to right, #11998E, #38EF7D)">
      <Text fontSize="24">test</Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toMatch(/<p:bgPr><a:gradFill/);
    expect(slideXml).toContain('<a:lin ang="0" scaled="0"/>');
  });

  it("opacity 指定時は各カラーストップに alpha が付く", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(#FF0000, #0000FF)" opacity="0.5" text=""></Text>
    </VStack></Slide>`;
    const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
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
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).not.toContain("ABCDEF");
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
    const buffer = (await pptx.write({
      outputType: "uint8array",
    })) as Uint8Array;
    const slideXml = await readSlideXml(buffer);

    expect(slideXml).not.toContain("<a:gradFill");
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
  });

  it("不正なグラデーション構文は ParseXmlError になる", async () => {
    const xml = `<Slide><VStack w="100%" h="max">
      <Text w="200" h="100" backgroundGradient="linear-gradient(invalid)" text=""></Text>
    </VStack></Slide>`;
    await expect(buildPptx(xml, { w: 1280, h: 720 })).rejects.toThrow();
  });
});
