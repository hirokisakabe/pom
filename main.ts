import { parsePptx, buildPptx } from "./src";
import * as fs from "fs";

async function main() {
  const data = new Uint8Array(fs.readFileSync("sample.pptx"));
  const pptx = await parsePptx(data);

  console.log("Parsed POM:", JSON.stringify(pptx, null, 2));

  // buildPptx で POMNode[] を PPTX に変換
  const outputData = await buildPptx(pptx.slides, {
    w: pptx.metadata.slideWidth,
    h: pptx.metadata.slideHeight,
  });
  await outputData.writeFile({ fileName: "output.pptx" });
}

main();
