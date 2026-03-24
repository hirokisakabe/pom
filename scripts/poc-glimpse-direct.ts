/**
 * POC: PositionedNode → pptx-glimpse renderer → SVG 直接レンダリング
 *
 * 使い方: npx tsx scripts/poc-glimpse-direct.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { parseXml } from "../src/parseXml/parseXml.ts";
import { calcYogaLayout } from "../src/calcYogaLayout/calcYogaLayout.ts";
import { extractLayoutResults } from "../src/calcYogaLayout/types.ts";
import { toPositioned } from "../src/toPositioned/toPositioned.ts";
import { freeYogaTree } from "../src/shared/freeYogaTree.ts";
import { createBuildContext } from "../src/buildContext.ts";
import { positionedNodeToSlide } from "../src/renderGlimpse/toSlide.ts";
import { renderSlideToSvg } from "pptx-glimpse/renderer";

const OUTPUT_DIR = "scripts/poc-output";
mkdirSync(OUTPUT_DIR, { recursive: true });

const slideSize = { w: 1280, h: 720 };

// テストケース: 基本的なノードタイプを網羅
const testCases: { name: string; xml: string }[] = [
  {
    name: "text-basic",
    xml: `
<VStack w="1280" h="720" padding="48" gap="24" backgroundColor="FFFFFF">
  <Text fontSize="32" bold="true" color="1E293B">Hello World</Text>
  <Text fontSize="20" color="64748B">This is a subtitle text.</Text>
  <Text fontSize="16" color="94A3B8" textAlign="center">Centered text example</Text>
</VStack>`,
  },
  {
    name: "shape-basic",
    xml: `
<VStack w="1280" h="720" padding="48" gap="24" backgroundColor="F8FAFC">
  <HStack gap="24" alignItems="center">
    <Shape shapeType="rect" w="200" h="100" fill.color="4472C4" text="Rectangle" fontSize="16" color="FFFFFF" />
    <Shape shapeType="ellipse" w="150" h="100" fill.color="ED7D31" text="Ellipse" fontSize="16" color="FFFFFF" />
    <Shape shapeType="triangle" w="150" h="100" fill.color="70AD47" />
    <Shape shapeType="diamond" w="120" h="120" fill.color="FFC000" />
  </HStack>
</VStack>`,
  },
  {
    name: "list-basic",
    xml: `
<VStack w="1280" h="720" padding="48" gap="24" backgroundColor="FFFFFF">
  <Text fontSize="24" bold="true" color="1E293B">Lists Example</Text>
  <HStack gap="48">
    <Ul fontSize="18" color="334155">
      <Li text="First item" />
      <Li text="Second item" />
      <Li text="Third item" />
    </Ul>
    <Ol fontSize="18" color="334155">
      <Li text="Step one" />
      <Li text="Step two" />
      <Li text="Step three" />
    </Ol>
  </HStack>
</VStack>`,
  },
  {
    name: "table-basic",
    xml: `
<VStack w="1280" h="720" padding="48" gap="24" backgroundColor="FFFFFF">
  <Text fontSize="24" bold="true" color="1E293B">Table Example</Text>
  <Table>
    <TableColumn width="200" />
    <TableColumn width="200" />
    <TableColumn width="200" />
    <TableRow>
      <TableCell text="Header 1" bold="true" backgroundColor="4472C4" color="FFFFFF" />
      <TableCell text="Header 2" bold="true" backgroundColor="4472C4" color="FFFFFF" />
      <TableCell text="Header 3" bold="true" backgroundColor="4472C4" color="FFFFFF" />
    </TableRow>
    <TableRow>
      <TableCell text="Data A1" />
      <TableCell text="Data A2" />
      <TableCell text="Data A3" />
    </TableRow>
    <TableRow>
      <TableCell text="Data B1" />
      <TableCell text="Data B2" />
      <TableCell text="Data B3" />
    </TableRow>
  </Table>
</VStack>`,
  },
  {
    name: "layout-complex",
    xml: `
<VStack w="1280" h="720" padding="24" gap="16" backgroundColor="F1F5F9">
  <Text fontSize="28" bold="true" color="0F172A">Dashboard</Text>
  <HStack gap="16">
    <VStack w="300" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="14" color="64748B">Revenue</Text>
      <Text fontSize="32" bold="true" color="16A34A">$12,450</Text>
    </VStack>
    <VStack w="300" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="14" color="64748B">Users</Text>
      <Text fontSize="32" bold="true" color="2563EB">1,234</Text>
    </VStack>
    <VStack w="300" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="14" color="64748B">Growth</Text>
      <Text fontSize="32" bold="true" color="DC2626">+15.3%</Text>
    </VStack>
  </HStack>
  <HStack gap="16" h="max">
    <VStack w="600" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="18" bold="true" color="1E293B">Recent Activity</Text>
      <Ul fontSize="14" color="475569">
        <Li text="New user registered" />
        <Li text="Payment processed" />
        <Li text="Report generated" />
      </Ul>
    </VStack>
    <VStack padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="18" bold="true" color="1E293B">Status</Text>
      <Shape shapeType="ellipse" w="80" h="80" fill.color="16A34A" text="OK" fontSize="20" color="FFFFFF" bold="true" />
    </VStack>
  </HStack>
</VStack>`,
  },
  {
    name: "icon-basic",
    xml: `
<VStack w="1280" h="720" padding="48" gap="24" backgroundColor="FFFFFF">
  <Text fontSize="24" bold="true" color="1E293B">Icons</Text>
  <HStack gap="24" alignItems="center">
    <Icon name="cpu" size="48" color="#1D4ED8" />
    <Icon name="database" size="48" color="#16A34A" />
    <Icon name="cloud" size="48" color="#0EA5E9" />
    <Icon name="server" size="48" color="#DC2626" />
    <Icon name="star" size="48" color="#F59E0B" />
  </HStack>
</VStack>`,
  },
];

async function main() {
  const ctx = createBuildContext("fallback");
  console.log(`POC: PositionedNode → SVG 直接レンダリング`);
  console.log(`テストケース数: ${testCases.length}`);
  console.log("---");

  for (const tc of testCases) {
    const start = performance.now();
    try {
      const nodes = parseXml(tc.xml);

      for (const [i, node] of nodes.entries()) {
        let map;
        try {
          map = await calcYogaLayout(node, slideSize, ctx);
          const layoutMap = extractLayoutResults(map);
          const positioned = toPositioned(node, ctx, layoutMap);

          // 新パイプライン: PositionedNode → Slide → SVG
          const { slide, slideSize: ss } = positionedNodeToSlide(
            positioned,
            slideSize,
          );
          const svg = renderSlideToSvg(slide, ss);

          const filename = `${tc.name}${nodes.length > 1 ? `-${i + 1}` : ""}.svg`;
          writeFileSync(`${OUTPUT_DIR}/${filename}`, svg);

          const elapsed = (performance.now() - start).toFixed(1);
          console.log(`✓ ${tc.name} (${elapsed}ms) → ${filename}`);
        } finally {
          if (map) freeYogaTree(map);
        }
      }
    } catch (err) {
      const elapsed = (performance.now() - start).toFixed(1);
      console.error(`✗ ${tc.name} (${elapsed}ms):`, err);
    }
  }

  console.log("---");
  console.log(`出力: ${OUTPUT_DIR}/`);
}

main();
