import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ICON_DATA } from "./iconData.ts";

// @resvg/resvg-wasm を遅延ロードする。
// バンドラ（webpack / Turbopack）のスタティック解析が require / require.resolve を
// 追跡してエラーにするのを避けるため、Function コンストラクタで Node.js の require を
// 取得し、モジュール名は文字列結合で構築する。
// Turbopack が動的 require / import を Webpack 同等に解析できるようになれば
// 隠蔽自体が不要になり、apps/website 側の outputFileTracingIncludes 設定もまとめて
// 撤去できる。
// 上流 issue: https://github.com/vercel/next.js/issues/85238
type ResvgWasm = typeof import("@resvg/resvg-wasm");
const RESVG_PKG = ["@resvg", "resvg-wasm"].join("/");
let resvgModule: ResvgWasm | undefined;
let wasmInitPromise: Promise<void> | undefined;

// Function コンストラクタを使って require を取得することでバンドラの静的解析から
// 完全に隠蔽する。実行時は createRequire で生成した require が利用される。
function getNodeRequire(): NodeJS.Require {
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  const factory = new Function(
    "url",
    "createRequire",
    "return createRequire(url)",
  ) as (
    url: string,
    createRequire: typeof import("node:module").createRequire,
  ) => NodeJS.Require;
  return factory(import.meta.url, createRequire);
}

/**
 * WASM バイナリのパスを解決する。
 * バンドル環境（esbuild）では同ディレクトリの index_bg.wasm を参照し、
 * 非バンドル環境では createRequire で node_modules から解決する。
 */
function resolveWasmPath(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  const localPath = join(dir, "index_bg.wasm");
  if (existsSync(localPath)) return localPath;
  return getNodeRequire().resolve(`${RESVG_PKG}/index_bg.wasm`);
}

/**
 * WASM モジュールを初期化し、Resvg クラスを返す。
 * 並行呼び出しでも安全（Promise をキャッシュ）。
 */
function ensureWasmInitialized(): Promise<void> {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      const mod = getNodeRequire()(RESVG_PKG) as ResvgWasm;
      const wasmPath = resolveWasmPath();
      const wasmBuffer = await readFile(wasmPath);
      await mod.initWasm(wasmBuffer);
      resvgModule = mod;
    })();
  }
  return wasmInitPromise;
}

function getResvg() {
  if (!resvgModule) throw new Error("WASM not initialized");
  return resvgModule.Resvg;
}

function buildIconSvg(name: string, size: number, color: string): string {
  const pathData = ICON_DATA[name];
  if (!pathData) {
    throw new Error(`Unknown icon name: "${name}"`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${pathData}</svg>`;
}

export async function rasterizeIcon(
  name: string,
  size: number,
  color: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = `${name}|${size}|${color}`;
  const cached = cache.get(key);
  if (cached) return cached;

  await ensureWasmInitialized();
  const Resvg = getResvg();
  const svg = buildIconSvg(name, size, color);
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const result = `image/png;base64,${Buffer.from(pngBuffer).toString("base64")}`;
  cache.set(key, result);
  return result;
}

/**
 * インライン SVG 文字列を指定サイズでラスタライズし、base64 PNG を返す。
 * color が指定された場合、SVG ルートに stroke / fill 属性を設定する。
 */
export async function rasterizeSvgContent(
  svgContent: string,
  width: number,
  color: string | undefined,
  cache: Map<string, string>,
  height?: number,
): Promise<string> {
  const h = height ?? width;
  const key = `svg:${svgContent}|${width}|${h}|${color ?? ""}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // SVG に xmlns / width / height を設定し、color があれば stroke / fill を注入
  let svg = svgContent;

  // xmlns が無ければ追加
  if (!svg.includes("xmlns")) {
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // width / height を上書き
  svg = svg.replace(/<svg([^>]*)>/, (match, attrs: string) => {
    let newAttrs = attrs
      .replace(/\bwidth\s*=\s*"[^"]*"/g, "")
      .replace(/\bheight\s*=\s*"[^"]*"/g, "");
    newAttrs += ` width="${width}" height="${h}"`;

    // color 指定時は stroke / fill を設定（プリセットアイコンとの一貫性）
    if (color) {
      if (!attrs.includes("stroke=")) {
        newAttrs += ` stroke="${color}"`;
      }
      if (!attrs.includes("fill=")) {
        newAttrs += ` fill="none"`;
      }
    }

    return `<svg${newAttrs}>`;
  });

  await ensureWasmInitialized();
  const Resvg = getResvg();
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: width } });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const result = `image/png;base64,${Buffer.from(pngBuffer).toString("base64")}`;
  cache.set(key, result);
  return result;
}
