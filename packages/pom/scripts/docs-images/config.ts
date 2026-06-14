import path from "path";

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, "../..");
export const IMAGES_DIR = path.join(PROJECT_ROOT, "docs", "images");

// VRT用ディレクトリ
const OUTPUT_DIR = path.join(IMAGES_DIR, "output");
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

// 属性レベルの新機能 (gradient / per-side border / text effects / letterSpacing /
// rotation / sub-sup / theme tokens / grow / inline formatting / underline styles /
// highlight / shadow / opacity / layer overlay / combining styles) を、ノード単位
// とは別系統のサンプルとして画像化するためのリスト。
// ファイル名は `attr-<feature>.png` の形でノード画像と衝突しないようにしている。
export const ATTRIBUTE_DEMOS = [
  "attr-theme-tokens",
  "attr-background-gradient",
  "attr-per-side-border",
  "attr-text-effects",
  "attr-letter-spacing",
  "attr-rotation",
  "attr-sub-sup",
  "attr-grow",
  "attr-inline-formatting",
  "attr-underline-styles",
  "attr-highlight",
  "attr-shadow",
  "attr-opacity",
  "attr-layer-overlay",
  "attr-combining-styles",
] as const;

export type AttributeDemo = (typeof ATTRIBUTE_DEMOS)[number];
