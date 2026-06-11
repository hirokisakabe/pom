import fs from "fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { watchInputFile } from "./watch.ts";

type WatchListener = (eventType: string, filename: string | null) => void;

const DEBOUNCE_MS = 100;

describe("watchInputFile", () => {
  let listener: WatchListener;
  let mtimeMs: number;
  let statUnavailable: boolean;

  beforeEach(() => {
    vi.useFakeTimers();
    mtimeMs = 1000;
    statUnavailable = false;

    vi.spyOn(fs, "watch").mockImplementation(((
      _dir: string,
      cb: WatchListener,
    ) => {
      listener = cb;
      return { close: vi.fn() } as unknown as fs.FSWatcher;
    }) as unknown as typeof fs.watch);

    vi.spyOn(fs, "statSync").mockImplementation((() => {
      if (statUnavailable) {
        throw Object.assign(new Error("ENOENT"), { code: "ENOENT" });
      }
      return { mtimeMs } as fs.Stats;
    }) as unknown as typeof fs.statSync);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("対象ファイルの mtime が変化したらデバウンス後に onChange を 1 回呼ぶ", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    mtimeMs = 2000;
    listener("change", "deck.pom.xml");

    expect(onChange).not.toHaveBeenCalled();
    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("同一ディレクトリの別ファイルのイベントでは onChange を呼ばない", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    mtimeMs = 2000;
    listener("change", "output.pptx");

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).not.toHaveBeenCalled();
  });

  // 再発防止: 58a3926 — fs.watch の filename が null になる環境で、
  // 同一ディレクトリの任意の変更 (build --watch の出力 PPTX 書き込み等) が
  // 再ビルドを誘発しないよう mtime の実変化を確認する
  it("filename が null でも対象ファイルの mtime が不変なら onChange を呼ばない", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    listener("change", null);

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("filename が null でも対象ファイルの mtime が変化していれば onChange を呼ぶ", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    mtimeMs = 2000;
    listener("change", null);

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("デバウンス時間内の連続イベントは 1 回の onChange にまとめる", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    mtimeMs = 2000;
    listener("change", "deck.pom.xml");
    vi.advanceTimersByTime(DEBOUNCE_MS / 2);
    mtimeMs = 3000;
    listener("change", "deck.pom.xml");

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("イベント時に stat が失敗した場合 (ファイル一時消滅) は onChange を呼ばない", () => {
    const onChange = vi.fn();
    watchInputFile("/work/deck.pom.xml", onChange);

    statUnavailable = true;
    listener("rename", "deck.pom.xml");

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("監視開始時にファイルが無くても、作成イベントで onChange を呼ぶ", () => {
    const onChange = vi.fn();
    statUnavailable = true;
    watchInputFile("/work/deck.pom.xml", onChange);

    statUnavailable = false;
    mtimeMs = 500;
    listener("rename", "deck.pom.xml");

    vi.advanceTimersByTime(DEBOUNCE_MS);
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
