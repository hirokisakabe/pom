import { describe, expect, it } from "vitest";
import {
  createGlimpseParagraphs,
  createGlimpseRunProperties,
  listBulletXmlTransform,
  listLineSpacingXmlTransform,
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
      baseline: "subscript",
    });
    expect(createGlimpseRunProperties({ superscript: true }).baseline).toBe(
      "superscript",
    );
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

  it("listBulletXmlTransform は self-closing pPr と buNone 付き pPr を bullet XML に置換する", () => {
    const transform = listBulletXmlTransform({
      kind: "bullet",
      lineHeight: 1.1,
    });

    expect(transform('<a:pPr algn="l"/>')).toBe(
      '<a:pPr algn="l" marL="342900" indent="-342900"><a:lnSpc><a:spcPct val="110000"/></a:lnSpc><a:buSzPct val="100000"/><a:buChar char="&#x2022;"/></a:pPr>',
    );
    expect(transform("<a:pPr><a:buNone/></a:pPr>")).toBe(
      '<a:pPr marL="342900" indent="-342900"><a:lnSpc><a:spcPct val="110000"/></a:lnSpc><a:buSzPct val="100000"/><a:buChar char="&#x2022;"/></a:pPr>',
    );
    expect(transform("<a:pPr><a:buChar/></a:pPr>")).toBe(
      "<a:pPr><a:buChar/></a:pPr>",
    );
  });

  it("listBulletXmlTransform は numbering の startAt と unsupported scheme fallback を保持する", () => {
    const unsupported = listBulletXmlTransform({
      kind: "number",
      scheme: "unsupported",
      startAt: 3,
    })("<a:pPr/>");
    expect(unsupported).toContain(
      '<a:buAutoNum type="arabicPeriod" startAt="3"/>',
    );

    const defaultStart = listBulletXmlTransform({
      kind: "number",
      scheme: "romanUcPeriod",
    })("<a:pPr/>");
    expect(defaultStart).toContain(
      '<a:buAutoNum type="arabicPeriod" startAt="1"/>',
    );
  });

  it("listLineSpacingXmlTransform は self-closing pPr と既存 pPr を line spacing XML に置換する", () => {
    const transform = listLineSpacingXmlTransform({ lineHeight: 1.4 });

    expect(transform('<a:pPr algn="r"/>')).toBe(
      '<a:pPr algn="r"><a:lnSpc><a:spcPct val="140000"/></a:lnSpc><a:buNone/></a:pPr>',
    );
    expect(
      transform(
        '<a:pPr><a:lnSpc><a:spcPct val="90000"/></a:lnSpc><a:buNone/><a:defRPr/></a:pPr>',
      ),
    ).toBe(
      '<a:pPr><a:lnSpc><a:spcPct val="140000"/></a:lnSpc><a:buNone/><a:defRPr/></a:pPr>',
    );
  });
});
