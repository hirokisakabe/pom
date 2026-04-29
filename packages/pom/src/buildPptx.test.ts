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
});
