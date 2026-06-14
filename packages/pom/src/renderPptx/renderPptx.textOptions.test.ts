import { describe, expect, it, vi } from "vitest";
import {
  createTextOptions,
  calcGlyphCenteringShiftPx,
  convertGlow,
  convertOutline,
} from "./textOptions.ts";
import { renderTextNode } from "./nodes/text.ts";
import type { RenderContext } from "./types.ts";
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
    // y はグリフ中央化補正 (#846) の分だけずれる
    expect(options.y).toBe(
      pxToIn(34 - calcGlyphCenteringShiftPx(32, 1.3, "normal")),
    );
    expect(options.w).toBe(pxToIn(200));
    expect(options.h).toBe(pxToIn(100));
    expect(options.fontSize).toBe(pxToPt(32));
    expect(options.align).toBe("center");
    expect(options.color).toBe("FF00FF");
  });

  it("行送りを固定値 (fontSize × lineHeight) の lineSpacing で出力する", () => {
    const options = createTextOptions({
      type: "text",
      text: "hello",
      x: 0,
      y: 0,
      w: 10,
      h: 20,
      fontSize: 14,
      lineHeight: 1.5,
    });

    expect(options.lineSpacing).toBe(pxToPt(14 * 1.5));
    expect(options).not.toHaveProperty("lineSpacingMultiple");
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

describe("calcGlyphCenteringShiftPx", () => {
  it("Noto Sans JP のメトリクスでグリフ ink を行内中央に置く補正量を返す", () => {
    // Noto Sans JP: typoAscender 0.88 / typoDescender 0.12 / winDescent 0.288
    // L = 14 × 1.5 = 21px
    // baseline 実位置 = 21 − 0.288×14 = 16.968px
    // 中央化 baseline = (21 − 1.0×14)/2 + 0.88×14 = 15.82px
    expect(calcGlyphCenteringShiftPx(14, 1.5, "normal")).toBeCloseTo(1.148, 3);
  });

  it("lineHeight が小さい場合は負の補正 (下方向) になる", () => {
    // L = 14 × 1.0 = 14px: ink (1.0em) を中央 (=上端ぴったり) に置くには
    // baseline 実位置 (9.968px) より下 (12.32px) に動かす必要がある
    expect(calcGlyphCenteringShiftPx(14, 1.0, "normal")).toBeCloseTo(-2.352, 3);
  });
});

describe("renderTextNode (runs 分岐)", () => {
  it("run に fontSize 指定があれば run 単位で適用され、未指定なら親 Text の fontSize を継承する", () => {
    const addText =
      vi.fn<(items: { options: { fontSize?: number } }[]) => void>();
    const ctx = { slide: { addText } } as unknown as RenderContext;

    renderTextNode(
      {
        type: "text",
        text: "¥84.2M",
        fontSize: 52,
        runs: [{ text: "¥84.2" }, { text: "M", fontSize: 18 }],
        x: 0,
        y: 0,
        w: 100,
        h: 50,
      },
      ctx,
    );

    expect(addText).toHaveBeenCalledTimes(1);
    const textItems = addText.mock.calls[0][0];
    expect(textItems).toHaveLength(2);
    expect(textItems[0].options.fontSize).toBe(pxToPt(52));
    expect(textItems[1].options.fontSize).toBe(pxToPt(18));
  });

  it("runs ありの Text でノード単位の glow / outline が各 run に適用される", () => {
    const addText =
      vi.fn<
        (items: { options: { glow?: unknown; outline?: unknown } }[]) => void
      >();
    const ctx = { slide: { addText } } as unknown as RenderContext;

    renderTextNode(
      {
        type: "text",
        text: "AB",
        runs: [{ text: "A" }, { text: "B", bold: true }],
        x: 0,
        y: 0,
        w: 100,
        h: 50,
        glow: { size: 8, opacity: 0.5, color: "FF3399" },
        outline: { size: 2, color: "0088CC" },
      },
      ctx,
    );

    expect(addText).toHaveBeenCalledTimes(1);
    const textItems = addText.mock.calls[0][0];
    expect(textItems).toHaveLength(2);
    for (const item of textItems) {
      expect(item.options.glow).toEqual({
        size: pxToPt(8),
        opacity: 0.5,
        color: "FF3399",
      });
      expect(item.options.outline).toEqual({
        size: pxToPt(2),
        color: "0088CC",
      });
    }
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
