import * as fs from "fs";
import {
  asEmu,
  asOoxmlAngle,
  asOoxmlPercent,
  type AddPictureCropInput,
  type AddPictureInput,
} from "@pptx-glimpse/document";
import type { ShadowStyle } from "../../types.ts";
import type { RenderContext } from "../types.ts";
import { pxToEmu } from "../units.ts";
import { enrichPictureInput } from "../glimpseAdapter.ts";

type PictureBoundsPx = { x: number; y: number; w: number; h: number };
type ImageSizing = {
  type: "contain" | "cover" | "crop";
  w?: number;
  h?: number;
  x?: number;
  y?: number;
};

const FALLBACK_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function dataToBytes(data: string): Uint8Array {
  const base64 = data.includes(",") ? data.split(",").at(-1) : data;
  return new Uint8Array(Buffer.from(base64 ?? "", "base64"));
}

function isPngOrJpeg(bytes: Uint8Array): boolean {
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47;
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  return isPng || isJpeg;
}

function supportedOrFallback(bytes: Uint8Array): Uint8Array {
  return isPngOrJpeg(bytes) ? bytes : dataToBytes(FALLBACK_PNG);
}

export function imageBytesFromSource(src: string, data?: string): Uint8Array {
  if (data) return supportedOrFallback(dataToBytes(data));
  if (src.startsWith("data:")) return supportedOrFallback(dataToBytes(src));
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return dataToBytes(FALLBACK_PNG);
  }
  try {
    return supportedOrFallback(new Uint8Array(fs.readFileSync(src)));
  } catch {
    return dataToBytes(FALLBACK_PNG);
  }
}

function positiveEmu(valuePx: number) {
  return asEmu(Math.max(1, Math.round(pxToEmu(valuePx))));
}

function createPictureRotationInput(rotate: number | undefined) {
  return rotate !== undefined
    ? asOoxmlAngle(Math.round(rotate * 60000))
    : undefined;
}

function pct(value: number) {
  return asOoxmlPercent(Math.round(value));
}

function createSizingCrop(
  sizing: ImageSizing,
  content: PictureBoundsPx,
): { bounds: PictureBoundsPx; crop?: AddPictureCropInput } {
  const box = {
    x: sizing.x ?? 0,
    y: sizing.y ?? 0,
    w: sizing.w ?? content.w,
    h: sizing.h ?? content.h,
  };
  const img = { w: content.w, h: content.h };

  if (sizing.type === "crop") {
    const cropBase = { w: content.w, h: content.h };
    return {
      bounds: { ...content, w: box.w, h: box.h },
      crop: {
        left: pct(100000 * (box.x / cropBase.w)),
        right: pct(100000 * ((cropBase.w - (box.x + box.w)) / cropBase.w)),
        top: pct(100000 * (box.y / cropBase.h)),
        bottom: pct(100000 * ((cropBase.h - (box.y + box.h)) / cropBase.h)),
      },
    };
  }

  const imgRatio = img.h / img.w;
  const boxRatio = box.h / box.w;
  const isCoverBoxBased = boxRatio > imgRatio;
  const isContainWidthBased = boxRatio > imgRatio;
  const width =
    sizing.type === "cover"
      ? isCoverBoxBased
        ? box.h / imgRatio
        : box.w
      : isContainWidthBased
        ? box.w
        : box.h / imgRatio;
  const height =
    sizing.type === "cover"
      ? isCoverBoxBased
        ? box.h
        : box.w * imgRatio
      : isContainWidthBased
        ? box.w * imgRatio
        : box.h;
  const horizontal = 100000 * 0.5 * (1 - box.w / width);
  const vertical = 100000 * 0.5 * (1 - box.h / height);

  return {
    bounds: { ...content, w: box.w, h: box.h },
    crop: {
      left: pct(horizontal),
      right: pct(horizontal),
      top: pct(vertical),
      bottom: pct(vertical),
    },
  };
}

export function addGlimpsePicture(
  ctx: RenderContext,
  content: PictureBoundsPx,
  bytes: Uint8Array,
  options?: {
    rotate?: number;
    sizing?: ImageSizing;
    name?: string;
    shadow?: ShadowStyle;
  },
): void {
  const sizingResult = options?.sizing
    ? createSizingCrop(options.sizing, content)
    : { bounds: content, crop: undefined };
  const input: AddPictureInput = {
    bytes,
    offsetX: asEmu(Math.round(pxToEmu(content.x))),
    offsetY: asEmu(Math.round(pxToEmu(content.y))),
    width: positiveEmu(sizingResult.bounds.w),
    height: positiveEmu(sizingResult.bounds.h),
    rotation: createPictureRotationInput(options?.rotate),
    crop: sizingResult.crop,
  };
  ctx.authoring.addPicture(
    enrichPictureInput(input, options?.shadow),
    options?.name,
  );
}
