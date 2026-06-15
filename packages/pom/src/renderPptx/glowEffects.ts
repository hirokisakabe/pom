/**
 * Shape / Icon の glow (光彩) 効果の実現
 *
 * pptxgenjs の Shape options には glow 相当のネイティブサポートがないため
 * (TextPropsOptions の glow は文字グリフ用)、以下の方式で実現する:
 *
 * 1. レンダリング時: glow 指定のある shape に一意なマーカー名を `objectName`
 *    として埋め込み、レジストリに登録する。マーカー名は `<p:cNvPr name="..."/>`
 *    として PPTX 出力 XML に書き込まれる。
 * 2. 出力時: pptx.write() / writeFile() をラップし、出力 zip 内のスライド XML
 *    の該当 `<p:sp>` の `<p:spPr>` 末尾に DrawingML ネイティブの
 *    `<a:effectLst><a:glow>...</a:glow></a:effectLst>` を挿入する。
 *
 * 文字列置換採用理由 / 注意点は gradientFills.ts と同様。
 */
import type { TextGlow } from "../types.ts";
import { pxToEmu } from "./units.ts";

type PptxGenJSInstance = import("pptxgenjs").default;
type WriteProps = NonNullable<Parameters<PptxGenJSInstance["write"]>[0]>;
type WriteFileProps = NonNullable<
  Parameters<PptxGenJSInstance["writeFile"]>[0]
>;

async function loadJSZip(): Promise<typeof import("jszip")> {
  const mod = await import("jszip");
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  return (mod as any).default ?? mod;
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
}

interface RegisteredGlow {
  /** objectName に埋め込むマーカー文字列 */
  marker: string;
  /** size (px) — XML 出力時に EMU に変換する */
  sizePx: number;
  /** opacity 0-1 */
  opacity: number;
  /** 6桁 HEX (# なし、大文字) */
  color: string;
}

const MARKER_PREFIX = "pom-glow:";

/**
 * glow 仕様を一意なマーカー名にマップし、後処理で
 * `<a:effectLst><a:glow>` 要素として挿入できるようにするレジストリ
 */
export class GlowEffectRegistry {
  private readonly markerBySpec = new Map<string, string>();
  private readonly registered: RegisteredGlow[] = [];

  /**
   * glow を登録し、`objectName` に渡すマーカー文字列を返す。
   * 同じ仕様の glow は同じマーカーを返す。
   */
  register(glow: TextGlow): string {
    const sizePx = glow.size ?? 8;
    const opacity = glow.opacity ?? 0.75;
    const color = (glow.color ?? "FFFFFF").replace(/^#/, "").toUpperCase();
    const specKey = JSON.stringify({ sizePx, opacity, color });
    const existing = this.markerBySpec.get(specKey);
    if (existing) return existing;

    const index = this.registered.length;
    const marker = `${MARKER_PREFIX}${index}`;
    this.markerBySpec.set(specKey, marker);
    this.registered.push({ marker, sizePx, opacity, color });
    return marker;
  }

  get isEmpty(): boolean {
    return this.registered.length === 0;
  }

  get entries(): readonly RegisteredGlow[] {
    return this.registered;
  }
}

/**
 * DrawingML の `<a:effectLst><a:glow>...</a:glow></a:effectLst>` 要素を構築する
 *
 * - rad (光彩半径): px → EMU
 * - alpha (透明度): 0-1 → 1/1000 % (0-100000)
 */
function buildGlowEffectXml(entry: RegisteredGlow): string {
  const rad = Math.round(pxToEmu(entry.sizePx));
  const alpha = Math.round(entry.opacity * 100000);
  return `<a:effectLst><a:glow rad="${rad}"><a:srgbClr val="${entry.color}"><a:alpha val="${alpha}"/></a:srgbClr></a:glow></a:effectLst>`;
}

/**
 * 1 つの slide XML を受け取り、登録された glow を該当 shape に適用した XML を返す
 *
 * `<p:cNvPr ... name="pom-glow:N"/>` を含む `<p:sp>` ブロックを正規表現で検出し、
 * そのブロック内の最初の `</p:spPr>` の直前に effectLst を挿入する。
 * shape (`<p:sp>`) と picture (`<p:pic>`) の双方の cNvPr が対象となる
 * (現状は Shape のみだが Icon variant の背景 shape にも適用される)。
 */
function applyGlowToXml(xml: string, registry: GlowEffectRegistry): string {
  let result = xml;
  for (const entry of registry.entries) {
    const effectXml = buildGlowEffectXml(entry);
    // cNvPr の name 属性から始まる任意の sp/pic ブロックを最短一致で探し、
    // 最初に出現する </p:spPr> の直前に effectLst を挿入する。
    const re = new RegExp(
      `(<p:cNvPr[^>]*name="${entry.marker}"[^>]*/>[\\s\\S]*?)(</p:spPr>)`,
      "g",
    );
    result = result.replace(re, (_match, prefix, suffix) => {
      return `${prefix as string}${effectXml}${suffix as string}`;
    });
  }
  return result;
}

/**
 * 出力 zip 内のスライド XML に glow 効果を挿入する
 */
export async function applyGlowEffects(
  data: Uint8Array | ArrayBuffer,
  registry: GlowEffectRegistry,
): Promise<import("jszip")> {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(data);

  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(path),
  );
  for (const path of slidePaths) {
    const file = zip.file(path);
    if (!file) continue;
    const original = await file.async("text");
    const replaced = applyGlowToXml(original, registry);
    if (replaced !== original) {
      zip.file(path, replaced);
    }
  }
  return zip;
}

/**
 * pptx インスタンスの write / writeFile をラップし、出力時に glow 後処理を適用する。
 *
 * 既に他の後処理 (gradientFills 等) によりラップされている場合に備え、
 * 元の関数を保存してチェーン可能にしている。
 */
export function patchPptxWriteForGlowEffects(
  pptx: PptxGenJSInstance,
  registry: GlowEffectRegistry,
): void {
  if (registry.isEmpty) return;

  const originalWrite = pptx.write.bind(pptx);
  const originalWriteFile = pptx.writeFile.bind(pptx);

  const patchedWrite = async (rawProps?: WriteProps | string) => {
    const props: WriteProps | undefined =
      typeof rawProps === "string"
        ? ({ outputType: rawProps } as WriteProps)
        : rawProps;
    const data = (await originalWrite({
      outputType: "uint8array",
    })) as Uint8Array;
    const zip = await applyGlowEffects(data, registry);

    const outputType = props?.outputType;
    if (outputType === "STREAM") {
      return zip.generateAsync({
        type: "nodebuffer",
        compression: props?.compression ? "DEFLATE" : "STORE",
      });
    }
    if (outputType) {
      return zip.generateAsync({ type: outputType });
    }
    return zip.generateAsync({
      type: "blob",
      compression: props?.compression ? "DEFLATE" : "STORE",
    });
  };
  pptx.write = patchedWrite;

  const patchedWriteFile = async (rawProps?: WriteFileProps | string) => {
    const props: WriteFileProps | undefined =
      typeof rawProps === "string" ? { fileName: rawProps } : rawProps;
    const isNode =
      typeof process !== "undefined" && Boolean(process.versions?.node);
    if (!isNode) {
      return originalWriteFile(props);
    }
    const rawName = props?.fileName ?? "Presentation.pptx";
    const fileName = rawName.toLowerCase().endsWith(".pptx")
      ? rawName
      : `${rawName}.pptx`;
    const buffer = (await patchedWrite({
      outputType: "nodebuffer",
      compression: props?.compression,
    })) as Buffer;
    const fs = await import("fs");
    await fs.promises.writeFile(fileName, buffer);
    return fileName;
  };
  pptx.writeFile = patchedWriteFile;
}
