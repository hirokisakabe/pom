import { describe, it, expect } from "vitest";
import { PX_PER_IN, pxToIn, pxToPt } from "./renderPptx";

describe("PX_PER_IN", () => {
  it("96である", () => {
    expect(PX_PER_IN).toBe(96);
  });
});

describe("pxToIn", () => {
  it("96pxは1inchに変換される", () => {
    expect(pxToIn(96)).toBe(1);
  });

  it("0pxは0inchに変換される", () => {
    expect(pxToIn(0)).toBe(0);
  });

  it("192pxは2inchに変換される", () => {
    expect(pxToIn(192)).toBe(2);
  });

  it("小数も正しく変換される", () => {
    expect(pxToIn(48)).toBe(0.5);
    expect(pxToIn(144)).toBe(1.5);
  });

  it("標準スライド幅（1280px）を変換できる", () => {
    expect(pxToIn(1280)).toBeCloseTo(13.33, 2);
  });

  it("標準スライド高さ（720px）を変換できる", () => {
    expect(pxToIn(720)).toBe(7.5);
  });
});

describe("pxToPt", () => {
  it("96pxは72ptに変換される", () => {
    expect(pxToPt(96)).toBe(72);
  });

  it("0pxは0ptに変換される", () => {
    expect(pxToPt(0)).toBe(0);
  });

  it("24pxフォントは18ptに変換される", () => {
    expect(pxToPt(24)).toBe(18);
  });

  it("48pxフォントは36ptに変換される", () => {
    expect(pxToPt(48)).toBe(36);
  });

  it("小数も正しく変換される", () => {
    expect(pxToPt(32)).toBe(24);
    expect(pxToPt(16)).toBe(12);
  });
});
