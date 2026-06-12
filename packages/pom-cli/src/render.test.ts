import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { convertPptxToPng, convertPptxToSvg } from "pptx-glimpse";
import { runRender } from "./render.ts";

vi.mock("@hirokisakabe/pom", () => ({
  buildPptx: vi.fn(async () => ({
    pptx: { write: async () => new Uint8Array([80, 75]) },
  })),
}));

vi.mock("pptx-glimpse", () => ({
  convertPptxToPng: vi.fn(),
  convertPptxToSvg: vi.fn(),
}));

const convertPptxToPngMock = vi.mocked(convertPptxToPng);
const convertPptxToSvgMock = vi.mocked(convertPptxToSvg);

function makePngSlides(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    slideNumber: i + 1,
    png: Buffer.from(`png-${i + 1}`),
  }));
}

describe("runRender", () => {
  let tmpDir: string;
  let inputFile: string;
  let outputDir: string;

  beforeEach(() => {
    vi.clearAllMocks();
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-cli-render-"));
    inputFile = path.join(tmpDir, "deck.pom.xml");
    outputDir = path.join(tmpDir, "out");
    fs.writeFileSync(inputFile, "<Slide><Text>hello</Text></Slide>");
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("各スライドを slide-NN.png として出力ディレクトリに保存する", async () => {
    convertPptxToPngMock.mockResolvedValue(makePngSlides(3) as never);

    await runRender(inputFile, outputDir);

    expect(fs.readdirSync(outputDir).sort()).toEqual([
      "slide-01.png",
      "slide-02.png",
      "slide-03.png",
    ]);
    expect(fs.readFileSync(path.join(outputDir, "slide-02.png"), "utf-8")).toBe(
      "png-2",
    );
  });

  // 再発防止: a0a1d8c — ゼロ埋め桁数を最大スライド番号に合わせて動的化し、
  // 100 枚超のデッキでもファイル名の辞書順とスライド順が一致するようにする
  it("100 枚超のデッキではゼロ埋めを 3 桁に広げ、辞書順がスライド順と一致する", async () => {
    convertPptxToPngMock.mockResolvedValue(makePngSlides(120) as never);

    await runRender(inputFile, outputDir);

    const files = fs.readdirSync(outputDir).sort();
    expect(files).toHaveLength(120);
    expect(files[0]).toBe("slide-001.png");
    expect(files[99]).toBe("slide-100.png");
    expect(files[119]).toBe("slide-120.png");
  });

  it("format=svg では convertPptxToSvg を使い .svg として保存する", async () => {
    convertPptxToSvgMock.mockResolvedValue([
      { slideNumber: 1, svg: "<svg/>" },
    ] as never);

    await runRender(inputFile, outputDir, { format: "svg" });

    expect(convertPptxToSvgMock).toHaveBeenCalled();
    expect(convertPptxToPngMock).not.toHaveBeenCalled();
    expect(fs.readdirSync(outputDir)).toEqual(["slide-01.svg"]);
  });

  it("textOutput 指定は convertPptxToSvg にそのまま渡される", async () => {
    convertPptxToSvgMock.mockResolvedValue([
      { slideNumber: 1, svg: "<svg/>" },
    ] as never);

    await runRender(inputFile, outputDir, {
      format: "svg",
      textOutput: "text",
    });

    expect(convertPptxToSvgMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ textOutput: "text" }),
    );
  });

  it("textOutput 未指定では convertPptxToSvg にキー自体を渡さない", async () => {
    convertPptxToSvgMock.mockResolvedValue([
      { slideNumber: 1, svg: "<svg/>" },
    ] as never);

    await runRender(inputFile, outputDir, { format: "svg" });

    const options = convertPptxToSvgMock.mock.calls[0][1];
    expect(options).not.toHaveProperty("textOutput");
  });

  it("slides 指定に存在しない番号があれば警告する", async () => {
    convertPptxToPngMock.mockResolvedValue(makePngSlides(1) as never);

    await runRender(inputFile, outputDir, { slides: [1, 5] });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("slide 5 not found"),
    );
  });

  it("スライドが 1 枚も出力されなかった場合はエラーを投げる", async () => {
    convertPptxToPngMock.mockResolvedValue([] as never);

    await expect(runRender(inputFile, outputDir)).rejects.toThrow(
      "No slides were rendered",
    );
  });

  it("入力ファイルが存在しない場合はエラーを投げる", async () => {
    await expect(
      runRender(path.join(tmpDir, "missing.pom.xml"), outputDir),
    ).rejects.toThrow("Input file not found");
  });
});
