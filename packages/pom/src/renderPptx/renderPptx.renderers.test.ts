/**
 * ノード renderer の出力回帰テスト。
 *
 * renderPptx に PositionedNode を直接渡し、pptxgenjs 内部の
 * _slideObjects (描画オブジェクトの位置・スタイル) を検証することで、
 * renderer 内部のリファクタリングで public な出力挙動が変わっていない
 * ことを保証する。
 */
import JSZip from "jszip";
import { describe, expect, it, vi } from "vitest";
import { renderPptx } from "./renderPptx.ts";
import { createBuildContext } from "../buildContext.ts";
import { patchPptxWriteForGlimpseTextBoxes } from "./glimpseTextBoxes.ts";
import { pxToIn, pxToPt } from "./units.ts";
import type { PositionedNode } from "../types.ts";

type SlideObject = {
  _type: string;
  shape?: string;
  options: Record<string, unknown>;
  text?: unknown;
};

const ONE_BY_ONE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lU9qJwAAAABJRU5ErkJggg==";

async function renderPage(page: PositionedNode) {
  const buildContext = createBuildContext();
  const pptx = await renderPptx([page], { w: 1280, h: 720 }, buildContext);
  const slides = (
    pptx as unknown as { _slides: { _slideObjects: SlideObject[] }[] }
  )._slides;
  return { objects: slides[0]._slideObjects, buildContext };
}

async function renderPageSlideXml(page: PositionedNode) {
  const zip = await renderPagePptxZip(page);
  return zip.file("ppt/slides/slide1.xml")!.async("text");
}

async function renderPagePptxZip(page: PositionedNode) {
  const buildContext = createBuildContext();
  const pptx = await renderPptx([page], { w: 1280, h: 720 }, buildContext);
  patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);
  const buffer = (await pptx.write({
    outputType: "uint8array",
  })) as Uint8Array;
  return JSZip.loadAsync(buffer);
}

function vstackPage(children: PositionedNode[]): PositionedNode {
  return { type: "vstack", x: 0, y: 0, w: 1280, h: 720, children };
}

describe("renderShapeNode", () => {
  it("padding を除いたコンテンツ領域に EMU 変換して glimpse shape XML で描画される", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "shape",
          shapeType: "rect",
          x: 96,
          y: 96,
          w: 192,
          h: 96,
          padding: 24,
          fill: { color: "FF0000" },
        },
      ]),
    );

    expect(slideXml).toContain('<a:off x="1143000" y="1143000"/>');
    expect(slideXml).toContain('<a:ext cx="1371600" cy="457200"/>');
    expect(slideXml).toContain('<a:prstGeom prst="rect">');
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });

  it("rotate を glimpse shape XML に渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "shape",
          shapeType: "rect",
          x: 96,
          y: 96,
          w: 192,
          h: 96,
          rotate: 45,
        },
      ]),
    );

    expect(slideXml).toContain('<a:xfrm rot="2700000">');
  });

  it("shape text underline を glimpse shape run properties に渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "shape",
          shapeType: "rect",
          text: "underlined",
          x: 0,
          y: 0,
          w: 160,
          h: 80,
          underline: {
            style: "sng",
            color: "FF0000",
          },
        },
      ]),
    );

    expect(slideXml).toContain("<a:t>underlined</a:t>");
    expect(slideXml).toContain(
      '<a:uFill><a:solidFill><a:srgbClr val="FF0000"/>',
    );
  });
});

describe("renderTextNode", () => {
  it("rotate を通常テキストの glimpse text box XML に渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "text",
          text: "rotated",
          x: 0,
          y: 0,
          w: 160,
          h: 40,
          rotate: 15,
        },
      ]),
    );

    expect(slideXml).toContain('<a:xfrm rot="900000">');
    expect(slideXml).toContain("<a:t>rotated</a:t>");
    expect(slideXml).not.toContain("pom-text:");
  });

  it("rotate を inline runs テキストの glimpse text box XML に渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "text",
          text: "rotated",
          runs: [{ text: "rotated" }],
          x: 0,
          y: 0,
          w: 160,
          h: 40,
          rotate: -15,
        },
      ]),
    );

    expect(slideXml).toContain('<a:xfrm rot="-900000">');
    expect(slideXml).toContain("<a:t>rotated</a:t>");
    expect(slideXml).not.toContain("pom-text:");
  });

  it("inline run の hyperlink を slide XML と relationships に出力する", async () => {
    const zip = await renderPagePptxZip(
      vstackPage([
        {
          type: "text",
          text: "Visit site",
          runs: [
            { text: "Visit " },
            { text: "site", href: "https://example.com?a=1&b=2" },
          ],
          x: 0,
          y: 0,
          w: 240,
          h: 40,
        },
      ]),
    );
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const relsXml = await zip
      .file("ppt/slides/_rels/slide1.xml.rels")!
      .async("text");

    expect(slideXml).toMatch(/<a:hlinkClick r:id="rId\d+"\/>/);
    expect(relsXml).toContain(
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"',
    );
    expect(relsXml).toContain('Target="https://example.com?a=1&amp;b=2"');
    expect(relsXml).toContain('TargetMode="External"');
  });

  it("pptx.stream でも glimpse text box XML に置換する", async () => {
    const buildContext = createBuildContext();
    const pptx = await renderPptx(
      [
        vstackPage([
          {
            type: "text",
            text: "streamed",
            x: 0,
            y: 0,
            w: 160,
            h: 40,
          },
        ]),
      ],
      { w: 1280, h: 720 },
      buildContext,
    );
    patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);

    const buffer = (await pptx.stream({ compression: true })) as Uint8Array;
    const zip = await JSZip.loadAsync(buffer);
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");

    expect(slideXml).toContain("<a:t>streamed</a:t>");
    expect(slideXml).not.toContain("pom-text:");
  });

  it("pptx.write の default output でも glimpse text box XML に置換する", async () => {
    const buildContext = createBuildContext();
    const pptx = await renderPptx(
      [
        vstackPage([
          {
            type: "text",
            text: "blob output",
            x: 0,
            y: 0,
            w: 160,
            h: 40,
          },
        ]),
      ],
      { w: 1280, h: 720 },
      buildContext,
    );
    patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);

    const blob = (await pptx.write()) as Blob;
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");

    expect(slideXml).toContain("<a:t>blob output</a:t>");
    expect(slideXml).not.toContain("pom-text:");
  });

  it("browser writeFile helper が無い場合は marker を残さず利用案内エラーにする", async () => {
    const buildContext = createBuildContext();
    buildContext.glimpseTextBoxes.register({
      type: "text",
      text: "browser",
      x: 0,
      y: 0,
      w: 160,
      h: 40,
    });
    const originalWrite = vi.fn();
    const pptx = {
      write: originalWrite,
      writeFile: vi.fn(),
    } as unknown as Parameters<typeof patchPptxWriteForGlimpseTextBoxes>[0];

    vi.stubGlobal("process", { platform: "browser", versions: {} });
    try {
      patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);

      await expect(pptx.writeFile({ fileName: "browser" })).rejects.toThrow(
        "pptx.writeFile browser download helper is unavailable",
      );
      expect(originalWrite).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("browser writeFile helper がある場合は置換済み blob を渡す", async () => {
    const buildContext = createBuildContext();
    buildContext.glimpseTextBoxes.register({
      type: "text",
      text: "browser",
      x: 0,
      y: 0,
      w: 160,
      h: 40,
    });
    const inputZip = new JSZip();
    inputZip.file("ppt/slides/slide1.xml", "<p:sld/>");
    const originalWrite = vi
      .fn()
      .mockResolvedValue(await inputZip.generateAsync({ type: "uint8array" }));
    const writeFileToBrowser = vi.fn().mockResolvedValue("browser.pptx");
    const pptx = {
      write: originalWrite,
      writeFile: vi.fn(),
      writeFileToBrowser,
    } as unknown as Parameters<typeof patchPptxWriteForGlimpseTextBoxes>[0];

    vi.stubGlobal("process", { platform: "browser", versions: {} });
    try {
      patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);

      const writeFileWithRuntimeOverload = (fileName: string) =>
        (pptx.writeFile as unknown as (fileName: string) => Promise<string>)(
          fileName,
        );
      await expect(writeFileWithRuntimeOverload("browser")).resolves.toBe(
        "browser.pptx",
      );
      expect(writeFileToBrowser).toHaveBeenCalledWith(
        "browser.pptx",
        expect.any(Blob),
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("renderImageNode", () => {
  it("rotate を glimpse picture XML に渡す", async () => {
    const page = vstackPage([
      {
        type: "image",
        src: "sample_images/sample_0.png",
        x: 0,
        y: 0,
        w: 120,
        h: 80,
        rotate: 30,
      },
    ]);
    const zip = await renderPagePptxZip(page);
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const relsXml = await zip
      .file("ppt/slides/_rels/slide1.xml.rels")!
      .async("text");
    const contentTypesXml = await zip
      .file("[Content_Types].xml")!
      .async("text");

    expect(slideXml).toContain("<p:pic>");
    expect(slideXml).toContain('rot="1800000"');
    expect(slideXml).not.toContain("pom-picture:");
    expect(relsXml).toContain(
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"',
    );
    expect(relsXml).toContain('Target="../media/image');
    expect(contentTypesXml).toContain('ContentType="image/png"');
    expect(
      Object.keys(zip.files).some((file) =>
        /^ppt\/media\/image\d+\.png$/.test(file),
      ),
    ).toBe(true);
  });
});

describe("renderSvgNode", () => {
  it("Svg ラスタ画像を glimpse picture XML として描画する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "svg",
          svgContent: "<svg />",
          iconImageData: ONE_BY_ONE_PNG,
          x: 0,
          y: 0,
          w: 32,
          h: 32,
        },
      ]),
    );

    expect(slideXml).toContain("<p:pic>");
    expect(slideXml).not.toContain("pom-picture:");
  });
});

describe("renderIconNode", () => {
  it("rotate をアイコン画像の glimpse picture XML に渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "icon",
          name: "cpu",
          iconImageData: ONE_BY_ONE_PNG,
          x: 0,
          y: 0,
          w: 32,
          h: 32,
          rotate: 90,
        },
      ]),
    );

    expect(slideXml).toContain("<p:pic>");
    expect(slideXml).toContain('rot="5400000"');
    expect(slideXml).not.toContain("pom-picture:");
  });

  it("rotate を variant 背景図形にも渡す", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "icon",
          name: "cpu",
          iconImageData: ONE_BY_ONE_PNG,
          variant: "circle-filled",
          x: 0,
          y: 0,
          w: 56,
          h: 56,
          rotate: 90,
        },
      ]),
    );

    expect(slideXml).toContain("<p:sp>");
    expect(slideXml).toContain("<p:pic>");
    expect(slideXml.match(/rot="5400000"/g)).toHaveLength(2);
  });
});

describe("renderUlNode", () => {
  it("padding を除いたコンテンツ領域にテキストが配置される", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "ul",
          x: 0,
          y: 480,
          w: 384,
          h: 192,
          padding: { left: 48, top: 24 },
          fontSize: 24,
          items: [{ text: "a" }, { text: "b" }],
        },
      ]),
    );

    expect(objects).toHaveLength(1);
    expect(objects[0]._type).toBe("text");
    expect(objects[0].options).toMatchObject({
      x: pxToIn(48),
      y: pxToIn(480 + 24),
      w: pxToIn(384 - 48),
      h: pxToIn(192 - 24),
      fontSize: pxToPt(24),
      bullet: true,
    });
  });
});

describe("renderTimelineNode", () => {
  const items = [
    { date: "D1", title: "T1" },
    { date: "D2", title: "T2" },
  ];

  it("padding 分オフセットしたコンテンツ領域基準で線とノード円を描画する", async () => {
    // content = (148, 148, 704, 304)。intrinsic (240x128) より大きいため scaleFactor = 1
    const { objects, buildContext } = await renderPage(
      vstackPage([
        {
          type: "timeline",
          x: 100,
          y: 100,
          w: 800,
          h: 400,
          padding: 48,
          items,
        },
      ]),
    );
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "timeline",
          x: 100,
          y: 100,
          w: 800,
          h: 400,
          padding: 48,
          items,
        },
      ]),
    );

    expect(buildContext.diagnostics.items).toEqual([]);

    // メイン線: 端点は labelW/2 = 60 インセット、lineY はコンテンツ領域の垂直中央
    const lineY = 148 + 304 / 2;
    expect(slideXml).toContain(
      `<a:off x="${(148 + 60) * 9525}" y="${lineY * 9525}"/>`,
    );
    expect(slideXml).toContain(`<a:ext cx="${(704 - 120) * 9525}" cy="0"/>`);

    // 最初のアイテムのノード円 (半径 12px)
    const ellipse = objects.find((o) => o.shape === "ellipse");
    expect(ellipse?.options).toMatchObject({
      x: pxToIn(148 + 60 - 12),
      y: pxToIn(lineY - 12),
      w: pxToIn(24),
      h: pxToIn(24),
    });
  });

  it("割り当てが固有サイズの半分未満なら SCALE_BELOW_THRESHOLD を記録して 0.5 にクランプする", async () => {
    const { objects, buildContext } = await renderPage(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 100, h: 50, items }]),
    );

    expect(buildContext.diagnostics.items.map((d) => d.code)).toContain(
      "SCALE_BELOW_THRESHOLD",
    );

    // nodeRadius 12px が scaleFactor 0.5 でスケールされる
    const ellipse = objects.find((o) => o.shape === "ellipse");
    expect(ellipse?.options).toMatchObject({ w: pxToIn(12), h: pxToIn(12) });
  });

  it("connectorColor を指定すると軸線にその色が使われる", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "timeline",
          x: 0,
          y: 0,
          w: 800,
          h: 400,
          items,
          connectorColor: "1D4ED8",
        },
      ]),
    );
    expect(slideXml).toContain('<a:srgbClr val="1D4ED8"/>');
  });

  it("connectorColor 未指定なら従来通り E2E8F0 が使われる", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 800, h: 400, items }]),
    );
    expect(slideXml).toContain('<a:srgbClr val="E2E8F0"/>');
  });

  it("connectorGradient を指定すると軸線が native gradFill で描画される", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "timeline",
          x: 0,
          y: 0,
          w: 800,
          h: 400,
          items,
          connectorGradient: "linear-gradient(90deg, #1D4ED8 0%, #DC2626 100%)",
        },
      ]),
    );
    expect(slideXml).toContain("<a:gradFill");
    expect(slideXml).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(slideXml).toContain('<a:srgbClr val="DC2626"/>');
  });

  it("useColorForDate=true なら各 item.color が date テキスト色になる", async () => {
    const colored = [
      { date: "D1", title: "T1", color: "1D4ED8" },
      { date: "D2", title: "T2", color: "16A34A" },
    ];
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "timeline",
          x: 0,
          y: 0,
          w: 800,
          h: 400,
          items: colored,
          useColorForDate: true,
        },
      ]),
    );
    const findText = (label: string) =>
      objects.find(
        (o) =>
          Array.isArray(o.text) &&
          (o.text as { text: string }[]).some((r) => r.text === label),
      );
    expect(findText("D1")?.options.color).toBe("1D4ED8");
    expect(findText("D2")?.options.color).toBe("16A34A");
  });

  it("TimelineItem.dateColor は Timeline.dateColor / useColorForDate より優先される", async () => {
    const colored = [
      { date: "D1", title: "T1", color: "1D4ED8" },
      { date: "D2", title: "T2", color: "16A34A", dateColor: "DC2626" },
    ];
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "timeline",
          x: 0,
          y: 0,
          w: 800,
          h: 400,
          items: colored,
          dateColor: "111827",
          useColorForDate: true,
        },
      ]),
    );
    const findText = (label: string) =>
      objects.find(
        (o) =>
          Array.isArray(o.text) &&
          (o.text as { text: string }[]).some((r) => r.text === label),
      );
    // D1: useColorForDate により item.color (1D4ED8)、D2: per-item dateColor が最優先
    expect(findText("D1")?.options.color).toBe("1D4ED8");
    expect(findText("D2")?.options.color).toBe("DC2626");
  });

  it("fontFamily を指定すると全テキストの fontFace に反映される", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "timeline",
          x: 0,
          y: 0,
          w: 800,
          h: 400,
          items: [{ date: "D1", title: "T1", description: "Desc" }],
          fontFamily: "Arial",
        },
      ]),
    );
    const texts = objects.filter((o) => Array.isArray(o.text));
    expect(texts.length).toBeGreaterThanOrEqual(3);
    for (const t of texts) {
      expect(t.options.fontFace).toBe("Arial");
    }
  });

  it("fontFamily 未指定なら従来通り Noto Sans JP が使われる", async () => {
    const { objects } = await renderPage(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 800, h: 400, items }]),
    );
    const text = objects.find((o) => Array.isArray(o.text));
    expect(text?.options.fontFace).toBe("Noto Sans JP");
  });
});

describe("renderPyramidNode", () => {
  it('"#" 付きの色指定は "#" なしで pptxgenjs に渡される', async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "pyramid",
          x: 100,
          y: 200,
          w: 480,
          h: 200,
          levels: [
            { label: "L1", color: "#112233" },
            { label: "L2", textColor: "#445566" },
          ],
        },
      ]),
    );

    const shapes = objects.filter((o) => o.shape === "custGeom");
    expect(shapes[0].options.fill).toEqual({ color: "112233" });

    // ラベルは text を持つオブジェクト (図形は text: null)
    const labels = objects.filter((o) => Array.isArray(o.text));
    expect(labels[1].options.color).toBe("445566");
  });
});

describe("ルートノードの background + border", () => {
  it("backgroundColor は slide.background に逃がし、border のみノード全体に fill なしで描画する", async () => {
    const slideXml = await renderPageSlideXml({
      type: "vstack",
      x: 0,
      y: 0,
      w: 1280,
      h: 720,
      backgroundColor: "EEEEEE",
      border: { color: "FF0000", width: 2 },
      children: [],
    });

    expect(slideXml).toContain("<p:bg>");
    expect(slideXml).toContain('<a:srgbClr val="EEEEEE"/>');
    expect(slideXml).toContain('<a:off x="0" y="0"/>');
    expect(slideXml).toContain('<a:ext cx="12192000" cy="6858000"/>');
    expect(slideXml).toContain("<a:noFill/>");
    expect(slideXml).toContain('<a:srgbClr val="FF0000"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });
});

describe("renderChartNode", () => {
  const sampleData = [
    {
      name: "Sales",
      labels: ["Q1", "Q2", "Q3", "Q4"],
      values: [100, 200, 150, 300],
    },
  ];

  it("通常モードでは sparkline 関連オプションを渡さない (後方互換)", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "chart",
          chartType: "bar",
          data: sampleData,
          x: 0,
          y: 0,
          w: 400,
          h: 200,
          showLegend: true,
          showTitle: true,
          title: "Sales",
        },
      ]),
    );

    const chart = objects.find((o) => o._type === "chart");
    expect(chart).toBeDefined();
    expect(chart?.options).toMatchObject({
      showLegend: true,
      showTitle: true,
      title: "Sales",
    });
    expect(chart?.options.catAxisHidden).toBeUndefined();
    expect(chart?.options.valAxisHidden).toBeUndefined();
    expect(chart?.options.layout).toBeUndefined();
  });

  it("sparkline=true のとき凡例 / 軸 / マージンを非表示にする", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "chart",
          chartType: "bar",
          data: sampleData,
          x: 0,
          y: 0,
          w: 200,
          h: 40,
          sparkline: true,
          showLegend: true,
          showTitle: true,
          title: "ignored",
        },
      ]),
    );

    const chart = objects.find((o) => o._type === "chart");
    expect(chart).toBeDefined();
    expect(chart?.options).toMatchObject({
      showLegend: false,
      showTitle: false,
      catAxisHidden: true,
      valAxisHidden: true,
      catAxisLineShow: false,
      valAxisLineShow: false,
      showCatAxisTitle: false,
      showValAxisTitle: false,
      catGridLine: { style: "none" },
      valGridLine: { style: "none" },
      layout: { x: 0, y: 0, w: 1, h: 1 },
    });
    expect(chart?.options.title).toBeUndefined();
  });

  it("sparkline=true でも pie などサポート外の chartType では通常描画にフォールバックする", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "chart",
          chartType: "pie",
          data: sampleData,
          x: 0,
          y: 0,
          w: 200,
          h: 200,
          sparkline: true,
          showLegend: true,
        },
      ]),
    );

    const chart = objects.find((o) => o._type === "chart");
    expect(chart).toBeDefined();
    expect(chart?.options).toMatchObject({
      showLegend: true,
    });
    expect(chart?.options.catAxisHidden).toBeUndefined();
    expect(chart?.options.layout).toBeUndefined();
  });
});

describe("renderLineNode / renderArrowNode", () => {
  it("line: 逆向き座標は左上原点 + flip で表現される", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "line",
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          x1: 300,
          y1: 100,
          x2: 100,
          y2: 50,
          color: "00FF00",
        },
      ]),
    );

    expect(slideXml).toContain('<a:xfrm flipH="1" flipV="1">');
    expect(slideXml).toContain('<a:off x="952500" y="476250"/>');
    expect(slideXml).toContain('<a:ext cx="1905000" cy="476250"/>');
    expect(slideXml).toContain('<a:prstGeom prst="line">');
    expect(slideXml).toContain('<a:srgbClr val="00FF00"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });

  it("line: lgDashDotDot を solid に落とさず prstDash に保持する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "line",
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          x1: 100,
          y1: 100,
          x2: 300,
          y2: 100,
          color: "00FF00",
          dashType: "lgDashDotDot",
        },
      ]),
    );

    expect(slideXml).toContain('<a:prstDash val="lgDashDotDot"/>');
  });

  it("arrow: 参照ノードの中心同士を結ぶ線を描画する", async () => {
    const slideXml = await renderPageSlideXml({
      type: "layer",
      x: 0,
      y: 0,
      w: 1280,
      h: 720,
      children: [
        {
          type: "shape",
          shapeType: "rect",
          id: "a",
          x: 50,
          y: 50,
          w: 100,
          h: 100,
        },
        {
          type: "shape",
          shapeType: "rect",
          id: "b",
          x: 250,
          y: 150,
          w: 100,
          h: 100,
        },
        {
          type: "arrow",
          from: "a",
          to: "b",
          x: 0,
          y: 0,
          w: 0,
          h: 0,
          color: "0000FF",
          endArrow: true,
        },
      ],
    });

    expect(slideXml).toContain('<a:off x="952500" y="952500"/>');
    expect(slideXml).toContain('<a:ext cx="1905000" cy="952500"/>');
    expect(slideXml).toContain('<a:prstGeom prst="line">');
    expect(slideXml).toContain('<a:srgbClr val="0000FF"/>');
    expect(slideXml).toContain('<a:tailEnd type="triangle"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });
});
