import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

/**
 * LibreOfficeを使ってPPTXをPDFに変換し、ImageMagickでPNGに変換して全スライドを縦に連結した画像を生成
 */
export async function pptxToPng(
  pptxPath: string,
  outputPngPath: string,
): Promise<void> {
  const tempDir = path.join(path.dirname(pptxPath), ".pptx-temp");

  // 一時ディレクトリを作成
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    // 1. LibreOfficeでPPTXをPDFに変換（全ページ含む）
    execSync(
      `soffice --headless --convert-to pdf --outdir "${tempDir}" "${pptxPath}"`,
      { stdio: "inherit" },
    );

    // PDFファイルのパスを取得
    const pptxBasename = path.basename(pptxPath, path.extname(pptxPath));
    const pdfPath = path.join(tempDir, `${pptxBasename}.pdf`);

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not generated: ${pdfPath}`);
    }

    // 2. ImageMagickでPDFを各ページごとにPNGに変換
    const pngPrefix = path.join(tempDir, "page");
    execSync(`convert -density 150 "${pdfPath}" "${pngPrefix}-%03d.png"`, {
      stdio: "inherit",
    });

    // 生成されたPNGファイルを取得（ページ順にソート）
    const pngFiles = fs
      .readdirSync(tempDir)
      .filter((f) => f.startsWith("page-") && f.endsWith(".png"))
      .sort();

    if (pngFiles.length === 0) {
      throw new Error("No PNG pages generated from PDF");
    }

    // 3. 全スライドを縦に連結
    const images = pngFiles.map((f) =>
      PNG.sync.read(fs.readFileSync(path.join(tempDir, f))),
    );

    const totalWidth = Math.max(...images.map((img) => img.width));
    const totalHeight = images.reduce((sum, img) => sum + img.height, 0);

    const output = new PNG({ width: totalWidth, height: totalHeight });

    let yOffset = 0;
    for (const img of images) {
      // 各スライドを連結画像にコピー
      for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
          const srcIdx = (img.width * y + x) << 2;
          const dstIdx = (totalWidth * (yOffset + y) + x) << 2;
          output.data[dstIdx] = img.data[srcIdx];
          output.data[dstIdx + 1] = img.data[srcIdx + 1];
          output.data[dstIdx + 2] = img.data[srcIdx + 2];
          output.data[dstIdx + 3] = img.data[srcIdx + 3];
        }
      }
      yOffset += img.height;
    }

    fs.writeFileSync(outputPngPath, PNG.sync.write(output));
  } finally {
    // 一時ディレクトリを削除
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  }
}
