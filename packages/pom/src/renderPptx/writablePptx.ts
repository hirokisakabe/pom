import { writePptx, type PptxSourceModel } from "@pptx-glimpse/document";
import type { Buffer as NodeBuffer } from "node:buffer";

export type PptxOutputType =
  | "arraybuffer"
  | "base64"
  | "binarystring"
  | "blob"
  | "nodebuffer"
  | "uint8array";

export type PptxWriteOptions = {
  outputType?: PptxOutputType;
};

export type PptxWriteFileOptions = {
  fileName?: string;
};

export type PptxWriteOutput<T extends PptxOutputType | undefined> =
  T extends "arraybuffer"
    ? ArrayBuffer
    : T extends "base64" | "binarystring"
      ? string
      : T extends "nodebuffer"
        ? NodeBuffer
        : T extends "uint8array"
          ? Uint8Array
          : Blob;

export interface WritablePptx {
  write(): Promise<Blob>;
  write<T extends PptxOutputType>(
    options: PptxWriteOptions & { outputType: T },
  ): Promise<PptxWriteOutput<T>>;
  write(
    options: PptxWriteOptions,
  ): Promise<PptxWriteOutput<PptxOutputType | undefined>>;
  stream(): Promise<Uint8Array>;
  writeFile(options?: PptxWriteFileOptions | string): Promise<string>;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function toBinaryString(bytes: Uint8Array): string {
  let result = "";
  for (const byte of bytes) result += String.fromCharCode(byte);
  return result;
}

function toBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined")
    return Buffer.from(bytes).toString("base64");
  return btoa(toBinaryString(bytes));
}

function normalizeFileName(fileName: string): string {
  return fileName.toLowerCase().endsWith(".pptx")
    ? fileName
    : `${fileName}.pptx`;
}

function downloadInBrowser(fileName: string, bytes: Uint8Array): void {
  const blob = new Blob([toArrayBuffer(bytes)], {
    type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  const cleanup = () => {
    try {
      anchor.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  };
  let cleanupScheduled = false;
  try {
    document.body.append(anchor);
    anchor.click();
    setTimeout(cleanup, 0);
    cleanupScheduled = true;
  } finally {
    if (!cleanupScheduled) cleanup();
  }
}

export function createWritablePptx(
  getSource: () => PptxSourceModel,
): WritablePptx {
  function write(options?: PptxWriteOptions): Promise<unknown> {
    return Promise.resolve().then(() => {
      const bytes = writePptx(getSource());
      switch (options?.outputType) {
        case "arraybuffer":
          return toArrayBuffer(bytes);
        case "base64":
          return toBase64(bytes);
        case "binarystring":
          return toBinaryString(bytes);
        case "nodebuffer":
          return Buffer.from(bytes);
        case "uint8array":
          return bytes;
        case "blob":
        case undefined:
          return new Blob([toArrayBuffer(bytes)], {
            type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          });
      }
    });
  }

  return {
    write: write as WritablePptx["write"],
    stream() {
      return Promise.resolve().then(() => writePptx(getSource()));
    },
    async writeFile(options) {
      const fileName = normalizeFileName(
        typeof options === "string"
          ? options
          : (options?.fileName ?? "Presentation.pptx"),
      );
      const bytes = writePptx(getSource());
      if (typeof document !== "undefined") {
        downloadInBrowser(fileName, bytes);
      } else {
        const fs = await import("node:fs/promises");
        await fs.writeFile(fileName, bytes);
      }
      return fileName;
    },
  };
}
