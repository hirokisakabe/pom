import path from "path";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../..");
export const IMAGES_DIR = path.join(PROJECT_ROOT, "docs", "images");

// VRT用ディレクトリ
export const OUTPUT_DIR = path.join(IMAGES_DIR, "output");
export const ACTUAL_DIR = path.join(OUTPUT_DIR, "actual");
export const DIFF_DIR = path.join(OUTPUT_DIR, "diff");

export const NODE_TYPES = [
  "text",
  "image",
  "table",
  "shape",
  "chart",
  "timeline",
  "matrix",
  "tree",
  "flow",
  "processArrow",
  "pyramid",
  "vstack",
  "hstack",
  "icon",
  "svg",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];
