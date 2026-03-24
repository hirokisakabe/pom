import type { Emu, Pt, HundredthPt } from "pptx-glimpse/model";
import { asEmu, asHundredthPt } from "pptx-glimpse/model";

/** px (96 DPI) → EMU (1 inch = 914,400 EMU) */
export function pxToEmu(px: number): Emu {
  return asEmu(Math.round(px * 9525));
}

/** px → Point (1 pt = 1/72 inch) */
export function pxToPt(px: number): Pt {
  return (px * 0.75) as Pt;
}

/** px → 1/100 Point */
export function pxToHundredthPt(px: number): HundredthPt {
  return asHundredthPt(Math.round(px * 75));
}
