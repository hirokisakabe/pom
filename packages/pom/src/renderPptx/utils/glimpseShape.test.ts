import { describe, expect, it } from "vitest";
import {
  backgroundShapeFill,
  noneShapeFill,
  shapeOutline,
  solidShapeFill,
} from "./glimpseShape.ts";

describe("glimpse shape helpers", () => {
  it("solid / none fill を glimpse writer input に変換する", () => {
    expect(solidShapeFill("#ff00aa")).toEqual({
      kind: "solid",
      color: { kind: "srgb", hex: "FF00AA" },
    });
    expect(solidShapeFill(undefined)).toBeUndefined();
    expect(noneShapeFill()).toEqual({ kind: "none" });
  });

  it("backgroundGradient は先頭 stop を fallback solid fill として渡す", () => {
    expect(
      backgroundShapeFill(
        undefined,
        "linear-gradient(90deg, #112233, #445566)",
      ),
    ).toEqual({
      kind: "solid",
      color: { kind: "srgb", hex: "112233" },
    });
    expect(backgroundShapeFill(undefined, undefined)).toBeUndefined();
  });

  it("outline 未指定・空指定は undefined にし、lgDashDotDot は保持する", () => {
    expect(shapeOutline(undefined)).toBeUndefined();
    expect(shapeOutline({})).toBeUndefined();
    expect(shapeOutline({ dashType: "lgDashDotDot" })).toMatchObject({
      dash: "lgDashDotDot",
    });
  });
});
