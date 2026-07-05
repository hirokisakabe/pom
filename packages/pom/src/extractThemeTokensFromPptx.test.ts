import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { extractThemeTokensFromPptx } from "./extractThemeTokensFromPptx.ts";
import type { ThemeTokens } from "./types.ts";

const REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships";
const OFFICE_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument";
const SLIDE_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide";
const SLIDE_LAYOUT_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout";
const SLIDE_MASTER_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster";
const THEME_REL =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme";

type ThemeColor =
  | string
  | {
      system: "windowText" | "window";
      lastColor?: string;
    };

interface FixtureMaster {
  colors: Partial<Record<string, ThemeColor>>;
  layoutShows: Array<string | undefined>;
}

const DEFAULT_COLORS: Record<string, ThemeColor> = {
  dk1: "111111",
  lt1: "EEEEEE",
  accent1: "4472C4",
  accent2: "ED7D31",
  accent3: "A5A5A5",
  accent4: "FFC000",
  accent5: "5B9BD5",
  accent6: "70AD47",
};

function relationshipsXml(
  relationships: Array<{ id: string; type: string; target: string }>,
): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="${REL_NS}">
${relationships
  .map(
    (rel) =>
      `<Relationship Id="${rel.id}" Type="${rel.type}" Target="${rel.target}"/>`,
  )
  .join("\n")}
</Relationships>`;
}

function contentTypesXml({
  slideCount,
  layoutCount,
  masterCount,
}: {
  slideCount: number;
  layoutCount: number;
  masterCount: number;
}): string {
  const overrides = [
    [
      "/ppt/presentation.xml",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
    ],
    ...Array.from({ length: slideCount }, (_, index) => [
      `/ppt/slides/slide${index + 1}.xml`,
      "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    ]),
    ...Array.from({ length: layoutCount }, (_, index) => [
      `/ppt/slideLayouts/slideLayout${index + 1}.xml`,
      "application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml",
    ]),
    ...Array.from({ length: masterCount }, (_, index) => [
      `/ppt/slideMasters/slideMaster${index + 1}.xml`,
      "application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml",
    ]),
    ...Array.from({ length: masterCount }, (_, index) => [
      `/ppt/theme/theme${index + 1}.xml`,
      "application/vnd.openxmlformats-officedocument.theme+xml",
    ]),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
${overrides
  .map(
    ([partName, contentType]) =>
      `  <Override PartName="${partName}" ContentType="${contentType}"/>`,
  )
  .join("\n")}
</Types>`;
}

function emptyShapeTreeXml(): string {
  return `<p:spTree>
  <p:nvGrpSpPr>
    <p:cNvPr id="1" name=""/>
    <p:cNvGrpSpPr/>
    <p:nvPr/>
  </p:nvGrpSpPr>
  <p:grpSpPr/>
</p:spTree>`;
}

function presentationXml(slideCount: number): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
${Array.from(
  { length: slideCount },
  (_, index) => `    <p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`,
).join("\n")}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="5143500"/>
</p:presentation>`;
}

function slideXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>${emptyShapeTreeXml()}</p:cSld>
</p:sld>`;
}

function layoutXml(show: string | undefined): string {
  const showAttribute = show === undefined ? "" : ` show="${show}"`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"${showAttribute}>
  <p:cSld name="Layout">${emptyShapeTreeXml()}</p:cSld>
</p:sldLayout>`;
}

function masterXml(layoutIds: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>${emptyShapeTreeXml()}</p:cSld>
  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>
  <p:sldLayoutIdLst>
${layoutIds
  .map((id, index) => `    <p:sldLayoutId id="${index + 1}" r:id="${id}"/>`)
  .join("\n")}
  </p:sldLayoutIdLst>
</p:sldMaster>`;
}

function themeColorXml(slot: string, color: ThemeColor): string {
  if (typeof color === "string") {
    return `<a:${slot}><a:srgbClr val="${color}"/></a:${slot}>`;
  }

  const lastClr =
    color.lastColor === undefined ? "" : ` lastClr="${color.lastColor}"`;
  return `<a:${slot}><a:sysClr val="${color.system}"${lastClr}/></a:${slot}>`;
}

function themeXml(colors: Partial<Record<string, ThemeColor>>): string {
  const merged = { ...DEFAULT_COLORS, ...colors };
  const slots = [
    "dk1",
    "lt1",
    "dk2",
    "lt2",
    "accent1",
    "accent2",
    "accent3",
    "accent4",
    "accent5",
    "accent6",
    "hlink",
    "folHlink",
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Test Theme">
  <a:themeElements>
    <a:clrScheme name="Test Scheme">
${slots.map((slot) => themeColorXml(slot, merged[slot] ?? "000000")).join("\n")}
    </a:clrScheme>
    <a:fontScheme name="Test Font">
      <a:majorFont><a:latin typeface="Arial"/></a:majorFont>
      <a:minorFont><a:latin typeface="Arial"/></a:minorFont>
    </a:fontScheme>
    <a:fmtScheme name="Test Format">
      <a:fillStyleLst/>
      <a:lnStyleLst/>
      <a:effectStyleLst/>
      <a:bgFillStyleLst/>
    </a:fmtScheme>
  </a:themeElements>
</a:theme>`;
}

async function createPptxFixture(
  masters: FixtureMaster[],
): Promise<Uint8Array> {
  const zip = new JSZip();
  const slideCount = masters.length;
  const layoutCount = masters.reduce(
    (sum, master) => sum + master.layoutShows.length,
    0,
  );

  zip.file(
    "[Content_Types].xml",
    contentTypesXml({
      slideCount,
      layoutCount,
      masterCount: masters.length,
    }),
  );
  zip.file(
    "_rels/.rels",
    relationshipsXml([
      { id: "rId1", type: OFFICE_REL, target: "ppt/presentation.xml" },
    ]),
  );
  zip.file("ppt/presentation.xml", presentationXml(slideCount));
  zip.file(
    "ppt/_rels/presentation.xml.rels",
    relationshipsXml(
      masters.map((_, index) => ({
        id: `rId${index + 1}`,
        type: SLIDE_REL,
        target: `slides/slide${index + 1}.xml`,
      })),
    ),
  );

  let layoutIndex = 1;
  masters.forEach((master, masterIndex) => {
    const masterNumber = masterIndex + 1;
    const firstLayoutIndex = layoutIndex;
    const layoutRelIds = master.layoutShows.map(
      (_, index) => `rIdLayout${index + 1}`,
    );

    zip.file(`ppt/slides/slide${masterNumber}.xml`, slideXml());
    zip.file(
      `ppt/slides/_rels/slide${masterNumber}.xml.rels`,
      relationshipsXml([
        {
          id: "rId1",
          type: SLIDE_LAYOUT_REL,
          target: `../slideLayouts/slideLayout${firstLayoutIndex}.xml`,
        },
      ]),
    );

    master.layoutShows.forEach((show) => {
      zip.file(
        `ppt/slideLayouts/slideLayout${layoutIndex}.xml`,
        layoutXml(show),
      );
      zip.file(
        `ppt/slideLayouts/_rels/slideLayout${layoutIndex}.xml.rels`,
        relationshipsXml([
          {
            id: "rId1",
            type: SLIDE_MASTER_REL,
            target: `../slideMasters/slideMaster${masterNumber}.xml`,
          },
        ]),
      );
      layoutIndex += 1;
    });

    zip.file(
      `ppt/slideMasters/slideMaster${masterNumber}.xml`,
      masterXml(layoutRelIds),
    );
    zip.file(
      `ppt/slideMasters/_rels/slideMaster${masterNumber}.xml.rels`,
      relationshipsXml([
        {
          id: "rIdTheme",
          type: THEME_REL,
          target: `../theme/theme${masterNumber}.xml`,
        },
        ...master.layoutShows.map((_, index) => ({
          id: `rIdLayout${index + 1}`,
          type: SLIDE_LAYOUT_REL,
          target: `../slideLayouts/slideLayout${firstLayoutIndex + index}.xml`,
        })),
      ]),
    );
    zip.file(`ppt/theme/theme${masterNumber}.xml`, themeXml(master.colors));
  });

  return zip.generateAsync({ type: "uint8array" });
}

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
});
