import * as esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const watch = process.argv.includes("--watch");
const buildTest = process.argv.includes("--test");

// CJS バンドルで import.meta.url が空になる問題を解消するプラグイン。
// pom の dist ファイルが createRequire(import.meta.url) を使用しているため、
// CJS 互換の __filename ベース URL に置き換える。
// pptx-glimpse が sharp をトップレベルで import しているが、
// pom-vscode では convertPptxToSvg のみ使用し sharp は不要。
// sharp はネイティブバイナリを含むため VSIX にバンドルできないので、
// 空のスタブモジュールに置き換える。
const sharpStubPlugin = {
  name: "sharp-stub",
  setup(build) {
    build.onResolve({ filter: /^sharp$/ }, () => ({
      path: "sharp",
      namespace: "sharp-stub",
    }));
    build.onLoad({ filter: /.*/, namespace: "sharp-stub" }, () => ({
      contents: "module.exports = {};",
      loader: "js",
    }));
  },
};

// @resvg/resvg-wasm の WASM バイナリを dist にコピーするプラグイン。
// pom が依存する resvg-wasm の WASM ファイルを pom の node_modules 経由で解決する。
const resvgWasmPlugin = {
  name: "resvg-wasm-copy",
  setup(build) {
    // pom パッケージの node_modules から解決する
    const pomDir = path.resolve(import.meta.dirname, "../pom");
    const pomRequire = createRequire(path.join(pomDir, "package.json"));
    const wasmSrc = pomRequire.resolve("@resvg/resvg-wasm/index_bg.wasm");
    const outdir = path.dirname(build.initialOptions.outfile);
    const wasmDest = path.join(outdir, "index_bg.wasm");

    build.onEnd(() => {
      fs.mkdirSync(outdir, { recursive: true });
      fs.copyFileSync(wasmSrc, wasmDest);
    });
  },
};

// @resvg/resvg-wasm の JS モジュールをバンドルに含めるプラグイン。
// renderIcon.js は Function コンストラクタ + createRequire で動的にモジュールを
// ロードするため（webpack / Turbopack の静的解析回避）、esbuild も静的解析できない。
// onLoad で静的 require に書き換えることで esbuild が依存を認識しバンドルに含める。
const resvgModulePlugin = {
  name: "resvg-module-resolve",
  setup(build) {
    const targetSuffix = path.join("dist", "icons", "renderIcon.js");
    build.onLoad({ filter: /renderIcon\.js$/ }, async (args) => {
      if (!args.path.endsWith(targetSuffix)) return undefined;
      let contents = await fs.promises.readFile(args.path, "utf8");
      const original = contents;
      // 動的 require を静的 require に書き換え
      contents = contents.replace(
        /const mod = (?:getNodeRequire\(\)\(RESVG_PKG\)|require\(RESVG_PKG\))/,
        'const mod = require("@resvg/resvg-wasm")',
      );
      if (contents === original) {
        throw new Error(
          "Failed to patch renderIcon.js: dynamic require pattern not found. " +
            "The upstream code in @hirokisakabe/pom may have changed.",
        );
      }
      // このプラグインが先に処理するため importMetaPlugin が適用されない。
      // CJS バンドルで import.meta.url が空になる問題を同様に解消する。
      // fileURLToPath(import.meta.url) → __filename（既にパスなので変換不要）
      contents = contents.replace(
        /fileURLToPath\(import\.meta\.url\)/g,
        "__filename",
      );
      // createRequire(import.meta.url) → createRequire(__filename)
      contents = contents.replace(
        /createRequire\(import\.meta\.url\)/g,
        "createRequire(__filename)",
      );
      // 残りの import.meta.url（getNodeRequire の factory 引数など）→ __filename
      contents = contents.replace(/import\.meta\.url/g, "__filename");
      return { contents, loader: "js" };
    });
  },
};

const importMetaPlugin = {
  name: "import-meta-url-shim",
  setup(build) {
    build.onLoad({ filter: /\.js$/, namespace: "file" }, async (args) => {
      // node_modules 外の .js ファイルで import.meta.url を含むもののみ対象
      if (args.path.includes("node_modules")) return undefined;
      const contents = await fs.promises.readFile(args.path, "utf8");
      if (!contents.includes("import.meta.url")) return undefined;
      return {
        contents: contents.replace(/import\.meta\.url/g, "__filename"),
        loader: "js",
      };
    });
  },
};

/** @type {import('esbuild').BuildOptions} */
const buildOptions = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  external: ["vscode"],
  loader: { ".node": "copy" },
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  plugins: [
    sharpStubPlugin,
    resvgWasmPlugin,
    resvgModulePlugin,
    importMetaPlugin,
  ],
};

/** @type {import('esbuild').BuildOptions} */
const testBuildOptions = {
  entryPoints: ["src/test/extension.test.ts"],
  bundle: true,
  outfile: "dist/test/extension.test.js",
  external: ["vscode", "mocha", "assert"],
  loader: { ".node": "copy" },
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  plugins: [
    sharpStubPlugin,
    resvgWasmPlugin,
    resvgModulePlugin,
    importMetaPlugin,
  ],
};

/** @type {import('esbuild').BuildOptions} */
const vsixRunnerBuildOptions = {
  entryPoints: ["src/test/vsix-runner.ts"],
  bundle: true,
  outfile: "dist/test/vsix-runner.js",
  external: ["vscode", "mocha"],
  loader: { ".node": "copy" },
  format: "cjs",
  platform: "node",
  target: "node18",
  sourcemap: true,
  plugins: [importMetaPlugin],
};

if (watch) {
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log("Watching for changes...");
} else {
  await esbuild.build(buildOptions);
  if (buildTest) {
    await esbuild.build(testBuildOptions);
    await esbuild.build(vsixRunnerBuildOptions);
    console.log("Build complete (with tests)");
  } else {
    console.log("Build complete");
  }
}
