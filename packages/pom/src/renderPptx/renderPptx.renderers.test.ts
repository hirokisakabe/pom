/**
 * ノード renderer の出力回帰テスト。
 *
 * renderPptx に PositionedNode を直接渡し、pptxgenjs 内部の
 * _slideObjects (描画オブジェクトの位置・スタイル) を検証することで、
 * renderer 内部のリファクタリングで public な出力挙動が変わっていない
 * ことを保証する。
 */
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
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
  it("padding を除いたコンテンツ領域に inch 変換して描画される", async () => {
    const { objects } = await renderPage(
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

    expect(objects).toHaveLength(1);
    expect(objects[0].shape).toBe("rect");
    expect(objects[0].options).toMatchObject({
      x: pxToIn(96 + 24),
      y: pxToIn(96 + 24),
      w: pxToIn(192 - 48),
      h: pxToIn(96 - 48),
      fill: { color: "FF0000" },
    });
  });

  it("rotate を pptxgenjs options に渡す", async () => {
    const { objects } = await renderPage(
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

    expect(objects[0].options.rotate).toBe(45);
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
});

describe("renderImageNode", () => {
  it("rotate を pptxgenjs options に渡す", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "image",
          src: "sample_images/sample_0.png",
          x: 0,
          y: 0,
          w: 120,
          h: 80,
          rotate: 30,
        },
      ]),
    );

    expect(objects[0].options.rotate).toBe(30);
  });
});

describe("renderIconNode", () => {
  it("rotate をアイコン画像の pptxgenjs options に渡す", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "icon",
          name: "cpu",
          iconImageData: "data:image/png;base64,AA==",
          x: 0,
          y: 0,
          w: 32,
          h: 32,
          rotate: 90,
        },
      ]),
    );

    expect(objects[0].options.rotate).toBe(90);
  });

  it("rotate を variant 背景図形にも渡す", async () => {
    const { objects } = await renderPage(
      vstackPage([
        {
          type: "icon",
          name: "cpu",
          iconImageData: "data:image/png;base64,AA==",
          variant: "circle-filled",
          x: 0,
          y: 0,
          w: 56,
          h: 56,
          rotate: 90,
        },
      ]),
    );

    expect(objects[0].options.rotate).toBe(90);
    expect(objects[1].options.rotate).toBe(90);
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

    expect(buildContext.diagnostics.items).toEqual([]);

    // メイン線: 端点は labelW/2 = 60 インセット、lineY はコンテンツ領域の垂直中央
    const lineY = 148 + 304 / 2;
    expect(objects[0].shape).toBe("line");
    expect(objects[0].options).toMatchObject({
      x: pxToIn(148 + 60),
      y: pxToIn(lineY),
      w: pxToIn(704 - 120),
      h: 0,
    });

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
    const { objects } = await renderPage(
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
    const line = objects.find((o) => o.shape === "line");
    expect(line?.options).toMatchObject({ line: { color: "1D4ED8" } });
  });

  it("connectorColor 未指定なら従来通り E2E8F0 が使われる", async () => {
    const { objects } = await renderPage(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 800, h: 400, items }]),
    );
    const line = objects.find((o) => o.shape === "line");
    expect(line?.options).toMatchObject({ line: { color: "E2E8F0" } });
  });

  it("connectorGradient を指定するとマーカー色が registry に登録され軸線に使われる", async () => {
    const { objects, buildContext } = await renderPage(
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
    const marker = buildContext.gradientFills.entries[0]?.marker;
    expect(marker).toBeDefined();
    const line = objects.find((o) => o.shape === "line");
    expect(line?.options).toMatchObject({ line: { color: marker } });
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
    const { objects } = await renderPage({
      type: "vstack",
      x: 0,
      y: 0,
      w: 1280,
      h: 720,
      backgroundColor: "EEEEEE",
      border: { color: "FF0000", width: 2 },
      children: [],
    });

    expect(objects).toHaveLength(1);
    expect(objects[0].options).toMatchObject({
      x: 0,
      y: 0,
      w: pxToIn(1280),
      h: pxToIn(720),
      fill: { type: "none" },
    });
    expect(objects[0].options.line).toMatchObject({ color: "FF0000" });
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
    const { objects } = await renderPage(
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

    expect(objects[0].shape).toBe("line");
    expect(objects[0].options).toMatchObject({
      x: pxToIn(100),
      y: pxToIn(50),
      w: pxToIn(200),
      h: pxToIn(50),
      flipH: true,
      flipV: true,
    });
    expect(objects[0].options.line).toMatchObject({ color: "00FF00" });
  });

  it("arrow: 参照ノードの中心同士を結ぶ線を描画する", async () => {
    const { objects } = await renderPage({
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

    const line = objects.find((o) => o.shape === "line");
    expect(line?.options).toMatchObject({
      x: pxToIn(100),
      y: pxToIn(100),
      w: pxToIn(200),
      h: pxToIn(100),
      flipH: false,
      flipV: false,
    });
    expect(line?.options.line).toMatchObject({
      color: "0000FF",
      endArrowType: "triangle",
    });
  });
});
