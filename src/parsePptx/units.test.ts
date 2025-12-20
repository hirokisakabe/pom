import { describe, it, expect } from "vitest";
import { ptToPx, normalizeColor } from "./units";

describe("ptToPx", () => {
  it("72pt = 96px (96 DPI基準)", () => {
    expect(ptToPx(72)).toBe(96);
  });

  it("36pt = 48px", () => {
    expect(ptToPx(36)).toBe(48);
  });

  it("0pt = 0px", () => {
    expect(ptToPx(0)).toBe(0);
  });

  it("小数点を含む値も変換できる", () => {
    expect(ptToPx(10.5)).toBeCloseTo(14, 1);
  });
});

describe("normalizeColor", () => {
  it("#FF0000 → FF0000", () => {
    expect(normalizeColor("#FF0000")).toBe("FF0000");
  });

  it("#ff0000 → FF0000 (大文字に変換)", () => {
    expect(normalizeColor("#ff0000")).toBe("FF0000");
  });

  it("FF0000 → FF0000 (#がない場合はそのまま)", () => {
    expect(normalizeColor("FF0000")).toBe("FF0000");
  });

  it("小文字のみ → 大文字に変換", () => {
    expect(normalizeColor("aabbcc")).toBe("AABBCC");
  });
});
