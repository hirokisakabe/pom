import path from "path";

const LIB_DIR = path.dirname(new URL(import.meta.url).pathname);
const VRT_DIR = path.dirname(LIB_DIR);
export const OUTPUT_DIR = path.join(VRT_DIR, "output");

export const EXPECTED_DIR = path.join(VRT_DIR, "expected");
export const ACTUAL_DIR = path.join(OUTPUT_DIR, "actual");
export const DIFF_DIR = path.join(OUTPUT_DIR, "diff");

export const FILES = {
  actualPptx: path.join(OUTPUT_DIR, "actual.pptx"),
} as const;

export const PAGE_NAMES = [
  "01-text",
  "02-bullet",
  "03-image",
  "03b-image-sizing",
  "04-table",
  "05-shape",
  "06-chart",
  "07-layout",
  "08-common",
  "09-timeline",
  "10-chart-additional",
  "11-matrix",
  "12-tree",
  "13-flow",
  "14-process-arrow",
  "15-line",
  "16-layer",
  "17-hstack-table",
  "18-opacity",
  "19-shadow",
  "20-background-image",
  "21-xml-child-elements",
  "22-composite-scale-to-fit",
  "23-table-colspan-rowspan",
  "24-pyramid",
  "25-markdown-1",
  "25-markdown-2",
  "25-markdown-3",
  "25-markdown-4",
] as const;

export const THRESHOLD = 0.1;
