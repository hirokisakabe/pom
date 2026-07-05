import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runThemeExtract } from "./theme.ts";

const extractThemeTokensFromPptxMock = vi.hoisted(() => vi.fn());

vi.mock("@hirokisakabe/pom", () => ({
  extractThemeTokensFromPptx: extractThemeTokensFromPptxMock,
}));

describe("theme extract", () => {
  let tmpDir: string;
  let inputFile: string;
  let logSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-cli-theme-"));
    inputFile = path.join(tmpDir, "deck.pptx");
    fs.writeFileSync(inputFile, "dummy pptx bytes");
    extractThemeTokensFromPptxMock.mockReset();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it("extractThemeTokensFromPptx の結果を整形 JSON として stdout に出力する", async () => {
    const tokens = [
      {
        text: "#000000",
        background: "#FFFFFF",
        primary: "#4472C4",
        secondary: "#ED7D31",
        accent3: "#A5A5A5",
        accent4: "#FFC000",
        accent5: "#5B9BD5",
        accent6: "#70AD47",
      },
    ];
    extractThemeTokensFromPptxMock.mockResolvedValue(tokens);

    await runThemeExtract(inputFile);

    expect(extractThemeTokensFromPptxMock).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith(JSON.stringify(tokens, null, 2));
  });

  it("入力ファイルが存在しない場合はエラーを投げる", async () => {
    await expect(
      runThemeExtract(path.join(tmpDir, "missing.pptx")),
    ).rejects.toThrow("Input file not found");
  });
});
