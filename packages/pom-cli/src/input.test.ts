import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadInput } from "./input.ts";

describe("loadInput", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-cli-input-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("XML ファイルは内容をそのまま返し、デフォルトサイズ 1280x720 になる", () => {
    const file = path.join(tmpDir, "deck.pom.xml");
    fs.writeFileSync(file, "<Slide><Text>hello</Text></Slide>");

    const result = loadInput(file);

    expect(result.xml).toBe("<Slide><Text>hello</Text></Slide>");
    expect(result.slideWidth).toBe(1280);
    expect(result.slideHeight).toBe(720);
    expect(result.masterPptxData).toBeUndefined();
  });

  it(".md ファイルは parseMd で XML に変換され、サイズは frontmatter に従う", () => {
    const file = path.join(tmpDir, "deck.pom.md");
    fs.writeFileSync(file, "---\nsize: 4:3\n---\n# タイトル\n");

    const result = loadInput(file);

    expect(result.xml).toContain("<Slide>");
    expect(result.xml).toContain("タイトル");
    expect(result.slideWidth).toBe(1024);
    expect(result.slideHeight).toBe(768);
  });

  it(".md の masterPptx は入力ファイルからの相対パスで読み込まれる", () => {
    fs.writeFileSync(path.join(tmpDir, "master.pptx"), Buffer.from([1, 2, 3]));
    const file = path.join(tmpDir, "deck.pom.md");
    fs.writeFileSync(file, "---\nmasterPptx: ./master.pptx\n---\n# タイトル\n");

    const result = loadInput(file);

    expect(result.masterPptxData).toBeInstanceOf(Uint8Array);
    expect(Array.from(result.masterPptxData ?? [])).toEqual([1, 2, 3]);
  });

  it("masterPptx が存在しない場合は警告を出して masterPptxData なしで続行する", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const file = path.join(tmpDir, "deck.pom.md");
    fs.writeFileSync(
      file,
      "---\nmasterPptx: ./missing.pptx\n---\n# タイトル\n",
    );

    const result = loadInput(file);

    expect(result.masterPptxData).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("masterPptx not found"),
    );
  });

  it(".md の場合は log コールバックに進捗メッセージを渡す", () => {
    const log = vi.fn();
    const file = path.join(tmpDir, "deck.pom.md");
    fs.writeFileSync(file, "# タイトル\n");

    loadInput(file, log);

    expect(log).toHaveBeenCalledWith(
      expect.stringContaining("Parsing Markdown"),
    );
  });
});
