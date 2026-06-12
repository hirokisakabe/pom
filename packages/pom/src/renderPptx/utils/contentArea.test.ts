import { describe, expect, it } from "vitest";
import { getContentArea, getContentAreaIn } from "./contentArea.ts";
import { rectPxToIn } from "../units.ts";

describe("getContentArea", () => {
  it("padding 未指定ならノード領域をそのまま返す", () => {
    expect(getContentArea({ x: 10, y: 20, w: 100, h: 50 })).toEqual({
      x: 10,
      y: 20,
      w: 100,
      h: 50,
    });
  });

  it("number padding は 4 辺均等に差し引かれる", () => {
    expect(getContentArea({ x: 10, y: 20, w: 100, h: 50, padding: 8 })).toEqual(
      { x: 18, y: 28, w: 84, h: 34 },
    );
  });

  it("object padding は指定 edge のみ差し引かれる", () => {
    expect(
      getContentArea({
        x: 0,
        y: 0,
        w: 100,
        h: 50,
        padding: { left: 10, top: 4 },
      }),
    ).toEqual({ x: 10, y: 4, w: 90, h: 46 });
  });

  it("padding が大きすぎる場合は幅・高さを 0 にクランプする", () => {
    expect(getContentArea({ x: 0, y: 0, w: 10, h: 10, padding: 20 })).toEqual({
      x: 20,
      y: 20,
      w: 0,
      h: 0,
    });
  });
});

describe("rectPxToIn", () => {
  it("矩形の x/y/w/h を px から inch に変換する", () => {
    expect(rectPxToIn({ x: 96, y: 48, w: 192, h: 144 })).toEqual({
      x: 1,
      y: 0.5,
      w: 2,
      h: 1.5,
    });
  });
});

describe("getContentAreaIn", () => {
  it("padding を除いたコンテンツ領域を inch で返す", () => {
    expect(
      getContentAreaIn({ x: 96, y: 96, w: 192, h: 96, padding: 48 }),
    ).toEqual({ x: 1.5, y: 1.5, w: 1, h: 0 });
  });
});
