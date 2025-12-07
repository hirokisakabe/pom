import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { THRESHOLD } from "./config";

export function comparePng(
  actualPath: string,
  expectedPath: string,
  diffPath: string,
  threshold: number = THRESHOLD,
): number {
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
    { threshold },
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return diffPixels;
}
