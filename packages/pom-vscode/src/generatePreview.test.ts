import { describe, it, expect, vi, beforeEach } from "vitest";

// 外部依存をモック
vi.mock("@hirokisakabe/pom-md", () => ({
  parseMd: vi.fn(),
}));

vi.mock("@hirokisakabe/pom", () => ({
  buildPptx: vi.fn(),
}));

vi.mock("pptx-glimpse", () => ({
  convertPptxToSvg: vi.fn(),
}));

import { parseMd } from "@hirokisakabe/pom-md";
import { buildPptx } from "@hirokisakabe/pom";
import { convertPptxToSvg } from "pptx-glimpse";
import {
  generatePreviewSvg,
  buildHtml,
  buildErrorHtml,
  DEFAULT_SLIDE_WIDTH,
  DEFAULT_SLIDE_HEIGHT,
  ZOOM_LEVELS,
  type ZoomLevel,
} from "./generatePreview.js";

const mockParseMd = vi.mocked(parseMd);
const mockBuildPptx = vi.mocked(buildPptx);
const mockConvertPptxToSvg = vi.mocked(convertPptxToSvg);

/** parseMd のモック返り値を生成するヘルパー */
function mdResult(
  xml: string,
  meta?: { size?: { w: number; h: number }; masterPptx?: string },
) {
  return {
    xml,
    meta: {
      size: meta?.size ?? { w: DEFAULT_SLIDE_WIDTH, h: DEFAULT_SLIDE_HEIGHT },
      ...(meta?.masterPptx ? { masterPptx: meta.masterPptx } : {}),
    },
  };
}

function svgReport(slides: { svg: string }[]) {
  return { slides };
}

describe("generatePreviewSvg", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("正常な Markdown から success を返す", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>Hello</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([
        { svg: '<svg width="1280" height="720">slide1</svg>' },
      ]) as never,
    );

    const result = await generatePreviewSvg("# Title", []);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.svgs).toHaveLength(1);
      expect(result.svgs[0]).toContain("<svg");
    }
  });

  it("パイプライン各段階が正しい引数で呼ばれる", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>Test</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg></svg>" }]) as never,
    );

    await generatePreviewSvg("# Test", ["/path/to/fonts"]);

    expect(mockParseMd).toHaveBeenCalledWith("# Test");
    expect(mockBuildPptx).toHaveBeenCalledWith(
      "<Text>Test</Text>",
      { w: DEFAULT_SLIDE_WIDTH, h: DEFAULT_SLIDE_HEIGHT },
      { textMeasurement: "fallback" },
    );
    expect(mockConvertPptxToSvg).toHaveBeenCalledWith(expect.any(Uint8Array), {
      width: DEFAULT_SLIDE_WIDTH,
      fontDirs: ["/path/to/fonts"],
      fontMapping: {
        "游ゴシック Light": "Noto Sans CJK JP",
        "Yu Gothic Light": "Noto Sans CJK JP",
      },
    });
  });

  it("複数スライドの SVG を返す", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>A</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg>s1</svg>" }, { svg: "<svg>s2</svg>" }]) as never,
    );

    const result = await generatePreviewSvg("md", []);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.svgs).toEqual(["<svg>s1</svg>", "<svg>s2</svg>"]);
    }
  });

  it("parseMd が空文字列を返す場合 empty を返す", async () => {
    mockParseMd.mockReturnValue(mdResult("") as ReturnType<typeof parseMd>);

    const result = await generatePreviewSvg("", []);
    expect(result).toEqual({ type: "empty" });
    expect(mockBuildPptx).not.toHaveBeenCalled();
  });

  it("parseMd が空白のみを返す場合 empty を返す", async () => {
    mockParseMd.mockReturnValue(mdResult("   ") as ReturnType<typeof parseMd>);

    const result = await generatePreviewSvg("   ", []);
    expect(result).toEqual({ type: "empty" });
  });

  it("parseMd がエラーを投げた場合 error を返す", async () => {
    mockParseMd.mockImplementation(() => {
      throw new Error("Parse error");
    });

    const result = await generatePreviewSvg("bad input", []);
    expect(result).toEqual({ type: "error", message: "Parse error" });
  });

  it("buildPptx がエラーを投げた場合 error を返す", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<InvalidTag/>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockRejectedValue(new Error("Unknown tag: InvalidTag"));

    const result = await generatePreviewSvg("bad xml", []);
    expect(result).toEqual({
      type: "error",
      message: "Unknown tag: InvalidTag",
    });
  });

  it("Error 以外の例外を文字列に変換する", async () => {
    mockParseMd.mockImplementation(() => {
      throw "string error";
    });

    const result = await generatePreviewSvg("bad", []);
    expect(result).toEqual({ type: "error", message: "string error" });
  });

  it("XML 形式の場合 parseMd をスキップして直接 buildPptx に渡す", async () => {
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg></svg>" }]) as never,
    );

    await generatePreviewSvg("<Text>Direct XML</Text>", [], "xml");

    expect(mockParseMd).not.toHaveBeenCalled();
    expect(mockBuildPptx).toHaveBeenCalledWith(
      "<Text>Direct XML</Text>",
      { w: DEFAULT_SLIDE_WIDTH, h: DEFAULT_SLIDE_HEIGHT },
      { textMeasurement: "fallback" },
    );
  });

  it("XML 形式で空文字列の場合 empty を返す", async () => {
    const result = await generatePreviewSvg("", [], "xml");
    expect(result).toEqual({ type: "empty" });
    expect(mockBuildPptx).not.toHaveBeenCalled();
  });

  it("XML 形式で空白のみの場合 empty を返す", async () => {
    const result = await generatePreviewSvg("   ", [], "xml");
    expect(result).toEqual({ type: "empty" });
  });

  it("XML 形式で buildPptx がエラーを投げた場合 error を返す", async () => {
    mockBuildPptx.mockRejectedValue(new Error("Unknown tag: BadTag"));

    const result = await generatePreviewSvg("<BadTag/>", [], "xml");
    expect(result).toEqual({
      type: "error",
      message: "Unknown tag: BadTag",
    });
  });

  it("diagnostics がある場合 success の diagnostics に含まれる", async () => {
    const diags = [
      { code: "AUTOFIT_OVERFLOW" as const, message: "Slide 1 overflows" },
    ];
    mockParseMd.mockReturnValue(
      mdResult("<Text>X</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: diags,
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg></svg>" }]) as never,
    );

    const result = await generatePreviewSvg("md", []);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.diagnostics).toEqual(diags);
    }
  });

  it("diagnostics が空の場合 success の diagnostics も空配列になる", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>X</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg></svg>" }]) as never,
    );

    const result = await generatePreviewSvg("md", []);
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.diagnostics).toEqual([]);
    }
  });

  it("pptx.write が Uint8Array 以外を返した場合 error を返す", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>X</Text>") as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue("not-uint8array"),
      },
      diagnostics: [],
    } as never);

    const result = await generatePreviewSvg("md", []);
    expect(result.type).toBe("error");
    if (result.type === "error") {
      expect(result.message).toBe("Unexpected output type from pptx.write");
    }
  });

  it("meta.size が 4:3 の場合、slideSize に反映される", async () => {
    mockParseMd.mockReturnValue(
      mdResult("<Text>Test</Text>", {
        size: { w: 1024, h: 768 },
      }) as ReturnType<typeof parseMd>,
    );
    mockBuildPptx.mockResolvedValue({
      pptx: {
        write: vi.fn().mockResolvedValue(new Uint8Array([1])),
      },
      diagnostics: [],
    } as never);
    mockConvertPptxToSvg.mockResolvedValue(
      svgReport([{ svg: "<svg></svg>" }]) as never,
    );

    const result = await generatePreviewSvg("# Test", []);

    expect(mockBuildPptx).toHaveBeenCalledWith(
      "<Text>Test</Text>",
      { w: 1024, h: 768 },
      { textMeasurement: "fallback" },
    );
    expect(result.type).toBe("success");
    if (result.type === "success") {
      expect(result.slideWidth).toBe(1024);
    }
  });
});

describe("buildHtml", () => {
  const nonce = "test-nonce";
  const defaultZoom: ZoomLevel = "fit";

  it("SVG が1つの場合、スライド番号付きの HTML を返す", () => {
    const html = buildHtml(
      ['<svg width="100" height="50"></svg>'],
      nonce,
      defaultZoom,
    );
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Slide 1");
    expect(html).toContain('<svg width="100" height="50"></svg>');
    expect(html).not.toContain("Slide 2");
  });

  it("SVG が複数の場合、全スライドを含む HTML を返す", () => {
    const svgs = [
      '<svg id="s1"></svg>',
      '<svg id="s2"></svg>',
      '<svg id="s3"></svg>',
    ];
    const html = buildHtml(svgs, nonce, defaultZoom);
    expect(html).toContain("Slide 1");
    expect(html).toContain("Slide 2");
    expect(html).toContain("Slide 3");
    expect(html).toContain('<svg id="s1"></svg>');
    expect(html).toContain('<svg id="s2"></svg>');
    expect(html).toContain('<svg id="s3"></svg>');
  });

  it("空配列の場合、No slides メッセージを返す", () => {
    const html = buildHtml([], nonce, defaultZoom);
    expect(html).toContain("No slides to preview");
    expect(html).not.toContain("Slide 1");
  });

  it("ズームコントロールのボタンを含む", () => {
    const html = buildHtml(["<svg></svg>"], nonce, defaultZoom);
    for (const { label } of ZOOM_LEVELS) {
      expect(html).toContain(label);
    }
  });

  it("data-zoom 属性にデフォルトズームが設定される", () => {
    const html = buildHtml(["<svg></svg>"], nonce, "100");
    expect(html).toContain('data-zoom="100"');
  });

  it("nonce が style と script タグに設定される", () => {
    const html = buildHtml(["<svg></svg>"], "abc123", defaultZoom);
    expect(html).toContain('nonce="abc123"');
  });

  it("Content-Security-Policy meta タグが出力される", () => {
    const html = buildHtml(["<svg></svg>"], nonce, defaultZoom);
    expect(html).toContain("Content-Security-Policy");
    expect(html).toContain(`'nonce-${nonce}'`);
    expect(html).toContain("default-src 'none'");
  });

  it("slideWidth パラメータで zoom CSS が変わる", () => {
    const html = buildHtml(["<svg></svg>"], nonce, defaultZoom, 1024);
    expect(html).toContain("width: 512px"); // 1024 * 0.5
    expect(html).toContain("width: 1024px");
  });
});

describe("buildErrorHtml", () => {
  it("エラーメッセージを含む HTML を返す", () => {
    const html = buildErrorHtml("Something went wrong");
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Something went wrong");
    expect(html).toContain("Error:");
  });

  it("HTML 特殊文字をエスケープする", () => {
    const html = buildErrorHtml('<script>alert("xss")</script>');
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("& 文字をエスケープする", () => {
    const html = buildErrorHtml("foo & bar");
    expect(html).toContain("foo &amp; bar");
  });

  it("> 文字をエスケープする", () => {
    const html = buildErrorHtml("a > b");
    expect(html).toContain("a &gt; b");
  });
});

describe("定数", () => {
  it("DEFAULT_SLIDE_WIDTH が 1280", () => {
    expect(DEFAULT_SLIDE_WIDTH).toBe(1280);
  });

  it("DEFAULT_SLIDE_HEIGHT が 720", () => {
    expect(DEFAULT_SLIDE_HEIGHT).toBe(720);
  });
});
