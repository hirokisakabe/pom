import fs from "fs";
import path from "path";
import { buildPptx } from "../../src/index.js";
import { pptxToPng } from "../../vrt/lib/pptxToPng.js";
import { IMAGES_DIR, NODE_TYPES, type NodeType } from "./config.js";
import { sampleNodes } from "./sampleNodes.js";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;

async function generateNodeImage(nodeType: NodeType): Promise<void> {
  const sampleNode = sampleNodes[nodeType];
  const tempPptxPath = path.join(IMAGES_DIR, `${nodeType}.pptx`);
  const outputPngPath = path.join(IMAGES_DIR, `${nodeType}.png`);

  // PPTXを生成
  const pptx = await buildPptx(
    [sampleNode],
    { w: SLIDE_WIDTH, h: SLIDE_HEIGHT },
    { textMeasurement: "fallback" },
  );

  // PPTXをバッファとして取得
  const pptxBuffer = await pptx.write({ outputType: "nodebuffer" });

  // PPTXファイルを保存
  fs.writeFileSync(tempPptxPath, Buffer.from(pptxBuffer));

  // PPTX → PNG変換
  await pptxToPng(tempPptxPath, outputPngPath);

  // 一時PPTXファイルを削除
  fs.unlinkSync(tempPptxPath);

  console.log(`Generated: ${nodeType}.png`);
}

async function main(): Promise<void> {
  console.log("Generating node images for documentation...\n");

  // 出力ディレクトリを作成
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // 各ノードタイプの画像を生成
  for (const nodeType of NODE_TYPES) {
    await generateNodeImage(nodeType);
  }

  console.log(`\nAll images generated in: ${IMAGES_DIR}`);
}

main().catch((error) => {
  console.error("Error generating node images:", error);
  process.exit(1);
});
