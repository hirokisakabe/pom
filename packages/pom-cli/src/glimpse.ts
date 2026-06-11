import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const EXTRA_FONT_MAPPING: Record<string, string> = {
  "游ゴシック Light": "Noto Sans CJK JP",
  "Yu Gothic Light": "Noto Sans CJK JP",
};

export function resolveBundledFontsDir(): string {
  const fontsDir = path.resolve(__dirname, "../fonts");
  if (!fs.existsSync(fontsDir)) {
    throw new Error(
      `Bundled fonts directory not found: ${fontsDir}. The package may be corrupted.`,
    );
  }
  return fontsDir;
}
