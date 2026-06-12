import { describe, expect, it, vi } from "vitest";
import { buildPptx } from "./buildPptx.ts";
import { DiagnosticsError } from "./diagnostics.ts";
import * as measureTextModule from "./calcYogaLayout/measureText.ts";

describe("buildPptx 並列実行", () => {
  const slideSize = { w: 1280, h: 720 };

  it("異なる textMeasurement モードで並列実行しても干渉しない", async () => {
    const xml = `<Slide><VStack><Text fontSize="24">テスト文字列</Text></VStack></Slide>`;

    const spy = vi.spyOn(measureTextModule, "measureText");

    // 異なる textMeasurement オプションで並列実行
    const [resultOpentype, resultFallback] = await Promise.all([
      buildPptx(xml, slideSize, {
        textMeasurement: "opentype",
        autoFit: false,
      }),
      buildPptx(xml, slideSize, {
        textMeasurement: "fallback",
        autoFit: false,
      }),
    ]);

    // 両方とも正常に完了すること
    expect(resultOpentype.pptx).toBeDefined();
    expect(resultFallback.pptx).toBeDefined();

    // measureText の呼び出しで各モードが正しく渡されていることを検証
    const opentypeCalls = spy.mock.calls.filter(
      (args) => args[3] === "opentype",
    );
    const fallbackCalls = spy.mock.calls.filter(
      (args) => args[3] === "fallback",
    );
    expect(opentypeCalls.length).toBeGreaterThan(0);
    expect(fallbackCalls.length).toBeGreaterThan(0);

    spy.mockRestore();
  });

  it("同一オプションで並列実行してもキャッシュが干渉しない", async () => {
    const xml1 = `<Slide><VStack><Text fontSize="20">文字列A</Text></VStack></Slide>`;
    const xml2 = `<Slide><VStack><Text fontSize="30">文字列B</Text></VStack></Slide>`;

    const [result1, result2] = await Promise.all([
      buildPptx(xml1, slideSize, { autoFit: false }),
      buildPptx(xml2, slideSize, { autoFit: false }),
    ]);

    expect(result1.pptx).toBeDefined();
    expect(result2.pptx).toBeDefined();
  });

  it("Icon を含む並列実行でキャッシュが干渉しない", async () => {
    const xml1 = `<Slide><VStack><Icon name="star" size="32" color="#FF0000" /></VStack></Slide>`;
    const xml2 = `<Slide><VStack><Icon name="heart" size="48" color="#0000FF" /></VStack></Slide>`;

    const [result1, result2] = await Promise.all([
      buildPptx(xml1, slideSize, { autoFit: false }),
      buildPptx(xml2, slideSize, { autoFit: false }),
    ]);

    expect(result1.pptx).toBeDefined();
    expect(result2.pptx).toBeDefined();
  });
});

describe("buildPptx diagnostics", () => {
  const slideSize = { w: 1280, h: 720 };

  it("正常なビルドでは diagnostics が空配列", async () => {
    const xml = `<Slide><VStack><Text fontSize="24">Hello</Text></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toEqual([]);
  });

  it("画像測定失敗時に IMAGE_MEASURE_FAILED が記録される", async () => {
    const xml = `<Slide><VStack><Image src="nonexistent-file.png" /></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics.length).toBeGreaterThan(0);
    expect(result.diagnostics[0].code).toBe("IMAGE_MEASURE_FAILED");
  });

  it("strict: true で diagnostics がある場合 DiagnosticsError をスロー", async () => {
    const xml = `<Slide><VStack><Image src="nonexistent-file.png" /></VStack></Slide>`;
    await expect(
      buildPptx(xml, slideSize, { autoFit: false, strict: true }),
    ).rejects.toThrow(DiagnosticsError);
  });

  it("strict: true で diagnostics がない場合は正常に返る", async () => {
    const xml = `<Slide><VStack><Text fontSize="24">Hello</Text></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, {
      autoFit: false,
      strict: true,
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.pptx).toBeDefined();
  });

  it("Arrow の参照先 ID が存在しない場合 ARROW_REF_NOT_FOUND が記録される", async () => {
    const xml = `<Slide><Layer w="1280" h="720"><Arrow x="0" y="0" from="nonexistent" to="also-nonexistent" /></Layer></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(
      result.diagnostics.some((d) => d.code === "ARROW_REF_NOT_FOUND"),
    ).toBe(true);
  });

  it("Arrow が有効な ID を参照する場合は正常にビルドできる", async () => {
    const xml = `<Slide><Layer w="1280" h="720"><Shape id="a" x="100" y="100" w="120" h="40" shapeType="rect">A</Shape><Shape id="b" x="100" y="200" w="120" h="40" shapeType="rect">B</Shape><Arrow x="0" y="0" from="a" to="b" endArrow="true" /></Layer></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toEqual([]);
    expect(result.pptx).toBeDefined();
  });

  it("Theme トークン参照を含む XML をビルドできる", async () => {
    const xml = `
      <Theme surface="1E293B" accent="38BDF8" textMain="F8FAFC" />
      <Slide>
        <VStack backgroundColor="$surface" padding="48" gap="16">
          <Text fontSize="28" color="$textMain">Theme test</Text>
          <Timeline dateColor="$accent" titleColor="$textMain" w="800" h="160">
            <TimelineItem date="Q1" title="Phase 1" color="$accent" />
            <TimelineItem date="Q2" title="Phase 2" />
          </Timeline>
        </VStack>
      </Slide>
    `;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toEqual([]);
    expect(result.pptx).toBeDefined();
  });

  it("辺ごとの border のみのビルドでは diagnostics が空配列", async () => {
    const xml = `<Slide><VStack><Text fontSize="24" borderLeft.color="FF0000" borderLeft.width="4">accent</Text></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toEqual([]);
  });

  it("borderRadius と辺ごとの border の併用で PER_SIDE_BORDER_WITH_RADIUS が記録される", async () => {
    const xml = `<Slide><VStack><Text fontSize="24" borderRadius="8" borderLeft.color="FF0000">rounded</Text></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(
      result.diagnostics.some((d) => d.code === "PER_SIDE_BORDER_WITH_RADIUS"),
    ).toBe(true);
  });
});

describe("buildPptx SlideMaster margin", () => {
  const slideSize = { w: 1280, h: 720 };
  const xml = `<Slide><VStack><Text fontSize="24">margin test</Text></VStack></Slide>`;

  async function getMasterMargin(
    margin:
      | number
      | { top?: number; right?: number; bottom?: number; left?: number },
  ): Promise<unknown> {
    const { pptx } = await buildPptx(xml, slideSize, {
      master: { title: "M1", margin },
    });
    const layouts = (
      pptx as unknown as { slideLayouts: { _name: string; _margin: unknown }[] }
    ).slideLayouts;
    return layouts.find((l) => l._name === "M1")?._margin;
  }

  it("number 指定は 4 辺等値の配列 (inch) として渡される", async () => {
    // pptxgenjs では margin: n と [n, n, n, n] は同義 (全辺に適用)
    expect(await getMasterMargin(96)).toEqual([1, 1, 1, 1]);
  });

  it("object 指定は未指定 edge を 0 として [top, right, bottom, left] で渡される", async () => {
    expect(await getMasterMargin({ top: 96, left: 48 })).toEqual([
      1, 0, 0, 0.5,
    ]);
  });
});
