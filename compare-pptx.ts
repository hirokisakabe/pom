/**
 * sample.pptx と output.pptx を視覚的に比較するスクリプト
 * VRT インフラを活用して PNG 化し、pixelmatch で差分を検出
 */
import path from "path";
import fs from "fs";
import { pptxToPng } from "./vrt/lib/pptxToPng";
import { comparePng } from "./vrt/lib/comparePng";

const ROOT_DIR = path.dirname(new URL(import.meta.url).pathname);
const OUTPUT_DIR = path.join(ROOT_DIR, "vrt", "output");

const FILES = {
  samplePptx: path.join(ROOT_DIR, "sample.pptx"),
  outputPptx: path.join(ROOT_DIR, "output.pptx"),
  samplePng: path.join(OUTPUT_DIR, "sample.png"),
  outputPng: path.join(OUTPUT_DIR, "output.png"),
  diffPng: path.join(OUTPUT_DIR, "diff.png"),
};

async function main() {
  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("=== PPTX 比較開始 ===\n");

  // 1. sample.pptx → sample.png
  console.log("1. sample.pptx を PNG に変換中...");
  await pptxToPng(FILES.samplePptx, FILES.samplePng);
  console.log(`   → ${FILES.samplePng}\n`);

  // 2. output.pptx → output.png
  console.log("2. output.pptx を PNG に変換中...");
  await pptxToPng(FILES.outputPptx, FILES.outputPng);
  console.log(`   → ${FILES.outputPng}\n`);

  // 3. 比較
  console.log("3. PNG を比較中...");
  try {
    const diffPixels = comparePng(
      FILES.outputPng,
      FILES.samplePng,
      FILES.diffPng,
      0.1,
    );

    console.log(`   差分ピクセル数: ${diffPixels}`);
    console.log(`   → ${FILES.diffPng}\n`);

    if (diffPixels === 0) {
      console.log("✅ 完全一致！差分なし");
    } else {
      console.log(`⚠️ ${diffPixels} ピクセルの差分があります`);
      console.log(`   diff.png を確認してください: ${FILES.diffPng}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Image size")) {
      console.log(`⚠️ 画像サイズが異なります: ${error.message}`);
      console.log("   sample.png と output.png を個別に確認してください");
    } else {
      throw error;
    }
  }

  console.log("\n=== 比較完了 ===");
}

main().catch(console.error);
