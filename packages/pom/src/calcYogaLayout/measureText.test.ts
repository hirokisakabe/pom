import { describe, expect, it } from "vitest";
import { measureText } from "./measureText.ts";

describe("measureText", () => {
  describe("フォントファミリーによる計測方法の切り替え", () => {
    const text = "Hello World";
    const maxWidth = 500;

    it("バンドル済みフォント（Noto Sans JP）では opentype 計測を使用する", () => {
      const opentypeResult = measureText(text, maxWidth, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 24,
      });

      const fallbackResult = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Noto Sans JP",
          fontSizePx: 24,
        },
        "fallback",
      );

      // opentype と fallback で結果が異なることを確認（=opentype が使われている）
      expect(opentypeResult.widthPx).not.toBe(fallbackResult.widthPx);
    });

    it("バンドル外フォントではフォールバック計測を使用する", () => {
      const arialResult = measureText(text, maxWidth, {
        fontFamily: "Arial",
        fontSizePx: 24,
      });

      const fallbackResult = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Arial",
          fontSizePx: 24,
        },
        "fallback",
      );

      // バンドル外フォントはフォールバックと同じ結果になる
      expect(arialResult.widthPx).toBe(fallbackResult.widthPx);
      expect(arialResult.heightPx).toBe(fallbackResult.heightPx);
    });

    it("mode=fallback が明示された場合はフォントに関係なくフォールバックを使用する", () => {
      const result = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Noto Sans JP",
          fontSizePx: 24,
        },
        "fallback",
      );

      const fallbackDirect = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Arial",
          fontSizePx: 24,
        },
        "fallback",
      );

      // 同じフォールバック計算なので結果は同じ
      expect(result.widthPx).toBe(fallbackDirect.widthPx);
    });

    it("mode=opentype が明示された場合はバンドル外フォントでも opentype 計測を使用する", () => {
      const opentypeForced = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Arial",
          fontSizePx: 24,
        },
        "opentype",
      );

      const fallbackResult = measureText(
        text,
        maxWidth,
        {
          fontFamily: "Arial",
          fontSizePx: 24,
        },
        "fallback",
      );

      // opentype を強制した場合はフォールバックと異なる結果になる
      expect(opentypeForced.widthPx).not.toBe(fallbackResult.widthPx);
    });
  });

  describe("letterSpacing による幅の加算", () => {
    it("フォールバック計測で letterSpacing × 文字数 が幅に加算される", () => {
      const base = measureText(
        "Hello",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Arial", fontSizePx: 24 },
        "fallback",
      );
      const spaced = measureText(
        "Hello",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Arial", fontSizePx: 24, letterSpacingPx: 5 },
        "fallback",
      );

      expect(spaced.widthPx).toBe(base.widthPx + 5 * 5);
    });

    it("opentype 計測でも letterSpacing で幅が広がる", () => {
      const base = measureText("Hello", Number.POSITIVE_INFINITY, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 24,
      });
      const spaced = measureText("Hello", Number.POSITIVE_INFINITY, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 24,
        letterSpacingPx: 5,
      });

      expect(spaced.widthPx).toBe(base.widthPx + 5 * 5);
    });

    it("letterSpacing 込みの幅で折り返しが行われる", () => {
      // letterSpacing なしでは 1 行に収まり、ありでは折り返して高さが増える幅を選ぶ
      const base = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Arial", fontSizePx: 24 },
        "fallback",
      );
      const maxWidth = base.widthPx;

      const spaced = measureText(
        "Hello World",
        maxWidth,
        { fontFamily: "Arial", fontSizePx: 24, letterSpacingPx: 10 },
        "fallback",
      );

      expect(spaced.heightPx).toBeGreaterThan(base.heightPx);
    });
  });
});
