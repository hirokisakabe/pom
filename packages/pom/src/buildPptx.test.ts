import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import JSZip from "jszip";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildPptx, type FontInput } from "./buildPptx.ts";
import { DiagnosticsError } from "./diagnostics.ts";
import * as measureTextModule from "./calcYogaLayout/measureText.ts";
import {
  CUSTOM_FONT_BOLD,
  CUSTOM_FONT_REGULAR,
} from "./testFixtures/customFont.ts";
import {
  createWritablePptx,
  type PptxOutputType,
  type PptxWriteOptions,
  type PptxWriteOutput,
} from "./renderPptx/writablePptx.ts";

const ONE_BY_ONE_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lU9qJwAAAABJRU5ErkJggg==",
  "base64",
);

type GlimpseCompatibleFontBuffer = {
  name?: string;
  data: ArrayBuffer | Uint8Array;
};

expectTypeOf<GlimpseCompatibleFontBuffer>().toMatchTypeOf<FontInput>();

afterEach(() => vi.restoreAllMocks());

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

  it("異なる custom font registry で並列実行しても干渉しない", async () => {
    const spy = vi.spyOn(measureTextModule, "measureText");
    const regularXml = `<Slide><Text fontFamily="Parallel Regular">WWW Hello</Text></Slide>`;
    const boldXml = `<Slide><Text fontFamily="Parallel Bold">WWW Hello</Text></Slide>`;

    await Promise.all([
      buildPptx(regularXml, slideSize, {
        autoFit: false,
        fonts: [{ ...CUSTOM_FONT_REGULAR, name: "Parallel Regular" }],
      }),
      buildPptx(boldXml, slideSize, {
        autoFit: false,
        fonts: [
          {
            ...CUSTOM_FONT_BOLD,
            name: "Parallel Bold",
            weight: "normal",
          },
        ],
      }),
    ]);

    const regularCall = spy.mock.calls.find(
      ([, , options]) => options.fontFamily === "Parallel Regular",
    );
    const boldCall = spy.mock.calls.find(
      ([, , options]) => options.fontFamily === "Parallel Bold",
    );
    expect(regularCall?.[4]).toBeDefined();
    expect(boldCall?.[4]).toBeDefined();
    expect(regularCall?.[4]).not.toBe(boldCall?.[4]);
    expect(regularCall?.[4]?.hasFont("Parallel Regular", "normal")).toBe(true);
    expect(boldCall?.[4]?.hasFont("Parallel Bold", "normal")).toBe(true);
    expect(regularCall?.[4]?.hasFont("Parallel Bold", "normal")).toBe(false);
    expect(boldCall?.[4]?.hasFont("Parallel Regular", "normal")).toBe(false);

    spy.mockRestore();
  });
});

describe("buildPptx custom fonts", () => {
  it("Text / Ul / Ol / Shape の計測経路へ registry を渡す", async () => {
    const spy = vi.spyOn(measureTextModule, "measureText");
    const xml = `<Slide><VStack>
      <Text fontFamily="Custom Fixture">Text</Text>
      <Ul fontFamily="Custom Fixture"><Li>Ul</Li></Ul>
      <Ol fontFamily="Custom Fixture"><Li>Ol</Li></Ol>
      <Shape shapeType="rect" text="Shape" fontFamily="Custom Fixture" />
    </VStack></Slide>`;

    await buildPptx(
      xml,
      { w: 1280, h: 720 },
      {
        autoFit: false,
        fonts: [CUSTOM_FONT_REGULAR],
      },
    );

    const customCalls = spy.mock.calls.filter(
      ([, , options]) => options.fontFamily === "Custom Fixture",
    );
    expect(customCalls).toHaveLength(4);
    for (const expectedText of ["Text", "Ul", "Ol", "Shape"]) {
      expect(customCalls.some(([text]) => text === expectedText)).toBe(true);
    }
    expect(
      customCalls.every((call) => call[4]?.hasFont("Custom Fixture", "normal")),
    ).toBe(true);
    spy.mockRestore();
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

  it("同じURL画像を複数箇所で使っても一度だけ取得する", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(ONE_BY_ONE_PNG, {
          headers: { "content-type": "image/png" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const url = "https://example.com/shared.png";
      const xml = `<Slide><HStack><Image src="${url}" w="100" h="100"/><Image src="${url}" w="100" h="100"/></HStack></Slide>`;
      await buildPptx(xml, slideSize, { autoFit: false });
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
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

  it("Arrow が connector 非対応 node を参照する場合 ARROW_REF_NOT_CONNECTABLE が記録される", async () => {
    const xml = `<Slide><Layer id="container" w="1280" h="720"><Shape id="target" x="100" y="100" w="120" h="40" shapeType="rect"/><Arrow x="0" y="0" from="container" to="target" /></Layer></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toContainEqual({
      code: "ARROW_REF_NOT_CONNECTABLE",
      message:
        'Arrow: ID "container" does not reference a connector-compatible Shape geometry or Text node',
    });
  });

  it("Arrow が非対応 Shape geometry を参照する場合 ARROW_REF_NOT_CONNECTABLE が記録される", async () => {
    const xml = `<Slide><Layer w="1280" h="720"><Shape id="line-shape" x="100" y="100" w="120" h="40" shapeType="line"/><Shape id="target" x="300" y="100" w="120" h="40" shapeType="rect"/><Arrow x="0" y="0" from="line-shape" to="target" /></Layer></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toContainEqual({
      code: "ARROW_REF_NOT_CONNECTABLE",
      message:
        'Arrow: ID "line-shape" does not reference a connector-compatible Shape geometry or Text node',
    });
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

  it("borderRadius と辺ごとの border の併用は警告を出さず描画される", async () => {
    const xml = `<Slide><VStack><Text fontSize="24" borderRadius="8" borderLeft.color="FF0000">rounded</Text></VStack></Slide>`;
    const result = await buildPptx(xml, slideSize, { autoFit: false });
    expect(result.diagnostics).toEqual([]);
  });
});

describe("buildPptx SlideMaster margin", () => {
  const slideSize = { w: 1280, h: 720 };
  const xml = `<Slide><VStack><Text fontSize="24">margin test</Text></VStack></Slide>`;

  async function getMasterMargin(
    margin:
      number | { top?: number; right?: number; bottom?: number; left?: number },
  ): Promise<string> {
    const { pptx } = await buildPptx(xml, slideSize, {
      master: { title: "M1", margin },
    });
    const buffer = await pptx.write({ outputType: "uint8array" });
    const zip = await JSZip.loadAsync(buffer);
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    return slideXml.match(/<a:bodyPr\b([^>]*)/)?.[1] ?? "";
  }

  it("number 指定は 4 辺等値の EMU として layout 参照スライドへ反映される", async () => {
    expect(await getMasterMargin(96)).toMatch(
      /lIns="914400" rIns="914400" tIns="914400" bIns="914400"/,
    );
  });

  it("object 指定は未指定 edge を 0 として layout 参照スライドへ反映される", async () => {
    expect(await getMasterMargin({ top: 96, left: 48 })).toMatch(
      /lIns="457200" rIns="0" tIns="914400" bIns="0"/,
    );
  });
});

describe("buildPptx SlideMaster authoring", () => {
  it("master objects・URL画像・既定サイズのslideNumberをOOXMLへ出力する", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(ONE_BY_ONE_PNG, {
          headers: { "content-type": "image/png" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);
    try {
      const { pptx, diagnostics } = await buildPptx(
        `<Slide><Text>Hello</Text></Slide>`,
        { w: 1280, h: 720 },
        {
          autoFit: false,
          master: {
            background: { image: "https://example.com/background.png" },
            objects: [
              {
                type: "text",
                text: "Master title",
                x: 10,
                y: 10,
                w: 200,
                h: 30,
                color: "333",
              },
              {
                type: "image",
                src: "https://example.com/logo.png",
                x: 10,
                y: 50,
                w: 40,
                h: 40,
              },
              {
                type: "rect",
                x: 0,
                y: 0,
                w: 100,
                h: 20,
                fill: { color: "ABC", transparency: 25 },
                border: { color: "000", width: 1, dashType: "dash" },
              },
              {
                type: "line",
                x: 0,
                y: 100,
                w: 100,
                h: 0,
                line: { color: "333", width: 2 },
              },
            ],
            slideNumber: { x: 1100, y: 680, color: "333" },
          },
        },
      );
      const zip = await JSZip.loadAsync(
        await pptx.write({ outputType: "uint8array" }),
      );
      const masterXml = await zip
        .file("ppt/slideMasters/slideMaster1.xml")!
        .async("text");

      expect(diagnostics).toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(masterXml).toContain("333333");
      expect(masterXml).toContain("AABBCC");
      expect(masterXml).toContain('<a:prstDash val="dash"/>');
      expect(masterXml).toContain("<p:pic>");
      expect(masterXml).toContain('type="slidenum"');
      expect(masterXml).toMatch(/cx="800000" cy="300000"/);
      expect(zip.file(/^ppt\/media\//)).toHaveLength(2);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("buildPptx output facade", () => {
  const xml = `<Slide><Text>Hello</Text></Slide>`;
  const slideSize = { w: 1280, h: 720 };

  it("write と stream で PPTX bytes を返す", async () => {
    const { pptx } = await buildPptx(xml, slideSize, { autoFit: false });
    const arrayBuffer = await pptx.write({ outputType: "arraybuffer" });
    const uint8array = await pptx.write({ outputType: "uint8array" });
    const nodeBuffer = await pptx.write({ outputType: "nodebuffer" });
    const stream = await pptx.stream();

    expect(new Uint8Array(arrayBuffer).slice(0, 2)).toEqual(
      new Uint8Array([0x50, 0x4b]),
    );
    expect(uint8array.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(nodeBuffer.subarray(0, 2)).toEqual(Buffer.from([0x50, 0x4b]));
    expect(stream.slice(0, 2)).toEqual(new Uint8Array([0x50, 0x4b]));
    expect(await pptx.write({ outputType: "base64" })).toMatch(/^UEs/);
    expectTypeOf(nodeBuffer).toEqualTypeOf<Buffer>();

    const options: PptxWriteOptions = { outputType: "uint8array" };
    expectTypeOf(pptx.write(options)).toEqualTypeOf<
      Promise<PptxWriteOutput<PptxOutputType | undefined>>
    >();
  });

  it("writeFile は拡張子を補ってファイルへ保存する", async () => {
    const { pptx } = await buildPptx(xml, slideSize, { autoFit: false });
    const directory = await mkdtemp(join(tmpdir(), "pom-output-"));
    const fileName = join(directory, "presentation");

    expect(await pptx.writeFile(fileName)).toBe(`${fileName}.pptx`);
    expect((await readFile(`${fileName}.pptx`)).subarray(0, 2)).toEqual(
      Buffer.from([0x50, 0x4b]),
    );
  });

  it("write と stream の同期シリアライズ例外を rejected Promise にする", async () => {
    const pptx = createWritablePptx(() => {
      throw new Error("serialize failed");
    });

    await expect(pptx.write()).rejects.toThrow("serialize failed");
    await expect(pptx.stream()).rejects.toThrow("serialize failed");
  });

  it("ブラウザ保存ではクリック後に anchor と Object URL を解放する", async () => {
    vi.useFakeTimers();
    const append = vi.fn();
    const remove = vi.fn();
    const revokeObjectURL = vi.fn();
    const anchor = {
      href: "",
      download: "",
      click: vi.fn(() => {
        expect(revokeObjectURL).not.toHaveBeenCalled();
      }),
      remove,
    };
    vi.stubGlobal("document", {
      createElement: vi.fn(() => anchor),
      body: { append },
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:presentation"),
      revokeObjectURL,
    });

    try {
      const { pptx } = await buildPptx(xml, slideSize, { autoFit: false });
      await expect(pptx.writeFile("browser-output")).resolves.toBe(
        "browser-output.pptx",
      );

      expect(append).toHaveBeenCalledWith(anchor);
      expect(anchor.click).toHaveBeenCalledOnce();
      expect(remove).not.toHaveBeenCalled();
      expect(revokeObjectURL).not.toHaveBeenCalled();

      await vi.runAllTimersAsync();
      expect(remove).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:presentation");
    } finally {
      vi.useRealTimers();
      vi.unstubAllGlobals();
    }
  });

  it("ブラウザ保存のクリック失敗時にも anchor と Object URL を解放する", async () => {
    const remove = vi.fn();
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        href: "",
        download: "",
        click: vi.fn(() => {
          throw new Error("click failed");
        }),
        remove,
      })),
      body: { append: vi.fn() },
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:presentation"),
      revokeObjectURL,
    });

    try {
      const { pptx } = await buildPptx(xml, slideSize, { autoFit: false });
      await expect(pptx.writeFile("browser-output")).rejects.toThrow(
        "click failed",
      );
      expect(remove).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:presentation");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("ブラウザ保存の anchor 作成失敗時にも Object URL を解放する", async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("document", {
      createElement: vi.fn(() => {
        throw new Error("createElement failed");
      }),
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:presentation"),
      revokeObjectURL,
    });

    try {
      const { pptx } = await buildPptx(xml, slideSize, { autoFit: false });
      await expect(pptx.writeFile("browser-output")).rejects.toThrow(
        "createElement failed",
      );
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:presentation");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
