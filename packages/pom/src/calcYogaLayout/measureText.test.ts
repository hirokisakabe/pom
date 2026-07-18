import { describe, expect, it } from "vitest";
import { measureText } from "./measureText.ts";
import { FontRegistry } from "./fontLoader.ts";
import {
  CUSTOM_FONT_BOLD,
  CUSTOM_FONT_REGULAR,
  CUSTOM_FONT_WITHOUT_ALIAS,
} from "../testFixtures/customFont.ts";

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

  describe("custom font registry", () => {
    it("alias を case-insensitive に解決して実 advance width を使う", () => {
      const registry = new FontRegistry([CUSTOM_FONT_REGULAR]);
      const custom = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "cUsToM fIxTuRe", fontSizePx: 24 },
        "auto",
        registry,
      );
      const bundled = measureText("Hello World", Number.POSITIVE_INFINITY, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 24,
      });

      expect(custom).toEqual(bundled);

      const interRegistry = new FontRegistry([
        { ...CUSTOM_FONT_REGULAR, name: "Inter" },
      ]);
      expect(interRegistry.hasFont("inter", "normal")).toBe(true);
    });

    it("name 未指定時は font 内部の family 名で解決する", () => {
      const registry = new FontRegistry([CUSTOM_FONT_WITHOUT_ALIAS]);
      const custom = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Noto Sans CJK JP", fontSizePx: 24 },
        "auto",
        registry,
      );
      const bundled = measureText("Hello World", Number.POSITIVE_INFINITY, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 24,
      });

      expect(custom).toEqual(bundled);
    });

    it("custom metrics を wrapping に使う", () => {
      const registry = new FontRegistry([CUSTOM_FONT_REGULAR]);
      const unwrapped = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Custom Fixture", fontSizePx: 24 },
        "auto",
        registry,
      );
      const wrapped = measureText(
        "Hello World",
        unwrapped.widthPx - 11,
        { fontFamily: "Custom Fixture", fontSizePx: 24 },
        "auto",
        registry,
      );

      expect(wrapped.heightPx).toBeGreaterThan(unwrapped.heightPx);
    });

    it("bold face を使い、未登録時は regular face に戻る", () => {
      const regularOnly = new FontRegistry([CUSTOM_FONT_REGULAR]);
      const withBold = new FontRegistry([
        CUSTOM_FONT_REGULAR,
        CUSTOM_FONT_BOLD,
      ]);
      const options = {
        fontFamily: "Custom Fixture",
        fontSizePx: 48,
        fontWeight: "bold" as const,
      };
      const regularFallback = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        options,
        "auto",
        regularOnly,
      );
      const bold = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        options,
        "auto",
        withBold,
      );
      const regular = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        { ...options, fontWeight: "normal" },
        "auto",
        regularOnly,
      );

      expect(regularFallback).toEqual(regular);
      expect(bold.widthPx).not.toBe(regular.widthPx);
    });

    it("weight 未指定時は font metadata から bold を判定する", () => {
      const registry = new FontRegistry([
        { ...CUSTOM_FONT_BOLD, weight: undefined },
        CUSTOM_FONT_REGULAR,
      ]);
      const inferred = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        {
          fontFamily: "Custom Fixture",
          fontSizePx: 48,
          fontWeight: "bold",
        },
        "auto",
        registry,
      );
      const bundledBold = measureText("WWW Hello", Number.POSITIVE_INFINITY, {
        fontFamily: "Noto Sans JP",
        fontSizePx: 48,
        fontWeight: "bold",
      });
      const inferredRegular = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        {
          fontFamily: "Custom Fixture",
          fontSizePx: 48,
          fontWeight: "normal",
        },
        "auto",
        registry,
      );
      const bundledRegular = measureText(
        "WWW Hello",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Noto Sans JP", fontSizePx: 48 },
      );

      expect(inferred).toEqual(bundledBold);
      expect(inferredRegular).toEqual(bundledRegular);
    });

    it.each([600, 800, 900])(
      "numeric weight %i は bold face を選択する",
      (weight) => {
        const registry = new FontRegistry([
          CUSTOM_FONT_REGULAR,
          { ...CUSTOM_FONT_BOLD, weight: 600 },
        ]);
        const custom = measureText(
          "WWW Hello",
          Number.POSITIVE_INFINITY,
          {
            fontFamily: "Custom Fixture",
            fontSizePx: 48,
            fontWeight: weight,
          },
          "auto",
          registry,
        );
        const bundledBold = measureText("WWW Hello", Number.POSITIVE_INFINITY, {
          fontFamily: "Noto Sans JP",
          fontSizePx: 48,
          fontWeight: "bold",
        });

        expect(custom).toEqual(bundledBold);
      },
    );

    it("fallback mode は登録済み font も heuristic で計測する", () => {
      const registry = new FontRegistry([CUSTOM_FONT_REGULAR]);
      const customFallback = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Custom Fixture", fontSizePx: 24 },
        "fallback",
        registry,
      );
      const unregisteredFallback = measureText(
        "Hello World",
        Number.POSITIVE_INFINITY,
        { fontFamily: "Unregistered", fontSizePx: 24 },
        "fallback",
      );

      expect(customFallback).toEqual(unregisteredFallback);
    });
  });
});
