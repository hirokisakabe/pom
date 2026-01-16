/**
 * フォントファイルを Base64 エンコードして TypeScript ファイルに変換するスクリプト
 *
 * 使用方法:
 *   npx tsx scripts/convertFontToBase64.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";

const FONTS_DIR = path.join(import.meta.dirname, "../src/calcYogaLayout/fonts");
const TMP_FONTS_DIR = path.join(import.meta.dirname, "../tmp-fonts");

interface FontConfig {
  inputFile: string;
  outputName: string;
  exportName: string;
}

const fonts: FontConfig[] = [
  {
    inputFile: "NotoSansJP-Regular-min.otf",
    outputName: "notoSansJPRegular.ts",
    exportName: "NOTO_SANS_JP_REGULAR_BASE64",
  },
  {
    inputFile: "NotoSansJP-Bold-min.otf",
    outputName: "notoSansJPBold.ts",
    exportName: "NOTO_SANS_JP_BOLD_BASE64",
  },
];

for (const font of fonts) {
  const inputPath = path.join(TMP_FONTS_DIR, font.inputFile);
  const outputPath = path.join(FONTS_DIR, font.outputName);

  // フォントファイルを読み込んでBase64エンコード
  const fontBuffer = fs.readFileSync(inputPath);
  const base64 = fontBuffer.toString("base64");

  // TypeScriptファイルを生成
  const content = `/**
 * Noto Sans CJK JP min フォント (${font.inputFile})
 * ライセンス: SIL Open Font License 1.1
 * 出典: https://github.com/hiz8/Noto-Sans-CJK-JP.min
 */

export const ${font.exportName} = "${base64}";
`;

  fs.writeFileSync(outputPath, content);
  console.log(
    `Generated: ${outputPath} (${Math.round(base64.length / 1024)}KB)`,
  );
}

console.log("\nDone!");
