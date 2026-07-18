import { describe, expect, it } from "vitest";
import {
  createGlimpseParagraphs,
  createGlimpseRunProperties,
} from "./glimpseTextBox.ts";

describe("glimpse text box helpers", () => {
  it("run properties は underline / baseline / color options を glimpse input に変換する", () => {
    expect(createGlimpseRunProperties({})).toMatchObject({
      fontFace: "Noto Sans JP",
      fontSize: 18,
      underline: undefined,
      baseline: undefined,
    });
    expect(createGlimpseRunProperties({ underline: false }).underline).toBe(
      undefined,
    );
    expect(createGlimpseRunProperties({ underline: true }).underline).toBe(
      true,
    );
    expect(
      createGlimpseRunProperties({
        color: "#112233",
        underline: { style: "sng", color: "#445566" },
        highlight: "778899",
        subscript: true,
        superscript: true,
      }),
    ).toMatchObject({
      color: { kind: "srgb", hex: "112233" },
      underline: { style: "sng", color: { kind: "srgb", hex: "445566" } },
      highlight: { kind: "srgb", hex: "778899" },
      baseline: { type: "percent", value: -40000 },
    });
    expect(createGlimpseRunProperties({ superscript: true }).baseline).toEqual({
      type: "percent",
      value: 30000,
    });
  });

  it("paragraphs は CRLF を正規化し、align と lineHeight を paragraph properties に渡す", () => {
    const paragraphs = createGlimpseParagraphs(
      "a\r\nb\nc",
      { fontSize: 20 },
      { align: "center", lineHeight: 1.5 },
    );

    expect(paragraphs.map((paragraph) => paragraph.runs[0].text)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(paragraphs[0].properties).toMatchObject({
      align: "center",
      lineSpacing: 2250,
    });
  });
});
