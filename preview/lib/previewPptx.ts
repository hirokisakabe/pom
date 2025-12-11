import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pptxToPng } from "../../vrt/lib/pptxToPng";
import { POMNode, buildPptx } from "../../src";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PREVIEW_DIR = path.dirname(__dirname);
const OUTPUT_DIR = path.join(PREVIEW_DIR, "output");

// main.ts と同じサンプルデータを動的にインポート
async function loadMainTs(): Promise<POMNode[]> {
  const mainPath = path.join(PREVIEW_DIR, "..", "main.ts");
  const mainContent = fs.readFileSync(mainPath, "utf-8");

  // main.ts の page 変数を抽出して評価
  // 注: この方法は簡易的なもの。より堅牢な方法が必要な場合は別途検討
  const pageMatch = mainContent.match(/const page: POMNode = ({[\s\S]*?});/);
  if (!pageMatch) {
    throw new Error("Could not find page definition in main.ts");
  }

  // eval を使わず、main.ts を直接実行して PPTX を生成し、それをコピーする方式に変更
  return [];
}

async function main() {
  // 出力ディレクトリを作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("=== Preview: PPTX to PNG ===\n");

  // 1. main.ts を実行してPPTXを生成
  console.log("1. Running main.ts to generate PPTX...");
  const { execSync } = await import("child_process");
  const rootDir = path.join(PREVIEW_DIR, "..");
  execSync("npx tsx main.ts", { cwd: rootDir, stdio: "inherit" });

  // 2. 生成された sample.pptx を preview/output にコピー
  const sourcePptx = path.join(rootDir, "sample.pptx");
  const targetPptx = path.join(OUTPUT_DIR, "sample.pptx");

  if (!fs.existsSync(sourcePptx)) {
    throw new Error(`PPTX file not generated: ${sourcePptx}`);
  }

  fs.copyFileSync(sourcePptx, targetPptx);
  console.log(`   PPTX copied to: ${targetPptx}`);

  // 3. PPTXをPNGに変換
  console.log("2. Converting PPTX to PNG...");
  const targetPng = path.join(OUTPUT_DIR, "sample.png");
  await pptxToPng(targetPptx, targetPng);

  console.log(`\nPreview saved: ${targetPng}`);
  console.log("\nClaude Code can now read this PNG file to check the layout.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
