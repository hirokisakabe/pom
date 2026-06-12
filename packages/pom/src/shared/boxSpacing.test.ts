import { describe, expect, it } from "vitest";
import { mapBoxSpacing, resolveBoxSpacing } from "./boxSpacing.ts";

describe("resolveBoxSpacing", () => {
  it("undefined は全 edge 0 に解決される", () => {
    expect(resolveBoxSpacing(undefined)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it("number は 4 辺すべてに展開される", () => {
    expect(resolveBoxSpacing(16)).toEqual({
      top: 16,
      right: 16,
      bottom: 16,
      left: 16,
    });
  });

  it("0 も number として 4 辺に展開される", () => {
    expect(resolveBoxSpacing(0)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it("object は未指定 edge を 0 として解決される", () => {
    expect(resolveBoxSpacing({ top: 8, left: 24 })).toEqual({
      top: 8,
      right: 0,
      bottom: 0,
      left: 24,
    });
  });

  it("全 edge 指定の object はそのまま解決される", () => {
    expect(resolveBoxSpacing({ top: 1, right: 2, bottom: 3, left: 4 })).toEqual(
      {
        top: 1,
        right: 2,
        bottom: 3,
        left: 4,
      },
    );
  });
});

describe("mapBoxSpacing", () => {
  it("number は number のまま変換される", () => {
    expect(mapBoxSpacing(10, (v) => v * 2)).toEqual({
      value: 20,
      changed: true,
    });
  });

  it("number で値が変わらない場合は changed が false になる", () => {
    expect(mapBoxSpacing(10, (v) => v)).toEqual({
      value: 10,
      changed: false,
    });
  });

  it("object は定義済み edge のみ変換され、未指定 edge は生えない", () => {
    expect(mapBoxSpacing({ top: 10, left: 20 }, (v) => v * 2)).toEqual({
      value: { top: 20, left: 40 },
      changed: true,
    });
  });

  it("object で全 edge の値が変わらない場合は changed が false になる", () => {
    expect(mapBoxSpacing({ top: 10, bottom: 20 }, (v) => v)).toEqual({
      value: { top: 10, bottom: 20 },
      changed: false,
    });
  });

  it("一部の edge だけ変化しても changed が true になる", () => {
    expect(
      mapBoxSpacing({ top: 10, bottom: 2 }, (v) => Math.max(2, v / 2)),
    ).toEqual({
      value: { top: 5, bottom: 2 },
      changed: true,
    });
  });
});
