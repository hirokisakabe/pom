import { bench, describe } from "vitest";

import { buildPptx } from "../src/buildPptx.ts";
import { createBuildContext } from "../src/buildContext.ts";
import { calcYogaLayout } from "../src/calcYogaLayout/calcYogaLayout.ts";
import { measureText } from "../src/calcYogaLayout/measureText.ts";
import { parseXml } from "../src/parseXml/parseXml.ts";
import { freeYogaTree } from "../src/shared/freeYogaTree.ts";

// ---------------------------------------------------------------------------
// Test XML fixtures
// ---------------------------------------------------------------------------

const simpleXml = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="20" alignItems="stretch">
    <Text fontSize="28" bold="true">Simple Slide</Text>
    <Text fontSize="16">Hello World</Text>
  </VStack>
</Slide>
`;

const complexXml = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch">
    <Text fontSize="28" bold="true">Complex Slide</Text>
    <HStack gap="16" alignItems="stretch">
      <VStack gap="8">
        <Text fontSize="14" bold="true">Section A</Text>
        <Ul fontSize="12">
          <Li>Item 1 with some longer text content</Li>
          <Li>Item 2 with even more detailed description</Li>
          <Li>Item 3</Li>
        </Ul>
      </VStack>
      <VStack gap="8">
        <Text fontSize="14" bold="true">Section B</Text>
        <Table defaultRowHeight="32">
          <Col width="100" />
          <Col width="100" />
          <Col width="100" />
          <Tr>
            <Td fontSize="11" bold="true">Header 1</Td>
            <Td fontSize="11" bold="true">Header 2</Td>
            <Td fontSize="11" bold="true">Header 3</Td>
          </Tr>
          <Tr>
            <Td fontSize="11">Cell A1</Td>
            <Td fontSize="11">Cell A2</Td>
            <Td fontSize="11">Cell A3</Td>
          </Tr>
          <Tr>
            <Td fontSize="11">Cell B1</Td>
            <Td fontSize="11">Cell B2</Td>
            <Td fontSize="11">Cell B3</Td>
          </Tr>
          <Tr>
            <Td fontSize="11">Cell C1</Td>
            <Td fontSize="11">Cell C2</Td>
            <Td fontSize="11">Cell C3</Td>
          </Tr>
        </Table>
      </VStack>
    </HStack>
    <HStack gap="12">
      <Shape shapeType="rect" w="120" h="60" fill.color="4472C4" />
      <Shape shapeType="ellipse" w="120" h="60" fill.color="ED7D31" />
      <Shape shapeType="roundRect" w="120" h="60" fill.color="70AD47" />
    </HStack>
  </VStack>
</Slide>
`;

const multiSlideXml = Array.from(
  { length: 10 },
  (_, i) => `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="16" alignItems="stretch">
    <Text fontSize="24" bold="true">Slide ${i + 1}</Text>
    <HStack gap="16" alignItems="stretch">
      <VStack gap="8">
        <Text fontSize="14">Content block A for slide ${i + 1}</Text>
        <Text fontSize="12">Additional details and description text here</Text>
      </VStack>
      <VStack gap="8">
        <Text fontSize="14">Content block B for slide ${i + 1}</Text>
        <Shape shapeType="rect" w="200" h="100" fill.color="4472C4" />
      </VStack>
    </HStack>
  </VStack>
</Slide>
`,
).join("\n");

const slideSize = { w: 1280, h: 720 };

// ---------------------------------------------------------------------------
// Benchmarks
// ---------------------------------------------------------------------------

describe("buildPptx E2E", () => {
  bench("simple slide (text only)", async () => {
    await buildPptx(simpleXml, slideSize);
  });

  bench(
    "complex slide (text + table + shapes)",
    async () => {
      await buildPptx(complexXml, slideSize);
    },
    { time: 5000 },
  );

  bench(
    "10 slides",
    async () => {
      await buildPptx(multiSlideXml, slideSize);
    },
    { time: 5000 },
  );
});

describe("parseXml", () => {
  bench("parse simple XML", () => {
    parseXml(simpleXml);
  });

  bench(
    "parse complex XML",
    () => {
      parseXml(complexXml);
    },
    { time: 5000 },
  );

  bench(
    "parse 10 slides XML",
    () => {
      parseXml(multiSlideXml);
    },
    { time: 5000 },
  );
});

describe("calcYogaLayout", () => {
  bench("layout simple slide", async () => {
    const nodes = parseXml(simpleXml);
    const ctx = createBuildContext("opentype");
    for (const node of nodes) {
      const map = await calcYogaLayout(node, slideSize, ctx);
      freeYogaTree(map);
    }
  });

  bench(
    "layout complex slide",
    async () => {
      const nodes = parseXml(complexXml);
      const ctx = createBuildContext("opentype");
      for (const node of nodes) {
        const map = await calcYogaLayout(node, slideSize, ctx);
        freeYogaTree(map);
      }
    },
    { time: 5000 },
  );
});

describe("measureText (opentype)", () => {
  bench("short text", () => {
    measureText(
      "Hello World",
      500,
      { fontFamily: "Noto Sans JP", fontSizePx: 16 },
      "opentype",
    );
  });

  bench("long text with wrapping", () => {
    measureText(
      "This is a longer piece of text that should require line wrapping when measured against a narrow container width",
      300,
      { fontFamily: "Noto Sans JP", fontSizePx: 14 },
      "opentype",
    );
  });

  bench("CJK text", () => {
    measureText(
      "これはテスト用の日本語テキストです。レイアウト計算のベンチマークに使用します。",
      400,
      { fontFamily: "Noto Sans JP", fontSizePx: 14 },
      "opentype",
    );
  });
});
