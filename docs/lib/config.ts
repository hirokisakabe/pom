import path from "path";

const LIB_DIR = path.dirname(new URL(import.meta.url).pathname);
export const DOCS_DIR = path.dirname(LIB_DIR);
export const IMAGES_DIR = path.join(DOCS_DIR, "images");

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
  "box",
  "vstack",
  "hstack",
] as const;

export type NodeType = (typeof NODE_TYPES)[number];
