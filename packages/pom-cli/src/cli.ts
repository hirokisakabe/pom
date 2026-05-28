#!/usr/bin/env node
import { runBuild } from "./build.ts";
import { runPreview } from "./preview.ts";

const args = process.argv.slice(2);
const command = args[0];

if (command === "preview") {
  const inputFile = args[1];
  if (!inputFile) {
    console.error("Usage: pom preview <input.pom.xml|input.pom.md>");
    process.exit(1);
  }
  try {
    runPreview(inputFile);
  } catch (err: unknown) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
} else if (command === "build") {
  const inputFile = args[1];
  const outputIndex = args.indexOf("-o");
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : undefined;
  if (!inputFile || !outputFile) {
    console.error(
      "Usage: pom build <input.pom.xml|input.pom.md> -o <output.pptx>",
    );
    process.exit(1);
  }
  runBuild(inputFile, outputFile).catch((err: unknown) => {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  });
} else {
  console.error("Usage:");
  console.error("  pom preview <input.pom.xml|input.pom.md>");
  console.error("  pom build <input.pom.xml|input.pom.md> -o <output.pptx>");
  process.exit(1);
}
