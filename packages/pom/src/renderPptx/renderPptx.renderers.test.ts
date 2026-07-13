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
import type { PositionedNode } from "../types.ts";

const ONE_BY_ONE_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lU9qJwAAAABJRU5ErkJggg==";

async function renderPageSlideXml(page: PositionedNode) {
  const { slideXml } = await renderPageSlideXmlWithContext(page);
  return slideXml;
}

async function renderPagePptxZip(page: PositionedNode) {
  const { zip } = await renderPageSlideXmlWithContext(page);
  return zip;
}

async function renderPageSlideXmlWithContext(page: PositionedNode) {
  const buildContext = createBuildContext();
  const pptx = await renderPptx([page], { w: 1280, h: 720 }, buildContext);
  patchPptxWriteForGlimpseTextBoxes(pptx, buildContext.glimpseTextBoxes);
  const buffer = (await pptx.write({
    outputType: "uint8array",
  })) as Uint8Array;
  const zip = await JSZip.loadAsync(buffer);
  return {
    zip,
    slideXml: await zip.file("ppt/slides/slide1.xml")!.async("text"),
    buildContext,
  };
}

function vstackPage(children: PositionedNode[]): PositionedNode {
  return { type: "vstack", x: 0, y: 0, w: 1280, h: 720, children };
}

function shapeXmlFragments(slideXml: string): string[] {
  return slideXml.match(/<p:sp>[\s\S]*?<\/p:sp>/g) ?? [];
}

function findShapeXml(slideXml: string, pattern: RegExp | string): string {
  const fragment = shapeXmlFragments(slideXml).find((shape) =>
    typeof pattern === "string" ? shape.includes(pattern) : pattern.test(shape),
  );
  expect(fragment).toBeDefined();
  return fragment!;
}

function textRunXml(slideXml: string, text: string): string {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = slideXml.match(
    new RegExp(`<a:r>[\\s\\S]*?<a:t>${escapedText}</a:t>[\\s\\S]*?</a:r>`),
  );
  expect(match).toBeDefined();
  return match![0];
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
    const slideXml = await renderPageSlideXml(
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

    expect(slideXml).toContain('<a:off x="457200" y="4800600"/>');
    expect(slideXml).toContain('<a:ext cx="3200400" cy="1600200"/>');
    expect(slideXml).toContain('<a:rPr sz="1800">');
    expect(slideXml).toContain('<a:buChar char="&#x2022;"/>');
    expect(slideXml).not.toContain("pom-text:");
  });

  it("inline runs 付き item でも各 paragraph の bullet marker を保持する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "ul",
          x: 0,
          y: 0,
          w: 384,
          h: 192,
          items: [
            {
              text: "",
              runs: [
                { text: "See " },
                { text: "link", bold: true, color: "1D4ED8" },
              ],
            },
            { text: "Next" },
          ],
        },
      ]),
    );

    expect(slideXml.match(/<a:buChar char="&#x2022;"\/>/g)).toHaveLength(2);
    expect(textRunXml(slideXml, "link")).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(slideXml).not.toMatch(
      /\s(?:indent|marL)="0"\s[^>]*(?:indent|marL)=/,
    );
    expect(slideXml).not.toContain("pom-text:");
  });
});

describe("renderOlNode", () => {
  it("numberType と numberStartAt を XML の autoNum に反映する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "ol",
          x: 0,
          y: 0,
          w: 384,
          h: 192,
          numberType: "romanUcPeriod",
          numberStartAt: 3,
          items: [{ text: "Alpha" }, { text: "Beta" }],
        },
      ]),
    );

    expect(
      slideXml.match(/<a:buAutoNum type="romanUcPeriod" startAt="3"\/>/g),
    ).toHaveLength(2);
    expect(slideXml).not.toContain("pom-text:");
  });
});

describe("renderFlowNode", () => {
  it("ノード図形・接続線・接続ラベルを glimpse XML として描画する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "flow",
          x: 0,
          y: 0,
          w: 640,
          h: 220,
          nodes: [
            {
              id: "start",
              shape: "flowChartTerminator",
              text: "Start",
              color: "16A34A",
              textColor: "FFFFFF",
            },
            {
              id: "decision",
              shape: "flowChartDecision",
              text: "Check",
              color: "FACC15",
              textColor: "111827",
            },
          ],
          connections: [
            {
              from: "start",
              to: "decision",
              label: "ok",
              color: "DC2626",
              labelColor: "1D4ED8",
            },
          ],
          connectorStyle: { arrowType: "triangle" },
        },
      ]),
    );

    const terminatorXml = findShapeXml(
      slideXml,
      '<a:prstGeom prst="flowChartTerminator">',
    );
    expect(terminatorXml).toContain('<a:srgbClr val="16A34A"/>');
    expect(terminatorXml).toContain("<a:t>Start</a:t>");
    expect(terminatorXml).toContain('<a:pPr algn="ctr"/>');
    expect(terminatorXml).toContain('<a:bodyPr wrap="square" anchor="ctr"');

    const decisionXml = findShapeXml(
      slideXml,
      '<a:prstGeom prst="flowChartDecision">',
    );
    expect(decisionXml).toContain('<a:srgbClr val="FACC15"/>');
    expect(decisionXml).toContain('<a:srgbClr val="111827"/>');
    expect(decisionXml).toContain("<a:t>Check</a:t>");

    const connectorXml = findShapeXml(slideXml, '<a:prstGeom prst="line">');
    expect(connectorXml).toContain('<a:srgbClr val="DC2626"/>');
    expect(connectorXml).toContain('<a:tailEnd type="triangle"/>');

    expect(textRunXml(slideXml, "ok")).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(slideXml).not.toContain("pom-shape:");
    expect(slideXml).not.toContain("pom-text:");
  });
});

describe("renderMatrixNode", () => {
  it("軸線・軸ラベル・象限ラベル・item を glimpse XML として描画する", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "matrix",
          x: 0,
          y: 0,
          w: 480,
          h: 360,
          axes: { x: "Impact", y: "Effort" },
          quadrants: {
            topLeft: "Quick wins",
            topRight: "Strategic",
            bottomLeft: "Skip",
            bottomRight: "Later",
          },
          axisLabelColor: "334155",
          quadrantLabelColor: "64748B",
          itemLabelColor: "0F172A",
          items: [
            {
              label: "A",
              x: 0.75,
              y: 0.25,
              color: "F97316",
              textColor: "111827",
            },
          ],
        },
      ]),
    );

    const lineXmls = shapeXmlFragments(slideXml).filter((shape) =>
      shape.includes('<a:prstGeom prst="line">'),
    );
    expect(lineXmls.length).toBeGreaterThanOrEqual(2);
    expect(lineXmls.some((shape) => shape.includes('cy="0"'))).toBe(true);
    expect(lineXmls.some((shape) => shape.includes('cx="0"'))).toBe(true);

    const itemXml = findShapeXml(slideXml, '<a:prstGeom prst="ellipse">');
    expect(itemXml).toContain('<a:srgbClr val="F97316"/>');
    expect(itemXml).toContain("<a:noFill/>");

    expect(findShapeXml(slideXml, 'rot="16200000"')).toContain(
      "<a:t>Effort</a:t>",
    );
    expect(textRunXml(slideXml, "Impact")).toContain(
      '<a:srgbClr val="334155"/>',
    );
    expect(textRunXml(slideXml, "Quick wins")).toContain(
      '<a:srgbClr val="64748B"/>',
    );
    expect(textRunXml(slideXml, "A")).toContain('<a:srgbClr val="111827"/>');
    expect(slideXml).not.toContain("pom-shape:");
    expect(slideXml).not.toContain("pom-text:");
  });
});

describe("renderTimelineNode", () => {
  const items = [
    { date: "D1", title: "T1" },
    { date: "D2", title: "T2" },
  ];

  it("padding 分オフセットしたコンテンツ領域基準で線とノード円を描画する", async () => {
    // content = (148, 148, 704, 304)。intrinsic (240x128) より大きいため scaleFactor = 1
    const { slideXml, buildContext } = await renderPageSlideXmlWithContext(
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
    expect(slideXml).toContain('<a:off x="1981200" y="2857500"/>');
    expect(slideXml).toContain('<a:ext cx="5562600" cy="0"/>');
    expect(slideXml).toContain('<a:prstGeom prst="line">');

    // 最初のアイテムのノード円 (半径 12px)
    expect(slideXml).toContain('<a:off x="1866900" y="2743200"/>');
    expect(slideXml).toContain('<a:ext cx="228600" cy="228600"/>');
    expect(slideXml).toContain('<a:prstGeom prst="ellipse">');
  });

  it("割り当てが固有サイズの半分未満なら SCALE_BELOW_THRESHOLD を記録して 0.5 にクランプする", async () => {
    const { slideXml, buildContext } = await renderPageSlideXmlWithContext(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 100, h: 50, items }]),
    );

    expect(buildContext.diagnostics.items.map((d) => d.code)).toContain(
      "SCALE_BELOW_THRESHOLD",
    );

    // nodeRadius 12px が scaleFactor 0.5 でスケールされる
    expect(slideXml).toContain('<a:ext cx="114300" cy="114300"/>');
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
    const lineXml = findShapeXml(slideXml, '<a:prstGeom prst="line">');
    expect(lineXml).toContain('<a:srgbClr val="1D4ED8"/>');
  });

  it("connectorColor 未指定なら従来通り E2E8F0 が使われる", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 800, h: 400, items }]),
    );
    const lineXml = findShapeXml(slideXml, '<a:prstGeom prst="line">');
    expect(lineXml).toContain('<a:srgbClr val="E2E8F0"/>');
  });

  it("connectorGradient を指定すると native gradFill として軸線に使われる", async () => {
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
          opacity: 0.4,
        },
      ]),
    );
    const lineXml = findShapeXml(slideXml, '<a:prstGeom prst="line">');
    expect(lineXml).toContain("<a:gradFill");
    expect(slideXml).not.toContain("pom-shape:");
    expect(lineXml).toMatch(
      /<a:srgbClr val="1D4ED8"><a:alpha val="40000"\/><\/a:srgbClr>/,
    );
    expect(lineXml).toMatch(
      /<a:srgbClr val="DC2626"><a:alpha val="40000"\/><\/a:srgbClr>/,
    );
  });

  it("useColorForDate=true なら各 item.color が date テキスト色になる", async () => {
    const colored = [
      { date: "D1", title: "T1", color: "1D4ED8" },
      { date: "D2", title: "T2", color: "16A34A" },
    ];
    const slideXml = await renderPageSlideXml(
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
    expect(textRunXml(slideXml, "D1")).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(textRunXml(slideXml, "D2")).toContain('<a:srgbClr val="16A34A"/>');
  });

  it("TimelineItem.dateColor は Timeline.dateColor / useColorForDate より優先される", async () => {
    const colored = [
      { date: "D1", title: "T1", color: "1D4ED8" },
      { date: "D2", title: "T2", color: "16A34A", dateColor: "DC2626" },
    ];
    const slideXml = await renderPageSlideXml(
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
    // D1: useColorForDate により item.color (1D4ED8)、D2: per-item dateColor が最優先
    expect(textRunXml(slideXml, "D1")).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(textRunXml(slideXml, "D2")).toContain('<a:srgbClr val="DC2626"/>');
  });

  it("fontFamily を指定すると全テキストの fontFace に反映される", async () => {
    const slideXml = await renderPageSlideXml(
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
    expect(
      (slideXml.match(/typeface="Arial"/g) ?? []).length,
    ).toBeGreaterThanOrEqual(9);
  });

  it("fontFamily 未指定なら従来通り Noto Sans JP が使われる", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([{ type: "timeline", x: 0, y: 0, w: 800, h: 400, items }]),
    );
    expect(slideXml).toContain('typeface="Noto Sans JP"');
  });
});

describe("renderPyramidNode", () => {
  it('"#" 付きの色指定は "#" なしで glimpse shape / text XML に渡される', async () => {
    const slideXml = await renderPageSlideXml(
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

    const levelXml = findShapeXml(slideXml, "<a:custGeom>");
    expect(levelXml).toContain('<a:srgbClr val="112233"/>');
    expect(textRunXml(slideXml, "L2")).toContain('<a:srgbClr val="445566"/>');
    expect(slideXml).not.toContain("pom-shape:");
  });
});

describe("renderProcessArrowNode", () => {
  it("水平・垂直の矢印本体を custom geometry で描画しテキストを glimpse XML にする", async () => {
    const slideXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "processArrow",
          x: 0,
          y: 0,
          w: 480,
          h: 160,
          steps: [
            { label: "Plan", color: "112233", textColor: "F8FAFC" },
            { label: "Build", color: "445566", textColor: "E2E8F0" },
          ],
        },
        {
          type: "processArrow",
          direction: "vertical",
          x: 520,
          y: 0,
          w: 220,
          h: 320,
          steps: [{ label: "Down", color: "778899", textColor: "111827" }],
        },
      ]),
    );

    const customShapes = shapeXmlFragments(slideXml).filter((shape) =>
      shape.includes("<a:custGeom>"),
    );
    expect(customShapes.length).toBeGreaterThanOrEqual(3);
    expect(customShapes.some((shape) => shape.includes("112233"))).toBe(true);
    expect(customShapes.some((shape) => shape.includes("778899"))).toBe(true);
    expect(textRunXml(slideXml, "Plan")).toContain('<a:srgbClr val="F8FAFC"/>');
    expect(textRunXml(slideXml, "Down")).toContain('<a:srgbClr val="111827"/>');
    expect(slideXml).not.toContain("pom-shape:");
    expect(slideXml).not.toContain("pom-text:");
  });
});

describe("renderTreeNode", () => {
  it("接続線と roundRect / ellipse ノードを glimpse XML として描画する", async () => {
    const verticalXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "tree",
          x: 0,
          y: 0,
          w: 420,
          h: 260,
          nodeShape: "roundRect",
          textColor: "F8FAFC",
          connectorStyle: { color: "DC2626", width: 3 },
          data: {
            label: "Root",
            color: "1D4ED8",
            children: [{ label: "Child", color: "16A34A" }],
          },
        },
      ]),
    );

    const verticalLines = shapeXmlFragments(verticalXml).filter((shape) =>
      shape.includes('<a:prstGeom prst="line">'),
    );
    expect(verticalLines.length).toBeGreaterThanOrEqual(2);
    expect(verticalLines.some((shape) => shape.includes('cx="0"'))).toBe(true);
    expect(verticalLines.some((shape) => shape.includes("DC2626"))).toBe(true);
    expect(
      findShapeXml(verticalXml, '<a:prstGeom prst="roundRect">'),
    ).toContain('<a:srgbClr val="1D4ED8"/>');
    expect(textRunXml(verticalXml, "Root")).toContain(
      '<a:srgbClr val="F8FAFC"/>',
    );
    expect(verticalXml).not.toContain("pom-shape:");
    expect(verticalXml).not.toContain("pom-text:");

    const horizontalXml = await renderPageSlideXml(
      vstackPage([
        {
          type: "tree",
          layout: "horizontal",
          x: 0,
          y: 0,
          w: 420,
          h: 260,
          nodeShape: "ellipse",
          data: {
            label: "Root",
            children: [{ label: "Leaf", textColor: "111827" }],
          },
        },
      ]),
    );

    const horizontalLines = shapeXmlFragments(horizontalXml).filter((shape) =>
      shape.includes('<a:prstGeom prst="line">'),
    );
    expect(horizontalLines.length).toBeGreaterThanOrEqual(2);
    expect(horizontalLines.some((shape) => shape.includes('cy="0"'))).toBe(
      true,
    );
    expect(
      findShapeXml(horizontalXml, '<a:prstGeom prst="ellipse">'),
    ).toContain("<a:t>Root</a:t>");
    expect(textRunXml(horizontalXml, "Leaf")).toContain(
      '<a:srgbClr val="111827"/>',
    );
    expect(horizontalXml).not.toContain("pom-shape:");
    expect(horizontalXml).not.toContain("pom-text:");
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

  it("通常モードを glimpse chart XML と editable workbook で生成する", async () => {
    const zip = await renderPagePptxZip(
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
          chartColors: ["123456"],
        },
      ]),
    );

    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const chartXml = await zip.file("ppt/charts/chart1.xml")!.async("text");
    const slideRels = await zip
      .file("ppt/slides/_rels/slide1.xml.rels")!
      .async("text");
    const chartRels = await zip
      .file("ppt/charts/_rels/chart1.xml.rels")!
      .async("text");

    expect(slideXml).toContain("<p:graphicFrame>");
    expect(slideXml).toContain('name="Chart 1"');
    expect(slideXml).not.toContain("pom-chart:");
    expect(chartXml).toContain("<c:barChart>");
    expect(chartXml).toContain("<a:t>Sales</a:t>");
    expect(chartXml).toContain("<c:legend>");
    expect(chartXml).toContain("<c:catAx>");
    expect(chartXml).toContain("<c:valAx>");
    expect(chartXml).toContain('<a:srgbClr val="123456"/>');
    expect(slideRels).toContain(
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart"',
    );
    expect(chartRels).toContain(
      'Target="../embeddings/Microsoft_Excel_Worksheet1.xlsx"',
    );
    const workbookFile = zip.file(
      "ppt/embeddings/Microsoft_Excel_Worksheet1.xlsx",
    );
    expect(workbookFile).not.toBeNull();
    const workbook = await JSZip.loadAsync(
      await workbookFile!.async("uint8array"),
    );
    const worksheetXml = await workbook
      .file("xl/worksheets/sheet1.xml")!
      .async("text");
    expect(worksheetXml).toContain("<t>Sales</t>");
    expect(worksheetXml).toContain("<t>Q1</t>");
    expect(worksheetXml).toContain("<v>100</v>");
  });

  it("sparkline=true のとき凡例 / 軸 / グリッド線を XML で非表示にする", async () => {
    const zip = await renderPagePptxZip(
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

    const chartXml = await zip.file("ppt/charts/chart1.xml")!.async("text");
    expect(chartXml).not.toContain("<c:title>");
    expect(chartXml).not.toContain("<c:legend>");
    expect(chartXml.match(/<c:delete val="1"\/>/g)).toHaveLength(2);
    expect(chartXml).not.toContain("<c:majorGridlines/>");
    expect(chartXml).toContain("<c:manualLayout>");
    expect(chartXml).toContain('<c:w val="1"/>');
    expect(chartXml).toContain('<c:h val="1"/>');
  });

  it("既定 palette は pptxgenjs と同じ7色目以降も保持する", async () => {
    const zip = await renderPagePptxZip(
      vstackPage([
        {
          type: "chart",
          chartType: "bar",
          data: Array.from({ length: 8 }, (_, index) => ({
            name: `Series ${index + 1}`,
            labels: ["Q1"],
            values: [index + 1],
          })),
          x: 0,
          y: 0,
          w: 400,
          h: 200,
        },
      ]),
    );

    const chartXml = await zip.file("ppt/charts/chart1.xml")!.async("text");
    expect(chartXml).toContain('<a:srgbClr val="628FC6"/>');
    expect(chartXml).toContain('<a:srgbClr val="C86360"/>');
  });

  it("単一系列 bar の複数色と pie の point 超過色をデータ点へ循環適用する", async () => {
    const barZip = await renderPagePptxZip(
      vstackPage([
        {
          type: "chart",
          chartType: "bar",
          data: sampleData,
          chartColors: ["111111", "222222"],
          x: 0,
          y: 0,
          w: 400,
          h: 200,
        },
      ]),
    );
    const pieZip = await renderPagePptxZip(
      vstackPage([
        {
          type: "chart",
          chartType: "pie",
          data: sampleData,
          chartColors: ["333333", "444444"],
          x: 0,
          y: 0,
          w: 400,
          h: 200,
        },
      ]),
    );

    const barXml = await barZip.file("ppt/charts/chart1.xml")!.async("text");
    const pieXml = await pieZip.file("ppt/charts/chart1.xml")!.async("text");
    expect(barXml.match(/<c:dPt>/g)).toHaveLength(4);
    expect(barXml.match(/<a:srgbClr val="111111"\/>/g)!.length).toBeGreaterThan(
      1,
    );
    expect(pieXml.match(/<c:dPt>/g)).toHaveLength(4);
    expect(pieXml.match(/<a:srgbClr val="333333"\/>/g)!.length).toBeGreaterThan(
      1,
    );
  });

  it("sparkline=true でも pie などサポート外の chartType では通常描画にフォールバックする", async () => {
    const zip = await renderPagePptxZip(
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

    const chartXml = await zip.file("ppt/charts/chart1.xml")!.async("text");
    expect(chartXml).toContain("<c:pieChart>");
    expect(chartXml).toContain("<c:legend>");
    expect(chartXml).not.toContain("<c:manualLayout>");
    const seriesXml = chartXml.match(/<c:ser>[\s\S]*?<\/c:ser>/)?.[0];
    expect(seriesXml).toBeDefined();
    expect(seriesXml!.indexOf("<c:spPr>")).toBeLessThan(
      seriesXml!.indexOf("<c:dPt>"),
    );
    expect(seriesXml!.indexOf("<c:dPt>")).toBeLessThan(
      seriesXml!.indexOf("<c:cat>"),
    );
  });
});

describe("renderTableNode", () => {
  it("glimpse table XML で列幅・行高・書式・罫線・hyperlink を生成する", async () => {
    const zip = await renderPagePptxZip(
      vstackPage([
        {
          type: "table",
          x: 96,
          y: 96,
          w: 300,
          h: 40,
          columns: [{ width: 100 }, { width: 200 }],
          rows: [
            {
              height: 40,
              cells: [
                {
                  text: "Header",
                  bold: true,
                  strike: true,
                  subscript: true,
                  highlight: "FFFF00",
                  fontFamily: "Aptos",
                  underline: { style: "dbl", color: "#FF0000" },
                  backgroundColor: "E2E8F0",
                  runs: [
                    {
                      text: "Header",
                      superscript: true,
                      href: "https://example.com/header",
                    },
                  ],
                },
                {
                  text: "Link",
                  runs: [{ text: "Link", href: "https://example.com" }],
                  textAlign: "right",
                },
              ],
            },
          ],
          cellBorder: {
            color: "#334155",
            width: 1,
            dashType: "lgDashDotDot",
          },
        },
      ]),
    );
    const slideXml = await zip.file("ppt/slides/slide1.xml")!.async("text");
    const relsXml = await zip
      .file("ppt/slides/_rels/slide1.xml.rels")!
      .async("text");

    expect(slideXml).toContain("<a:tbl>");
    expect(slideXml).toContain('<a:gridCol w="952500"/>');
    expect(slideXml).toContain('<a:gridCol w="1905000"/>');
    expect(slideXml).toContain('<a:tr h="381000">');
    expect(slideXml).toContain('<a:rPr b="1"');
    expect(slideXml).toContain('strike="sngStrike"');
    expect(slideXml).toContain('baseline="30000"');
    expect(slideXml).not.toContain('baseline="-40000"');
    expect(slideXml).toContain(
      '<a:highlight><a:srgbClr val="FFFF00"/></a:highlight>',
    );
    expect(slideXml).toContain('<a:srgbClr val="E2E8F0"/>');
    expect(slideXml).toContain('<a:pPr algn="r"/>');
    expect(slideXml).toContain('<a:srgbClr val="334155"/>');
    expect(slideXml).toContain('<a:prstDash val="lgDashDotDot"/>');
    const firstRunProperties = slideXml.match(
      /<a:rPr\b[^>]*>[\s\S]*?<\/a:rPr>/,
    )?.[0];
    expect(firstRunProperties).toBeDefined();
    expect(firstRunProperties!.indexOf("<a:highlight>")).toBeLessThan(
      firstRunProperties!.indexOf("<a:uFill>"),
    );
    expect(firstRunProperties!.indexOf("<a:uFill>")).toBeLessThan(
      firstRunProperties!.indexOf("<a:latin"),
    );
    expect(firstRunProperties!.indexOf("<a:latin")).toBeLessThan(
      firstRunProperties!.indexOf("<a:hlinkClick"),
    );
    const firstCellProperties = slideXml.match(
      /<a:tcPr\b[\s\S]*?<\/a:tcPr>/,
    )?.[0];
    expect(firstCellProperties).toBeDefined();
    expect(firstCellProperties!.indexOf("<a:lnL")).toBeLessThan(
      firstCellProperties!.indexOf("<a:solidFill>"),
    );
    expect(slideXml).toMatch(/<a:hlinkClick r:id="rId\d+"\/>/);
    expect(slideXml).not.toContain("pom-table:");
    expect(relsXml).toContain(
      'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink"',
    );
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
