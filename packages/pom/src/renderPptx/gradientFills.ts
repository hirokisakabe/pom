/**
 * グラデーション塗りの実現
 *
 * pptxgenjs はグラデーション塗りを未サポート
 * (https://github.com/gitbrent/PptxGenJS/issues/102) のため、以下の方式で実現する:
 *
 * 1. レンダリング時: グラデーション指定のある shape をビルド内で一意なマーカー色の
 *    単色塗り (solidFill) として描画し、レジストリに登録する
 * 2. 出力時: pptx.write() / writeFile() をラップし、出力 zip 内のスライド XML の
 *    `<a:solidFill><a:srgbClr val="マーカー色"/></a:solidFill>` を
 *    DrawingML ネイティブの `<a:gradFill>` に置換する
 *
 * 置換は pptxgenjs が生成する固定パターンに対する完全一致の文字列置換で行う。
 * スライド XML 全体をパーサーで往復させると無関係な要素の表現が変わり得るため、
 * 意図的に文字列置換を採用している。
 */
import type { Gradient } from "../shared/gradient.ts";
import { parseGradient, parseLinearGradient } from "../shared/gradient.ts";

type PptxGenJSInstance = import("pptxgenjs").default;
type WriteProps = NonNullable<Parameters<PptxGenJSInstance["write"]>[0]>;
type WriteFileProps = NonNullable<
  Parameters<PptxGenJSInstance["writeFile"]>[0]
>;

// JSZip は CJS パッケージのため動的 import で読み込む
async function loadJSZip(): Promise<typeof import("jszip")> {
  const mod = await import("jszip");
  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
  return (mod as any).default ?? mod;
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return */
}

interface RegisteredGradientFill {
  /** マーカー色 (6桁大文字 HEX、# なし) */
  marker: string;
  gradient: Gradient;
  /** 0-1。指定時は各カラーストップに alpha として反映する */
  opacity?: number;
}

/** マーカー色の探索開始値。reserveColors で予約済みの色はスキップされる */
const MARKER_BASE = 0x0f7a3d;

export class GradientFillRegistry {
  private readonly reserved = new Set<string>();
  private readonly markerBySpec = new Map<string, string>();
  private readonly registered: RegisteredGradientFill[] = [];
  private nextCandidate = MARKER_BASE;

  /**
   * テキスト中に現れる 6桁 HEX をマーカー候補から除外する。
   * 入力 XML 由来のユーザー指定色とマーカーの衝突を防ぐため、
   * register より前に入力 XML 文字列を渡しておく。
   */
  reserveColors(text: string): void {
    for (const match of text.matchAll(/[0-9a-fA-F]{6}/g)) {
      this.reserved.add(match[0].toUpperCase());
    }
  }

  /** グラデーションを登録し、対応するマーカー色を返す */
  register(gradient: Gradient, opacity?: number): string {
    const specKey = JSON.stringify({ gradient, opacity });
    const existing = this.markerBySpec.get(specKey);
    if (existing) return existing;

    let marker: string;
    do {
      marker = this.nextCandidate.toString(16).toUpperCase().padStart(6, "0");
      this.nextCandidate = (this.nextCandidate + 1) % 0x1000000;
    } while (this.reserved.has(marker));
    this.reserved.add(marker);

    this.markerBySpec.set(specKey, marker);
    this.registered.push({ marker, gradient, opacity });
    return marker;
  }

  get isEmpty(): boolean {
    return this.registered.length === 0;
  }

  get entries(): readonly RegisteredGradientFill[] {
    return this.registered;
  }
}

/**
 * backgroundGradient 属性値をパースしてレジストリに登録し、マーカー色を返す。
 * linear-gradient / radial-gradient の両方に対応。
 * パースできない場合 (スキーマ検証済みのため通常発生しない) は undefined を返す。
 */
export function registerBackgroundGradient(
  value: string,
  opacity: number | undefined,
  registry: GradientFillRegistry,
): string | undefined {
  const gradient = parseGradient(value);
  if (!gradient) return undefined;
  return registry.register(gradient, opacity);
}

/**
 * textGradient 属性値をパースしてレジストリに登録し、マーカー色を返す。
 * 戻り値のマーカー色を text run の color に渡すと、pptxgenjs が出力する
 * `<a:rPr><a:solidFill><a:srgbClr val="マーカー色"/></a:solidFill></a:rPr>` が
 * 後処理で gradFill に置換され、PowerPoint 上ネイティブの文字グラデーションとして
 * 表示・編集可能になる。
 *
 * textGradient は radial-gradient を受け付けない (linear-gradient のみ)。
 * パースできない場合 (スキーマ検証済みのため通常発生しない) は undefined を返す。
 */
export function registerTextGradient(
  value: string,
  registry: GradientFillRegistry,
): string | undefined {
  const linear = parseLinearGradient(value);
  if (!linear) return undefined;
  return registry.register({ kind: "linear", value: linear });
}

/**
 * Gradient を DrawingML の `<a:gradFill>` 要素に変換する
 *
 * - カラーストップ位置: % → 1/1000 % (0-100000)
 * - 角度 (linear): CSS 基準 (0deg = 上向き) → DrawingML 基準 (0 = 右向き、1/60000 度)
 * - 中心位置 (radial): CSS 風 % → DrawingML `<a:fillToRect l/t/r/b>` (1/1000 %)。
 *   fillToRect は焦点を表す矩形で、中心位置 (cx, cy) に対し
 *   l=cx*1000 / t=cy*1000 / r=(100-cx)*1000 / b=(100-cy)*1000 とする。
 *   PowerPoint の radial fill は path="circle" 1 種類で、shape (circle / ellipse) や
 *   size キーワードを描画上区別しない。要素の縦横比に応じて自動で楕円状になる。
 */
function buildGradFillXml(gradient: Gradient, opacity?: number): string {
  const alphaXml =
    opacity !== undefined
      ? `<a:alpha val="${Math.round(opacity * 100000)}"/>`
      : "";
  const gsXml = gradient.value.stops
    .map((stop) => {
      const pos = Math.round(stop.position * 1000);
      const srgbClr = alphaXml
        ? `<a:srgbClr val="${stop.color}">${alphaXml}</a:srgbClr>`
        : `<a:srgbClr val="${stop.color}"/>`;
      return `<a:gs pos="${pos}">${srgbClr}</a:gs>`;
    })
    .join("");

  if (gradient.kind === "linear") {
    const dmlAngle = (((gradient.value.angle - 90) % 360) + 360) % 360;
    const ang = Math.round(dmlAngle * 60000);
    return `<a:gradFill flip="none" rotWithShape="1"><a:gsLst>${gsXml}</a:gsLst><a:lin ang="${ang}" scaled="0"/></a:gradFill>`;
  }

  const { centerX, centerY } = gradient.value;
  const l = Math.round(centerX * 1000);
  const t = Math.round(centerY * 1000);
  const r = Math.round((100 - centerX) * 1000);
  const b = Math.round((100 - centerY) * 1000);
  return `<a:gradFill flip="none" rotWithShape="1"><a:gsLst>${gsXml}</a:gsLst><a:path path="circle"><a:fillToRect l="${l}" t="${t}" r="${r}" b="${b}"/></a:path></a:gradFill>`;
}

/**
 * 出力 zip 内のスライド XML のマーカー solidFill を gradFill に置換する
 */
export async function applyGradientFills(
  data: Uint8Array | ArrayBuffer,
  registry: GradientFillRegistry,
): Promise<import("jszip")> {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(data);

  const slidePaths = Object.keys(zip.files).filter((path) =>
    /^ppt\/slides\/slide\d+\.xml$/.test(path),
  );
  for (const path of slidePaths) {
    const file = zip.file(path);
    if (!file) continue;
    let xml = await file.async("text");
    let replaced = false;
    for (const { marker, gradient, opacity } of registry.entries) {
      const target = `<a:solidFill><a:srgbClr val="${marker}"/></a:solidFill>`;
      if (!xml.includes(target)) continue;
      xml = xml.replaceAll(target, buildGradFillXml(gradient, opacity));
      replaced = true;
    }
    if (replaced) {
      zip.file(path, xml);
    }
  }
  return zip;
}

/**
 * pptx インスタンスの write / writeFile をラップし、
 * 出力時にグラデーション後処理を適用する。
 *
 * pptxgenjs の write と同じ outputType / compression の挙動を再現する。
 * writeFile は Node 環境のみ後処理対象 (ブラウザでは pptxgenjs がダウンロード
 * 処理を行うため、元の実装にフォールバックする)。
 */
export function patchPptxWriteForGradientFills(
  pptx: PptxGenJSInstance,
  registry: GradientFillRegistry,
): void {
  if (registry.isEmpty) return;

  const originalWrite = pptx.write.bind(pptx);
  const originalWriteFile = pptx.writeFile.bind(pptx);

  const patchedWrite = async (rawProps?: WriteProps | string) => {
    // DEPRECATED: pptxgenjs は write(outputType) の文字列 overload を
    // ランタイムでは今も受け付けるため、同様に正規化する
    const props: WriteProps | undefined =
      typeof rawProps === "string"
        ? ({ outputType: rawProps } as WriteProps)
        : rawProps;
    const data = (await originalWrite({
      outputType: "uint8array",
    })) as Uint8Array;
    const zip = await applyGradientFills(data, registry);

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
    // DEPRECATED: pptxgenjs は writeFile(fileName) の文字列 overload を
    // ランタイムでは今も受け付けるため、同様に正規化する
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
