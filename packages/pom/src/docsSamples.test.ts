import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { buildPptx } from "./buildPptx.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const NODES_MD_PATH = resolve(__dirname, "../docs/nodes.md");

type Sample = { index: number; section: string; xml: string };

function extractXmlSamples(md: string): Sample[] {
  const lines = md.split("\n");
  const samples: Sample[] = [];
  let currentSection = "(top)";
  let inBlock = false;
  let buf: string[] = [];
  let index = 0;
  for (const line of lines) {
    const heading = line.match(/^###\s+(?:\d+\.\s+)?(.+)$/);
    if (heading && !inBlock) {
      currentSection = heading[1].trim();
      continue;
    }
    if (!inBlock && line.trim() === "```xml") {
      inBlock = true;
      buf = [];
      continue;
    }
    if (inBlock && line.trim() === "```") {
      inBlock = false;
      samples.push({
        index: index++,
        section: currentSection,
        xml: buf.join("\n"),
      });
      continue;
    }
    if (inBlock) buf.push(line);
  }
  return samples;
}

// Icon: requires @resvg/resvg-wasm which is not resolvable under tsx/vitest
//       (the dist build path covers it; see issue #646 — out of scope).
// Image: the sample fetches a real URL via prefetchImageSize, which would make
//        the test depend on network availability. Skip to keep the test hermetic.
const SKIP_SECTIONS = new Set(["Icon", "Image"]);

const md = readFileSync(NODES_MD_PATH, "utf8");
const samples = extractXmlSamples(md);

describe("docs/nodes.md xml samples", () => {
  it("には少なくとも 1 つの xml サンプルが含まれる", () => {
    expect(samples.length).toBeGreaterThan(0);
  });

  for (const sample of samples) {
    const skip = SKIP_SECTIONS.has(sample.section);
    const title = `[${sample.index}] ${sample.section} の xml サンプルが diagnostics なしで buildPptx できる`;
    (skip ? it.skip : it)(title, async () => {
      const xml = wrapSampleInSlides(sample.xml);
      const { diagnostics } = await buildPptx(xml, { w: 1280, h: 720 });
      expect(diagnostics).toEqual([]);
    });
  }
});

// docs/nodes.md のサンプルはノードに焦点を当てたスニペットとして記述されており、
// トップレベルに `<Slide>` を含まない。複数のトップレベル要素を 1 つの `<Slide>`
// でまとめると暗黙の VStack でレイアウトされてオーバーフローするので、各
// トップレベル要素を独立した `<Slide>` でラップしてから検証する。
function wrapSampleInSlides(rawXml: string): string {
  if (rawXml.trimStart().startsWith("<Slide")) {
    return rawXml;
  }
  const parser = new XMLParser({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseAttributeValue: false,
    parseTagValue: false,
    trimValues: false,
  });
  const builder = new XMLBuilder({
    preserveOrder: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const wrapped = `<__root__>${rawXml}</__root__>`;
  const parsed = parser.parse(wrapped) as Array<Record<string, unknown>>;
  const rootChildren = (parsed[0]?.["__root__"] as unknown[]) ?? [];
  const topLevelElements = rootChildren.filter(
    (child): child is Record<string, unknown> =>
      typeof child === "object" && child !== null && !("#text" in child),
  );
  if (topLevelElements.length === 0) {
    return `<Slide>${rawXml}</Slide>`;
  }
  return topLevelElements
    .map((el) => `<Slide>${String(builder.build([el]))}</Slide>`)
    .join("\n");
}
