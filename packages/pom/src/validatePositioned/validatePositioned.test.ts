import { describe, expect, it } from "vitest";
import { buildPptx } from "../buildPptx.ts";

const slideSize = { w: 1280, h: 720 };

async function getDiagnostics(xml: string) {
  const result = await buildPptx(xml, slideSize, { autoFit: false });
  return result.diagnostics;
}

describe("validatePositioned NODE_OUT_OF_BOUNDS", () => {
  it("スライド幅を超えるノードで該当ノードを特定できる警告が出る", async () => {
    const xml = `<Slide><VStack><Text id="wide-text" w="2000" fontSize="24">wide</Text></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    const found = diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('<Text id="wide-text">');
    expect(found[0].message).toContain("right by");
  });

  it("スライド高を超えるノードで警告が出る", async () => {
    const xml = `<Slide><VStack><Shape shapeType="rect" w="200" h="1000" /></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    const found = diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("<Shape>");
    expect(found[0].message).toContain("bottom by");
  });

  it("親ごとはみ出す場合は原因に最も近い最深のノードのみ報告される", async () => {
    const xml = `<Slide><VStack id="root"><VStack id="outer" w="2000"><Text id="inner" w="2000" fontSize="24">wide</Text></VStack></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    const found = diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('id="inner"');
  });

  it("2 枚目のスライドの警告にはスライド番号が含まれる", async () => {
    const xml = `
      <Slide><VStack><Text fontSize="24">ok</Text></VStack></Slide>
      <Slide><VStack><Text w="2000" fontSize="24">wide</Text></VStack></Slide>
    `;
    const diagnostics = await getDiagnostics(xml);
    const found = diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain("slide 2:");
  });

  it("rotate 指定のノードは回転後境界が不明なため警告しない", async () => {
    const xml = `<Slide><VStack><Text w="2000" rotate="45" fontSize="24">rotated</Text></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(
      diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS"),
    ).toHaveLength(0);
  });

  it("スライド内に収まるノードでは警告が出ない", async () => {
    const xml = `<Slide><VStack padding="40" gap="16"><Text fontSize="24">a</Text><Text fontSize="24">b</Text></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(
      diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS"),
    ).toHaveLength(0);
  });
});

describe("validatePositioned NODE_OVERLAP", () => {
  it("HStack 内で relative オフセットにより重なる兄弟で警告が出る", async () => {
    const xml = `<Slide><HStack><Shape id="a" shapeType="rect" w="200" h="100" /><Shape id="b" shapeType="rect" w="200" h="100" left="-100" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    const found = diagnostics.filter((d) => d.code === "NODE_OVERLAP");
    expect(found).toHaveLength(1);
    expect(found[0].message).toContain('id="a"');
    expect(found[0].message).toContain('id="b"');
    expect(found[0].message).toContain("overlap by");
  });

  it("VStack 内で relative オフセットにより重なる兄弟で警告が出る", async () => {
    const xml = `<Slide><VStack><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" top="-50" /></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      1,
    );
  });

  it("重ならない兄弟では警告が出ない", async () => {
    const xml = `<Slide><HStack gap="16"><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });
});

describe("validatePositioned 意図的な重なりの除外 (誤検知防止)", () => {
  it("Layer 配下の子同士の重なりでは警告が出ない", async () => {
    const xml = `<Slide><Layer w="1280" h="720"><Shape x="100" y="100" shapeType="rect" w="200" h="100" /><Shape x="150" y="150" shapeType="rect" w="200" h="100" /></Layer></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });

  it('position="absolute" の子との重なりでは警告が出ない', async () => {
    const xml = `<Slide><HStack><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" position="absolute" top="0" left="50" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });

  it("負 gap のコンテナ内の重なりでは警告が出ない", async () => {
    const xml = `<Slide><HStack gap="-50"><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });

  it("負 margin の子との重なりでは警告が出ない", async () => {
    const xml = `<Slide><HStack><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" margin="-50" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });

  it("zIndex 明示の子との重なりでは警告が出ない", async () => {
    const xml = `<Slide><HStack><Shape shapeType="rect" w="200" h="100" /><Shape shapeType="rect" w="200" h="100" zIndex="1" left="-100" /></HStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
  });

  it("ProcessArrow のデフォルト (負 gap による矢印の重なり) では警告が出ない", async () => {
    const xml = `<Slide><VStack><ProcessArrow w="1000" h="80"><ProcessArrowStep label="Plan" /><ProcessArrowStep label="Design" /><ProcessArrowStep label="Develop" /></ProcessArrow></VStack></Slide>`;
    const diagnostics = await getDiagnostics(xml);
    expect(diagnostics.filter((d) => d.code === "NODE_OVERLAP")).toHaveLength(
      0,
    );
    expect(
      diagnostics.filter((d) => d.code === "NODE_OUT_OF_BOUNDS"),
    ).toHaveLength(0);
  });
});
