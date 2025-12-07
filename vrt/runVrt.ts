import fs from "fs";
import { FILES, OUTPUT_DIR } from "./lib/config";
import { generatePptx } from "./lib/generatePptx";
import { pptxToPng } from "./lib/pptxToPng";
import { comparePng } from "./lib/comparePng";

async function main() {
  const updateBaseline = process.argv.includes("--update");

  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("=== VRT: Visual Regression Testing ===\n");

  // 1. PPTXを生成
  console.log("1. Generating PPTX...");
  await generatePptx(FILES.actualPptx);

  // 2. PPTXをPNGに変換
  console.log("2. Converting PPTX to PNG...");
  await pptxToPng(FILES.actualPptx, FILES.actualPng);

  // --updateフラグがある場合はベースラインを更新
  if (updateBaseline) {
    console.log("3. Updating baseline...");
    fs.copyFileSync(FILES.actualPng, FILES.expectedPng);
    console.log(`\nBaseline updated: ${FILES.expectedPng}`);
    return;
  }

  // 3. 画像を比較
  console.log("3. Comparing images...");

  if (!fs.existsSync(FILES.expectedPng)) {
    console.error(`\nExpected image not found: ${FILES.expectedPng}`);
    console.error("Run with --update to create baseline");
    process.exit(1);
  }

  const diffPixels = comparePng(
    FILES.actualPng,
    FILES.expectedPng,
    FILES.diffPng,
  );

  if (diffPixels > 0) {
    console.error(`\nVisual differences found: ${diffPixels} pixels differ.`);
    console.error(`Diff image saved: ${FILES.diffPng}`);
    process.exit(1);
  }

  console.log("\nNo visual differences found.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
