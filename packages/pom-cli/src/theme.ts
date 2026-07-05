import fs from "fs";
import path from "path";
import { extractThemeTokensFromPptx } from "@hirokisakabe/pom";

export async function runThemeExtract(inputFile: string): Promise<void> {
  const absInput = path.resolve(inputFile);

  if (!fs.existsSync(absInput)) {
    throw new Error(`Input file not found: ${absInput}`);
  }

  const buffer = fs.readFileSync(absInput);
  const tokens = await extractThemeTokensFromPptx(buffer);
  console.log(JSON.stringify(tokens, null, 2));
}
