import { describe, expect, it } from "vitest";
import {
  createTextOptions,
  convertGlow,
  convertOutline,
} from "./textOptions.ts";
import { pxToIn, pxToPt } from "./units.ts";

describe("createTextOptions", () => {
  it("指定した色と配置をオプションに反映する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 12,
      y: 34,
      w: 200,
      h: 100,
      fontSize: 32,
      color: "FF00FF",
      textAlign: "center",
    });

    expect(options.x).toBe(pxToIn(12));
    expect(options.y).toBe(pxToIn(34));
    expect(options.w).toBe(pxToIn(200));
    expect(options.h).toBe(pxToIn(100));
    expect(options.fontSize).toBe(pxToPt(32));
    expect(options.align).toBe("center");
    expect(options.color).toBe("FF00FF");
  });

  it("色や配置が指定されない場合のデフォルト値を設定する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
    });

    expect(options.fontSize).toBe(pxToPt(24));
    expect(options.align).toBe("left");
    expect(options.color).toBeUndefined();
  });

  it("letterSpacing (px) を charSpacing (pt) に変換する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
      letterSpacing: 4,
    });

    expect(options.charSpacing).toBe(pxToPt(4));
  });

  it("letterSpacing が未指定なら charSpacing は undefined になる", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
    });

    expect(options.charSpacing).toBeUndefined();
  });

  it("glow / outline をオプションに反映する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
      glow: { size: 8, opacity: 0.5, color: "FF3399" },
      outline: { size: 2, color: "0088CC" },
    });

    expect(options.glow).toEqual({
      size: pxToPt(8),
      opacity: 0.5,
      color: "FF3399",
    });
    expect(options.outline).toEqual({ size: pxToPt(2), color: "0088CC" });
  });

  it("glow / outline が未指定なら undefined になる", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
    });

    expect(options.glow).toBeUndefined();
    expect(options.outline).toBeUndefined();
  });
});

describe("convertGlow", () => {
  it("size (px) を pt に変換する", () => {
    expect(convertGlow({ size: 8, opacity: 0.5, color: "FF3399" })).toEqual({
      size: pxToPt(8),
      opacity: 0.5,
      color: "FF3399",
    });
  });

  it("省略されたフィールドにデフォルト値を補完する", () => {
    expect(convertGlow({})).toEqual({
      size: pxToPt(8),
      opacity: 0.75,
      color: "FFFFFF",
    });
  });

  it("undefined を渡すと undefined を返す", () => {
    expect(convertGlow(undefined)).toBeUndefined();
  });
});

describe("convertOutline", () => {
  it("size (px) を pt に変換する", () => {
    expect(convertOutline({ size: 2, color: "0088CC" })).toEqual({
      size: pxToPt(2),
      color: "0088CC",
    });
  });

  it("省略されたフィールドにデフォルト値を補完する", () => {
    expect(convertOutline({})).toEqual({
      size: pxToPt(1),
      color: "FFFFFF",
    });
  });

  it("undefined を渡すと undefined を返す", () => {
    expect(convertOutline(undefined)).toBeUndefined();
  });
});
