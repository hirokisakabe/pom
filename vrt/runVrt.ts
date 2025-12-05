import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { pptxToPng } from "./pptxToPng.js";

const VRT_DIR = path.dirname(new URL(import.meta.url).pathname);
const ACTUAL_PPTX = path.join(VRT_DIR, "actual.pptx");
const ACTUAL_PNG = path.join(VRT_DIR, "actual.png");
const EXPECTED_PNG = path.join(VRT_DIR, "expected.png");
const DIFF_PNG = path.join(VRT_DIR, "diff.png");

async function main() {
  const updateBaseline = process.argv.includes("--update");

  console.log("=== VRT: Visual Regression Testing ===\n");

  // 1. PPTXを生成
  console.log("1. Generating PPTX...");
  execSync(`npx tsx ${path.join(VRT_DIR, "genpptx.ts")}`, {
    cwd: path.dirname(VRT_DIR),
    stdio: "inherit",
  });

  // genpptx.tsはカレントディレクトリにactual.pptxを生成するので移動
  const generatedPptx = path.join(path.dirname(VRT_DIR), "actual.pptx");
  if (fs.existsSync(generatedPptx)) {
    fs.renameSync(generatedPptx, ACTUAL_PPTX);
  }

  // 2. PPTXをPNGに変換
  console.log("\n2. Converting PPTX to PNG...");
  await pptxToPng(ACTUAL_PPTX, ACTUAL_PNG);

  // --updateフラグがある場合はベースラインを更新
  if (updateBaseline) {
    console.log("\n3. Updating baseline...");
    fs.copyFileSync(ACTUAL_PNG, EXPECTED_PNG);
    console.log(`Baseline updated: ${EXPECTED_PNG}`);
    return;
  }

  // 3. 画像を比較
  console.log("\n3. Comparing images...");

  if (!fs.existsSync(EXPECTED_PNG)) {
    console.error(`Expected image not found: ${EXPECTED_PNG}`);
    console.error("Run with --update to create baseline");
    process.exit(1);
  }

  const diffPixels = await comparePng(ACTUAL_PNG, EXPECTED_PNG, DIFF_PNG, 0.1);

  if (diffPixels) {
    console.error(`\nVisual differences found: ${diffPixels} pixels differ.`);
    console.error(`Diff image saved: ${DIFF_PNG}`);
    process.exit(1);
  }

  console.log("\nNo visual differences found.");
}

async function comparePng(
  actualPath: string,
  expectedPath: string,
  diffPath: string,
  threshold = 0.1,
): Promise<number> {
  const img1 = PNG.sync.read(fs.readFileSync(actualPath));
  const img2 = PNG.sync.read(fs.readFileSync(expectedPath));

  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error(
      `Image size mismatch: actual(${img1.width}x${img1.height}) vs expected(${img2.width}x${img2.height})`,
    );
  }

  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    {
      threshold,
    },
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return diffPixels;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
