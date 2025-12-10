import type { PositionedNode, BulletOptions } from "../types";
import { pxToIn, pxToPt } from "./units";

type TextNode = Extract<PositionedNode, { type: "text" }>;

type PptxBulletOptions = {
  type?: "bullet" | "number";
  indent?: number;
  numberType?: BulletOptions["numberType"];
  numberStartAt?: number;
};

export function createBulletOptions(
  bullet: boolean | BulletOptions,
): PptxBulletOptions | boolean {
  if (typeof bullet === "boolean") {
    return bullet;
  }

  const options: PptxBulletOptions = {};

  if (bullet.type !== undefined) {
    options.type = bullet.type;
  }
  if (bullet.indent !== undefined) {
    options.indent = bullet.indent;
  }
  if (bullet.numberType !== undefined) {
    options.numberType = bullet.numberType;
  }
  if (bullet.numberStartAt !== undefined) {
    options.numberStartAt = bullet.numberStartAt;
  }

  return options;
}

export function createTextOptions(node: TextNode) {
  const fontSizePx = node.fontPx ?? 24;
  const fontFamily = node.fontFamily ?? "游ゴシック";
  const lineSpacingMultiple = node.lineSpacingMultiple ?? 1.3;

  const baseOptions = {
    x: pxToIn(node.x),
    y: pxToIn(node.y),
    w: pxToIn(node.w),
    h: pxToIn(node.h),
    fontSize: pxToPt(fontSizePx),
    fontFace: fontFamily,
    align: node.alignText ?? "left",
    valign: "top" as const,
    margin: 0,
    lineSpacingMultiple,
    color: node.color,
    bold: node.bold,
  };

  if (node.bullet !== undefined) {
    return {
      ...baseOptions,
      bullet: createBulletOptions(node.bullet),
    };
  }

  return baseOptions;
}
