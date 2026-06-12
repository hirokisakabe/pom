import { describe, it, expect } from "vitest";
import {
  convertShadow,
  hasVisibleBorder,
  convertBorderLine,
  opacityToTransparency,
  resolveBackgroundFill,
  resolvePerSideBorders,
  resolveRectRadius,
} from "./visualStyle.ts";

describe("convertShadow", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(convertShadow(undefined)).toBeUndefined();
  });

  it("type 未指定時は outer をデフォルトとする", () => {
    expect(convertShadow({})).toEqual({
      type: "outer",
      opacity: undefined,
      blur: undefined,
      angle: undefined,
      offset: undefined,
      color: undefined,
    });
  });

  it("指定された属性をそのまま引き継ぐ", () => {
    expect(
      convertShadow({
        type: "inner",
        opacity: 0.5,
        blur: 4,
        angle: 90,
        offset: 2,
        color: "333333",
      }),
    ).toEqual({
      type: "inner",
      opacity: 0.5,
      blur: 4,
      angle: 90,
      offset: 2,
      color: "333333",
    });
  });
});

describe("hasVisibleBorder", () => {
  it("undefined / 空オブジェクトは false", () => {
    expect(hasVisibleBorder(undefined)).toBe(false);
    expect(hasVisibleBorder({})).toBe(false);
  });

  it("color / width / dashType のいずれかがあれば true", () => {
    expect(hasVisibleBorder({ color: "FF0000" })).toBe(true);
    expect(hasVisibleBorder({ width: 2 })).toBe(true);
    expect(hasVisibleBorder({ dashType: "dash" })).toBe(true);
  });
});

describe("resolvePerSideBorders", () => {
  it("辺ごとの指定が 1 つも無い場合は undefined を返す (一律 border のみでも)", () => {
    expect(resolvePerSideBorders({})).toBeUndefined();
    expect(
      resolvePerSideBorders({ border: { color: "000000", width: 2 } }),
    ).toBeUndefined();
  });

  it("空オブジェクトの辺指定は指定なしとして扱う", () => {
    expect(resolvePerSideBorders({ borderTop: {} })).toBeUndefined();
  });

  it("指定した辺だけが結果に含まれる", () => {
    expect(
      resolvePerSideBorders({ borderLeft: { color: "FF0000", width: 4 } }),
    ).toEqual({
      left: { color: "FF0000", width: 4 },
    });
  });

  it("一律 border をベースに辺ごとの指定がフィールド単位で優先される", () => {
    expect(
      resolvePerSideBorders({
        border: { color: "000000", width: 2 },
        borderTop: { color: "FF0000" },
      }),
    ).toEqual({
      top: { color: "FF0000", width: 2 },
      right: { color: "000000", width: 2 },
      bottom: { color: "000000", width: 2 },
      left: { color: "000000", width: 2 },
    });
  });
});

describe("convertBorderLine", () => {
  it("width を px から pt に変換する", () => {
    expect(
      convertBorderLine({ color: "FF0000", width: 4, dashType: "dash" }),
    ).toEqual({ color: "FF0000", width: 3, dashType: "dash" });
  });

  it("color 未指定時は fallbackColor を使う", () => {
    expect(convertBorderLine({ width: 2 }, "000000")).toEqual({
      color: "000000",
      width: 1.5,
      dashType: undefined,
    });
  });

  it("fallbackColor 省略時は color を undefined のままにする", () => {
    expect(convertBorderLine({ width: 2 })).toEqual({
      color: undefined,
      width: 1.5,
      dashType: undefined,
    });
  });
});

describe("opacityToTransparency", () => {
  it("undefined はそのまま undefined を返す", () => {
    expect(opacityToTransparency(undefined)).toBeUndefined();
  });

  it("0-1 の opacity を 0-100 の transparency に反転変換する", () => {
    expect(opacityToTransparency(1)).toBe(0);
    expect(opacityToTransparency(0.3)).toBeCloseTo(70);
    expect(opacityToTransparency(0)).toBe(100);
  });
});

describe("resolveBackgroundFill", () => {
  it("gradientMarker があればマーカー色の単色塗りを返す (transparency なし)", () => {
    expect(resolveBackgroundFill("FF0000", 0.5, "0F7A3D")).toEqual({
      color: "0F7A3D",
    });
  });

  it("backgroundColor と opacity から fill を解決する", () => {
    expect(resolveBackgroundFill("FF0000", 0.5, undefined)).toEqual({
      color: "FF0000",
      transparency: 50,
    });
  });

  it("opacity 未指定時は transparency を付与しない", () => {
    expect(resolveBackgroundFill("FF0000", undefined, undefined)).toEqual({
      color: "FF0000",
      transparency: undefined,
    });
  });
});

describe("resolveRectRadius", () => {
  it("borderRadius 未指定時は undefined を返す", () => {
    expect(resolveRectRadius(undefined, 100, 50)).toBeUndefined();
  });

  it("短辺に対する比率の 2 倍を返す", () => {
    expect(resolveRectRadius(10, 100, 50)).toBeCloseTo(0.4);
  });

  it("1 を超える場合は 1 にクランプする", () => {
    expect(resolveRectRadius(100, 100, 50)).toBe(1);
  });
});
