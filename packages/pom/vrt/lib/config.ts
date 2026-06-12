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
  "25-icon",
  "26-vstack-hstack-shadow",
  "27-hstack-flex-shrink",
  "28-layout-v2",
  "29-icon-in-hstack",
  "30-leaf-padding",
  "31-leaf-padding-composite",
  "32-center-align-hstack",
  "33-custom-font",
  "34-custom-font-wrap",
  "35-icon-inline-svg",
  "36-inline-formatting",
  "37-table-cell-border",
  "38-custom-font-extended",
  "39-arrow",
  "40-letter-spacing",
  "41-gradient",
  "42-flex-grow",
  "43-dark-theme",
  "44-text-effects",
] as const;

export const THRESHOLD = 0.1;
