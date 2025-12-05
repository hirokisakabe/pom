import path from "path";

const LIB_DIR = path.dirname(new URL(import.meta.url).pathname);
export const VRT_DIR = path.dirname(LIB_DIR);
export const OUTPUT_DIR = path.join(VRT_DIR, "output");

export const FILES = {
  actualPptx: path.join(OUTPUT_DIR, "actual.pptx"),
  actualPng: path.join(OUTPUT_DIR, "actual.png"),
  expectedPng: path.join(VRT_DIR, "expected.png"),
  diffPng: path.join(OUTPUT_DIR, "diff.png"),
} as const;

export const THRESHOLD = 0.1;
