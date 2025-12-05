import fs from "fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const actual = "./vrt/actual.png";
const expected = "./vrt/expected.png";
const diff = "./vrt/diff.png";

const diffPixels = await comparePng(actual, expected, diff, 0.1);

if (diffPixels) {
  console.log(`Visual differences found: ${diffPixels} pixels differ.`);
  process.exit(1);
}

console.log("No visual differences found.");

async function comparePng(
  actualPath: string,
  expectedPath: string,
  diffPath: string,
  threshold = 0.1,
) {
  const img1 = PNG.sync.read(fs.readFileSync(actualPath));
  const img2 = PNG.sync.read(fs.readFileSync(expectedPath));

  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error("Image size mismatch");
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
