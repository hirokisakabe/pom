import fs from "fs";
import path from "path";
import { buildPptx } from "../../src/index.js";
import { comparePng } from "../../vrt/lib/comparePng.js";
import { pptxToPng } from "../../vrt/lib/pptxToPng.js";
import {
  ACTUAL_DIR,
  ATTRIBUTE_DEMOS,
  DIFF_DIR,
  IMAGES_DIR,
  NODE_TYPES,
} from "./config.js";
import { sampleAttributes } from "./sampleAttributes.js";
import { sampleNodes } from "./sampleNodes.js";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

// sampleNodes はスライド内コンテンツのみを持つので <Slide>...</Slide> で包む。
// sampleAttributes は <Theme> を含む可能性があるため文書全体を持ち、そのまま渡す。
interface ImageEntry {
  name: string;
  xml: string;
}

const allEntries: ImageEntry[] = [
  ...NODE_TYPES.map((nodeType) => ({
    name: nodeType,
    xml: `<Slide>${sampleNodes[nodeType]}</Slide>`,
  })),
  ...ATTRIBUTE_DEMOS.map((demo) => ({
    name: demo,
    xml: sampleAttributes[demo],
  })),
];

async function generateImage(
  entry: ImageEntry,
  outputDir: string,
): Promise<void> {
  const tempPptxPath = path.join(outputDir, `${entry.name}.pptx`);

  // PPTXを生成
  const { pptx } = await buildPptx(
    entry.xml,
    { w: SLIDE_WIDTH, h: SLIDE_HEIGHT },
    { textMeasurement: "opentype" },
  );

  // PPTXをバッファとして取得
  const pptxBuffer = await pptx.write({ outputType: "nodebuffer" });

  // PPTXファイルを保存
  fs.writeFileSync(tempPptxPath, Buffer.from(pptxBuffer as Uint8Array));

  // PPTX → PNG変換
  await pptxToPng(tempPptxPath, outputDir, [entry.name]);

  // 一時PPTXファイルを削除
  fs.unlinkSync(tempPptxPath);

  console.log(`Generated: ${entry.name}.png`);
}

async function runCheck(): Promise<void> {
  console.log("=== Docs Images VRT: Visual Regression Testing ===\n");

  // 1. 一時ディレクトリに画像を生成
  console.log("1. Generating images to temporary directory...");
  fs.mkdirSync(ACTUAL_DIR, { recursive: true });
  fs.mkdirSync(DIFF_DIR, { recursive: true });

  for (const entry of allEntries) {
    await generateImage(entry, ACTUAL_DIR);
  }

  // 2. docs/images/*.png（ベースライン）と比較
  console.log("\n2. Comparing with docs/images...");

  const failedImages: { name: string; diffPixels: number }[] = [];

  console.log("\nResults:");
  for (const entry of allEntries) {
    const actualPath = path.join(ACTUAL_DIR, `${entry.name}.png`);
    const expectedPath = path.join(IMAGES_DIR, `${entry.name}.png`);
    const diffPath = path.join(DIFF_DIR, `${entry.name}.png`);

    if (!fs.existsSync(expectedPath)) {
      console.log(`  ? ${entry.name} (baseline not found)`);
      failedImages.push({ name: entry.name, diffPixels: -1 });
      continue;
    }

    const diffPixels = comparePng(actualPath, expectedPath, diffPath);

    if (diffPixels > 0) {
      console.log(`  x ${entry.name} (${diffPixels} pixels differ)`);
      failedImages.push({ name: entry.name, diffPixels });
    } else {
      if (fs.existsSync(diffPath)) {
        fs.unlinkSync(diffPath);
      }
      console.log(`  o ${entry.name}`);
    }
  }

  if (failedImages.length > 0) {
    console.error(
      `\nFAILED: ${failedImages.length} of ${allEntries.length} images differ.`,
    );
    console.error(`Diff images saved in: ${DIFF_DIR}`);
    console.error(
      "Run 'pnpm run docs:images:docker:update' to update docs/images/*.png",
    );
    process.exit(1);
  }

  console.log(
    `\nNo visual differences found. (${allEntries.length} images checked)`,
  );
}

async function runGenerate(): Promise<void> {
  console.log("Generating node images for documentation...\n");

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  for (const entry of allEntries) {
    await generateImage(entry, IMAGES_DIR);
  }

  console.log(`\nAll images generated in: ${IMAGES_DIR}`);
}

async function main(): Promise<void> {
  if (process.argv.includes("--check")) {
    await runCheck();
  } else {
    await runGenerate();
  }
}

main().catch((error) => {
  console.error("Error generating node images:", error);
  process.exit(1);
});
