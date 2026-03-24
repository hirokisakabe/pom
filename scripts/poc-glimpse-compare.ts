/**
 * POC: PPTX 経由 vs 直接レンダリングの SVG 比較
 *
 * 使い方: npx tsx scripts/poc-glimpse-compare.ts
 */
import { writeFileSync, mkdirSync } from "fs";
import { parseXml } from "../src/parseXml/parseXml.ts";
import { calcYogaLayout } from "../src/calcYogaLayout/calcYogaLayout.ts";
import { extractLayoutResults } from "../src/calcYogaLayout/types.ts";
import { toPositioned } from "../src/toPositioned/toPositioned.ts";
import { freeYogaTree } from "../src/shared/freeYogaTree.ts";
import { createBuildContext } from "../src/buildContext.ts";
import { renderPptx } from "../src/renderPptx/renderPptx.ts";
import { positionedNodeToSlide } from "../src/renderGlimpse/toSlide.ts";
import { renderSlideToSvg } from "pptx-glimpse/renderer";
import { convertPptxToSvg } from "pptx-glimpse";
import type { PositionedNode } from "../src/types.ts";

const OUTPUT_DIR = "scripts/poc-output";
mkdirSync(OUTPUT_DIR, { recursive: true });

const slideSize = { w: 1280, h: 720 };

// 比較用 XML
const xml = `
<VStack w="1280" h="720" padding="24" gap="16" backgroundColor="F1F5F9">
  <Text fontSize="28" bold="true" color="0F172A">Comparison Test</Text>
  <HStack gap="16">
    <VStack w="300" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="14" color="64748B">Revenue</Text>
      <Text fontSize="32" bold="true" color="16A34A">$12,450</Text>
    </VStack>
    <VStack w="300" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="14" color="64748B">Users</Text>
      <Text fontSize="32" bold="true" color="2563EB">1,234</Text>
    </VStack>
  </HStack>
  <HStack gap="16" h="max">
    <VStack w="400" padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="18" bold="true" color="1E293B">Items</Text>
      <Ul fontSize="14" color="475569">
        <Li text="Item one" />
        <Li text="Item two" />
        <Li text="Item three" />
      </Ul>
    </VStack>
    <VStack padding="16" gap="8" backgroundColor="FFFFFF" border.color="E2E8F0" border.width="1" borderRadius="8">
      <Text fontSize="18" bold="true" color="1E293B">Shape</Text>
      <Shape shapeType="ellipse" w="100" h="100" fill.color="4472C4" text="OK" fontSize="18" color="FFFFFF" />
    </VStack>
  </HStack>
</VStack>`;

async function main() {
  const ctx = createBuildContext("fallback");
  console.log("POC: PPTX 経由 vs 直接レンダリング比較");

  const nodes = parseXml(xml);
  const positionedPages: PositionedNode[] = [];

  // Phase 1: calcYogaLayout → toPositioned
  for (const node of nodes) {
    let map;
    try {
      map = await calcYogaLayout(node, slideSize, ctx);
      const layoutMap = extractLayoutResults(map);
      const positioned = toPositioned(node, ctx, layoutMap);
      positionedPages.push(positioned);
    } finally {
      if (map) freeYogaTree(map);
    }
  }

  // Phase 2a: 直接レンダリング
  const directStart = performance.now();
  const directSvgs: string[] = [];
  for (const positioned of positionedPages) {
    const { slide, slideSize: ss } = positionedNodeToSlide(
      positioned,
      slideSize,
    );
    directSvgs.push(renderSlideToSvg(slide, ss));
  }
  const directTime = (performance.now() - directStart).toFixed(1);
  console.log(`直接レンダリング: ${directTime}ms`);

  // Phase 2b: PPTX 経由レンダリング
  const pptxStart = performance.now();
  const pptx = renderPptx(positionedPages, slideSize, ctx);
  const buffer = await pptx.write({ outputType: "uint8array" });
  if (!(buffer instanceof Uint8Array)) {
    throw new Error("Unexpected output type from pptx.write");
  }
  const slides = await convertPptxToSvg(buffer, { width: slideSize.w });
  const pptxSvgs = slides.map((s: { svg: string }) => s.svg);
  const pptxTime = (performance.now() - pptxStart).toFixed(1);
  console.log(`PPTX 経由: ${pptxTime}ms`);

  // Phase 3: 比較 HTML 生成
  const slideElements = directSvgs
    .map(
      (directSvg, i) => `
    <div style="margin-bottom:32px;">
      <h2 style="font-size:16px;color:#333;margin:0 0 8px;">Slide ${i + 1}</h2>
      <div style="display:flex;gap:16px;">
        <div style="flex:1;">
          <div style="font-size:12px;color:#888;margin-bottom:4px;">直接レンダリング (${directTime}ms)</div>
          <div style="border:2px solid #4CAF50;border-radius:4px;overflow:hidden;background:#fff;">
            ${directSvg}
          </div>
        </div>
        <div style="flex:1;">
          <div style="font-size:12px;color:#888;margin-bottom:4px;">PPTX 経由 (${pptxTime}ms)</div>
          <div style="border:2px solid #2196F3;border-radius:4px;overflow:hidden;background:#fff;">
            ${pptxSvgs[i] ?? "<p>N/A</p>"}
          </div>
        </div>
      </div>
    </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>POC: Direct vs PPTX SVG Comparison</title>
</head>
<body style="margin:0;padding:16px;background:#f5f5f5;font-family:sans-serif;">
  <h1 style="font-size:20px;color:#333;">PositionedNode → SVG: Direct vs PPTX 比較</h1>
  <p style="font-size:14px;color:#666;">
    左: 直接レンダリング (PositionedNode → pptx-glimpse Slide → SVG)<br>
    右: PPTX 経由 (PositionedNode → pptxgenjs → PPTX → pptx-glimpse → SVG)
  </p>
  ${slideElements}
</body>
</html>`;

  writeFileSync(`${OUTPUT_DIR}/compare.html`, html);
  console.log("---");
  console.log(`比較 HTML: ${OUTPUT_DIR}/compare.html`);

  // 個別 SVG も保存
  for (const [i, svg] of directSvgs.entries()) {
    writeFileSync(`${OUTPUT_DIR}/compare-direct-${i + 1}.svg`, svg);
  }
  for (const [i, svg] of pptxSvgs.entries()) {
    writeFileSync(`${OUTPUT_DIR}/compare-pptx-${i + 1}.svg`, svg);
  }
}

main();
