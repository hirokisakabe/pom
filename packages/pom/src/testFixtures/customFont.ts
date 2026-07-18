import type { FontInput } from "../buildPptx.ts";
import { NOTO_SANS_JP_BOLD_BASE64 } from "../calcYogaLayout/fonts/notoSansJPBold.ts";
import { NOTO_SANS_JP_REGULAR_BASE64 } from "../calcYogaLayout/fonts/notoSansJPRegular.ts";

function decodeBase64(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export const CUSTOM_FONT_REGULAR: FontInput = {
  name: "Custom Fixture",
  data: decodeBase64(NOTO_SANS_JP_REGULAR_BASE64),
};

export const CUSTOM_FONT_BOLD: FontInput = {
  name: "Custom Fixture",
  data: decodeBase64(NOTO_SANS_JP_BOLD_BASE64).buffer,
  weight: "bold",
};

export const CUSTOM_FONT_WITHOUT_ALIAS: FontInput = {
  data: CUSTOM_FONT_REGULAR.data,
};
