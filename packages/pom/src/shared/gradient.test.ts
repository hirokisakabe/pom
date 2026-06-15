import { describe, expect, it } from "vitest";
import {
  parseGradient,
  parseLinearGradient,
  parseRadialGradient,
} from "./gradient.ts";

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

describe("parseRadialGradient", () => {
  it("カラーストップのみ (省略時 default) で parse できる", () => {
    expect(parseRadialGradient("radial-gradient(#FF0000, #0000FF)")).toEqual({
      shape: "ellipse",
      size: "farthest-corner",
      centerX: 50,
      centerY: 50,
      stops: [
        { color: "FF0000", position: 0 },
        { color: "0000FF", position: 100 },
      ],
    });
  });

  it("circle / ellipse の形状指定を読み取る", () => {
    expect(
      parseRadialGradient("radial-gradient(circle, #FF0000, #0000FF)")?.shape,
    ).toBe("circle");
    expect(
      parseRadialGradient("radial-gradient(ellipse, #FF0000, #0000FF)")?.shape,
    ).toBe("ellipse");
  });

  it("size キーワードを読み取る", () => {
    expect(
      parseRadialGradient(
        "radial-gradient(circle closest-side, #FF0000, #0000FF)",
      )?.size,
    ).toBe("closest-side");
    expect(
      parseRadialGradient(
        "radial-gradient(ellipse farthest-corner, #FF0000, #0000FF)",
      )?.size,
    ).toBe("farthest-corner");
  });

  it("at <position> でキーワード位置を指定できる", () => {
    expect(
      parseRadialGradient(
        "radial-gradient(circle at center, #FF0000, #0000FF)",
      ),
    ).toMatchObject({ centerX: 50, centerY: 50 });
    expect(
      parseRadialGradient(
        "radial-gradient(circle at top right, #FF0000, #0000FF)",
      ),
    ).toMatchObject({ centerX: 100, centerY: 0 });
    expect(
      parseRadialGradient(
        "radial-gradient(circle at bottom left, #FF0000, #0000FF)",
      ),
    ).toMatchObject({ centerX: 0, centerY: 100 });
    expect(
      parseRadialGradient("radial-gradient(ellipse at left, #FF0000, #0000FF)"),
    ).toMatchObject({ centerX: 0, centerY: 50 });
    expect(
      parseRadialGradient("radial-gradient(ellipse at top, #FF0000, #0000FF)"),
    ).toMatchObject({ centerX: 50, centerY: 0 });
  });

  it("at <position> で % 位置を指定できる", () => {
    expect(
      parseRadialGradient(
        "radial-gradient(circle at 25% 75%, #FF0000, #0000FF)",
      ),
    ).toMatchObject({ centerX: 25, centerY: 75 });
    expect(
      parseRadialGradient("radial-gradient(at 30%, #FF0000, #0000FF)"),
    ).toMatchObject({ centerX: 30, centerY: 50 });
  });

  it("shape + size + 位置を組み合わせられる", () => {
    expect(
      parseRadialGradient(
        "radial-gradient(circle farthest-corner at 50% 50%, #FF0000 0%, #0000FF 100%)",
      ),
    ).toEqual({
      shape: "circle",
      size: "farthest-corner",
      centerX: 50,
      centerY: 50,
      stops: [
        { color: "FF0000", position: 0 },
        { color: "0000FF", position: 100 },
      ],
    });
  });

  it("位置省略時は均等配置になる", () => {
    expect(
      parseRadialGradient("radial-gradient(circle, #FF0000, #00FF00, #0000FF)")
        ?.stops,
    ).toEqual([
      { color: "FF0000", position: 0 },
      { color: "00FF00", position: 50 },
      { color: "0000FF", position: 100 },
    ]);
  });

  it("3桁 HEX と # なし HEX を 6桁大文字に正規化する", () => {
    expect(parseRadialGradient("radial-gradient(#f00, abcdef)")?.stops).toEqual(
      [
        { color: "FF0000", position: 0 },
        { color: "ABCDEF", position: 100 },
      ],
    );
  });

  it("不正な構文には null を返す", () => {
    expect(parseRadialGradient("linear-gradient(#FF0000, #0000FF)")).toBeNull();
    expect(parseRadialGradient("radial-gradient(#FF0000)")).toBeNull();
    expect(parseRadialGradient("radial-gradient(circle)")).toBeNull();
    expect(
      parseRadialGradient("radial-gradient(square, #FF0000, #0000FF)"),
    ).toBeNull();
    expect(
      parseRadialGradient(
        "radial-gradient(circle at top top, #FF0000, #0000FF)",
      ),
    ).toBeNull();
    expect(
      parseRadialGradient("radial-gradient(circle at, #FF0000, #0000FF)"),
    ).toBeNull();
  });
});

describe("parseGradient", () => {
  it("linear-gradient を kind=linear で返す", () => {
    const result = parseGradient("linear-gradient(45deg, #FF0000, #0000FF)");
    expect(result?.kind).toBe("linear");
    expect(result?.kind === "linear" ? result.value.angle : null).toBe(45);
  });

  it("radial-gradient を kind=radial で返す", () => {
    const result = parseGradient(
      "radial-gradient(circle at center, #FF0000, #0000FF)",
    );
    expect(result?.kind).toBe("radial");
    expect(result?.kind === "radial" ? result.value.shape : null).toBe(
      "circle",
    );
  });

  it("どちらにも該当しなければ null", () => {
    expect(parseGradient("#FF0000")).toBeNull();
    expect(parseGradient("conic-gradient(#FF0000, #0000FF)")).toBeNull();
  });
});
