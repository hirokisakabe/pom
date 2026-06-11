import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiagnosticsError } from "@hirokisakabe/pom";
import { runBuild, runBuildWatch } from "./build.ts";
import { watchInputFile } from "./watch.ts";

const buildPptxMock = vi.hoisted(() => vi.fn());

vi.mock("@hirokisakabe/pom", () => {
  class DiagnosticsError extends Error {
    diagnostics: { code: string; message: string }[];
    constructor(diagnostics: { code: string; message: string }[]) {
      super("diagnostics");
      this.diagnostics = diagnostics;
    }
  }
  return { buildPptx: buildPptxMock, DiagnosticsError };
});

vi.mock("./watch.ts", () => ({ watchInputFile: vi.fn() }));

const watchInputFileMock = vi.mocked(watchInputFile);

function makePptxResult() {
  return { pptx: { write: async () => new Uint8Array([80, 75]) } };
}

describe("build", () => {
  let tmpDir: string;
  let inputFile: string;
  let outputFile: string;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let stderrSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pom-cli-build-"));
    inputFile = path.join(tmpDir, "deck.pom.xml");
    outputFile = path.join(tmpDir, "deck.pptx");
    fs.writeFileSync(inputFile, "<Slide><Text>hello</Text></Slide>");
    buildPptxMock.mockReset();
    buildPptxMock.mockImplementation(async () => makePptxResult());
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    stderrSpy = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  describe("runBuild", () => {
    it("PPTX を出力ファイルに書き込み、stdout に保存先を表示する", async () => {
      await runBuild(inputFile, outputFile);

      expect(Array.from(fs.readFileSync(outputFile))).toEqual([80, 75]);
      expect(logSpy).toHaveBeenCalledWith(`PPTX saved: ${outputFile}`);
    });

    // 再発防止: 95b997e — --verbose 時も stdout は "PPTX saved:" の 1 行のみで
    // 後方互換を維持し、進捗ログは stderr に出す
    it("verbose 時も stdout は PPTX saved の 1 行のみで、進捗ログは stderr に出す", async () => {
      await runBuild(inputFile, outputFile, { verbose: true });

      expect(logSpy).toHaveBeenCalledTimes(1);
      expect(logSpy).toHaveBeenCalledWith(`PPTX saved: ${outputFile}`);
      const stderrOutput = stderrSpy.mock.calls.map((c) => String(c[0]));
      expect(stderrOutput.length).toBeGreaterThan(0);
      for (const line of stderrOutput) {
        expect(line).toMatch(/^\[pom\] /);
      }
    });

    it("verbose でなければ stderr に進捗ログを出さない", async () => {
      await runBuild(inputFile, outputFile);

      expect(stderrSpy).not.toHaveBeenCalled();
    });

    it("silent 時は stdout に何も表示しない", async () => {
      await runBuild(inputFile, outputFile, { silent: true });

      expect(logSpy).not.toHaveBeenCalled();
    });

    it("入力ファイルが存在しない場合はエラーを投げる", async () => {
      await expect(
        runBuild(path.join(tmpDir, "missing.pom.xml"), outputFile),
      ).rejects.toThrow("Input file not found");
    });

    it("strict オプション付きで buildPptx を呼ぶ", async () => {
      await runBuild(inputFile, outputFile);

      expect(buildPptxMock).toHaveBeenCalledWith(
        "<Slide><Text>hello</Text></Slide>",
        { w: 1280, h: 720 },
        expect.objectContaining({ strict: true }),
      );
    });
  });

  describe("runBuildWatch", () => {
    // 再発防止: c13343d — ビルド進行中に変更イベントが連続発火しても
    // ビルドを並走させず、完了後の 1 回の再ビルドにまとめる
    it("ビルド進行中の変更イベントは並走させず 1 回の再ビルドにまとめる", async () => {
      let releaseSecondBuild!: () => void;
      const gate = new Promise<void>((resolve) => {
        releaseSecondBuild = resolve;
      });
      buildPptxMock
        .mockImplementationOnce(async () => makePptxResult())
        .mockImplementationOnce(async () => {
          await gate;
          return makePptxResult();
        })
        .mockImplementation(async () => makePptxResult());

      let onChange!: () => void;
      watchInputFileMock.mockImplementation((_absPath, cb) => {
        onChange = cb;
        return { close: vi.fn() } as unknown as fs.FSWatcher;
      });

      await runBuildWatch(inputFile, outputFile);
      expect(buildPptxMock).toHaveBeenCalledTimes(1);

      // 2 回目のビルドを開始 (gate で進行中のまま停止)
      onChange();
      await vi.waitFor(() => expect(buildPptxMock).toHaveBeenCalledTimes(2));

      // 進行中にさらに 2 回発火しても新しいビルドは始まらない
      onChange();
      onChange();
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(buildPptxMock).toHaveBeenCalledTimes(2);

      // 進行中のビルドが完了すると、まとめられた 1 回だけ再ビルドされる
      releaseSecondBuild();
      await vi.waitFor(() => expect(buildPptxMock).toHaveBeenCalledTimes(3));
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(buildPptxMock).toHaveBeenCalledTimes(3);
    });

    it("DiagnosticsError は診断内容を stderr に出して継続する", async () => {
      buildPptxMock.mockImplementationOnce(async () => {
        throw new DiagnosticsError([
          { code: "POM001", message: "invalid node" },
        ] as never);
      });
      watchInputFileMock.mockImplementation(
        () => ({ close: vi.fn() }) as unknown as fs.FSWatcher,
      );

      await runBuildWatch(inputFile, outputFile);

      const stderrOutput = stderrSpy.mock.calls.map((c) => String(c[0]));
      expect(stderrOutput).toContainEqual(
        expect.stringContaining("Build failed (1 error)"),
      );
      expect(stderrOutput).toContainEqual(
        expect.stringContaining("[POM001] invalid node"),
      );
    });
  });
});
