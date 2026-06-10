import { describe, expect, it } from "vitest";
import { parseLinearGradient } from "./gradient.ts";

describe("parseLinearGradient", () => {
  it("角度とカラーストップ位置を指定した構文をパースできる", () => {
    expect(
      parseLinearGradient("linear-gradient(45deg, #FF0000 0%, #0000FF 100%)"),
    ).toEqual({
      angle: 45,
      stops: [
        { color: "FF0000", position: 0 },
        { color: "0000FF", position: 100 },
      ],
    });
  });

  it("角度省略時は 180deg (上→下) になる", () => {
    expect(parseLinearGradient("linear-gradient(#FF0000, #0000FF)")).toEqual({
      angle: 180,
      stops: [
        { color: "FF0000", position: 0 },
        { color: "0000FF", position: 100 },
      ],
    });
  });

  it("to 方向キーワードを角度に変換できる", () => {
    expect(
      parseLinearGradient("linear-gradient(to right, #FF0000, #0000FF)")?.angle,
    ).toBe(90);
    expect(
      parseLinearGradient("linear-gradient(to top left, #FF0000, #0000FF)")
        ?.angle,
    ).toBe(315);
  });

  it("位置省略時は均等配置になる", () => {
    expect(
      parseLinearGradient("linear-gradient(90deg, #FF0000, #00FF00, #0000FF)")
        ?.stops,
    ).toEqual([
      { color: "FF0000", position: 0 },
      { color: "00FF00", position: 50 },
      { color: "0000FF", position: 100 },
    ]);
  });

  it("一部のみ位置指定した場合は明示位置の間で補間する", () => {
    expect(
      parseLinearGradient(
        "linear-gradient(90deg, #FF0000, #00FF00 40%, #0000FF, #FFFFFF)",
      )?.stops,
    ).toEqual([
      { color: "FF0000", position: 0 },
      { color: "00FF00", position: 40 },
      { color: "0000FF", position: 70 },
      { color: "FFFFFF", position: 100 },
    ]);
  });

  it("3桁 HEX と # なし HEX を 6桁大文字に正規化する", () => {
    expect(
      parseLinearGradient("linear-gradient(0deg, #f00, abcdef)")?.stops,
    ).toEqual([
      { color: "FF0000", position: 0 },
      { color: "ABCDEF", position: 100 },
    ]);
  });

  it("負の角度・360 超の角度を 0-360 に正規化する", () => {
    expect(
      parseLinearGradient("linear-gradient(-45deg, #FF0000, #0000FF)")?.angle,
    ).toBe(315);
    expect(
      parseLinearGradient("linear-gradient(405deg, #FF0000, #0000FF)")?.angle,
    ).toBe(45);
  });

  it("前のストップより小さい位置は切り上げて非減少にする", () => {
    expect(
      parseLinearGradient(
        "linear-gradient(90deg, #FF0000 50%, #0000FF 20%, #00FF00 80%)",
      )?.stops,
    ).toEqual([
      { color: "FF0000", position: 50 },
      { color: "0000FF", position: 50 },
      { color: "00FF00", position: 80 },
    ]);
  });

  it("不正な構文には null を返す", () => {
    expect(parseLinearGradient("radial-gradient(#FF0000, #0000FF)")).toBeNull();
    expect(parseLinearGradient("linear-gradient(#FF0000)")).toBeNull();
    expect(parseLinearGradient("linear-gradient(45deg)")).toBeNull();
    expect(parseLinearGradient("linear-gradient(45deg, red, blue)")).toBeNull();
    expect(
      parseLinearGradient("linear-gradient(45deg, #FF0000 0px, #0000FF)"),
    ).toBeNull();
    expect(parseLinearGradient("#FF0000")).toBeNull();
  });
});
