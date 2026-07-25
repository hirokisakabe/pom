import { describe, expect, it } from "vitest";
import { extractThemeTokensFromPptx } from "./extractThemeTokensFromPptx.ts";
import { createPptxFixture } from "./testUtils/pptxFixture.ts";
import type { ThemeTokens } from "./types.ts";

describe("extractThemeTokensFromPptx", () => {
  it("srgbClr / sysClr / lastClr を 6 桁大文字 hex に正規化する", async () => {
    const buffer = await createPptxFixture([
      {
        layoutShows: [undefined],
        colors: {
          dk1: { system: "windowText" },
          lt1: { system: "window" },
          accent1: "123456",
          accent2: "abcdef",
          accent3: { system: "windowText", lastColor: "333333" },
          accent4: "444444",
          accent5: "555555",
          accent6: "666666",
        },
      },
    ]);

    await expect(extractThemeTokensFromPptx(buffer)).resolves.toEqual([
      {
        text: "#000000",
        background: "#FFFFFF",
        primary: "#123456",
        secondary: "#ABCDEF",
        accent3: "#333333",
        accent4: "#444444",
        accent5: "#555555",
        accent6: "#666666",
      },
    ]);
  });

  it("slideMaster の clrMap で text / background の scheme slot を解決する", async () => {
    const buffer = await createPptxFixture([
      {
        layoutShows: [undefined],
        colorMap: {
          tx1: "lt1",
          bg1: "dk1",
        },
        colors: {
          dk1: "000000",
          lt1: "ffffff",
        },
      },
    ]);

    const [tokens] = await extractThemeTokensFromPptx(buffer);
    expect(tokens).toMatchObject({
      text: "#FFFFFF",
      background: "#000000",
    });
  });

  it("slideMaster 配下の表示 layout 数だけ tokens を繰り返し hidden layout を除外する", async () => {
    const buffer = await createPptxFixture([
      {
        layoutShows: [undefined, "0", "false", "1"],
        colors: {
          accent1: "101010",
        },
      },
    ]);

    const tokens = await extractThemeTokensFromPptx(buffer);
    expect(tokens).toHaveLength(2);
    expect(tokens.map((token) => token.primary)).toEqual([
      "#101010",
      "#101010",
    ]);
  });

  it("slideMaster と layout の列挙順を保持する", async () => {
    const first: Partial<ThemeTokens> = { primary: "#111111" };
    const second: Partial<ThemeTokens> = { primary: "#222222" };
    const buffer = await createPptxFixture([
      {
        layoutShows: [undefined, undefined],
        colors: { accent1: first.primary?.slice(1) },
      },
      {
        layoutShows: [undefined],
        colors: { accent1: second.primary?.slice(1) },
      },
    ]);

    const tokens = await extractThemeTokensFromPptx(buffer);
    expect(tokens.map((token) => token.primary)).toEqual([
      "#111111",
      "#111111",
      "#222222",
    ]);
  });

  it("presentation の master list にある未使用 slideMaster も抽出する", async () => {
    const buffer = await createPptxFixture([
      {
        layoutShows: [undefined],
        colors: { accent1: "111111" },
      },
      {
        usedBySlide: false,
        layoutShows: [undefined],
        colors: { accent1: "222222" },
      },
    ]);

    const tokens = await extractThemeTokensFromPptx(buffer);
    expect(tokens.map((token) => token.primary)).toEqual([
      "#111111",
      "#222222",
    ]);
  });
});
