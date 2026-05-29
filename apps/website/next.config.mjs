import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const __dirname = dirname(fileURLToPath(import.meta.url));
const withNextra = nextra({});

export default withNextra({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: dirname(dirname(__dirname)),
  // @hirokisakabe/pom は dist/ 内で createRequire による動的 require を含むため、
  // バンドラ（webpack / Turbopack）の静的解析対象から外して
  // Node.js ランタイムの require に委ねる。
  serverExternalPackages: ["@resvg/resvg-wasm", "@hirokisakabe/pom"],
  // @hirokisakabe/pom 内の WASM ロード処理は Function コンストラクタで require を
  // 隠蔽しているため Vercel の @vercel/nft が依存を検出できず、デプロイ成果物に
  // @resvg/resvg-wasm が含まれない。明示的にトレース対象へ追加する。
  // Turbopack が動的 require / import を Webpack 同等に解析できるようになれば
  // 隠蔽自体が不要になり、本設定も削除できる。
  // 上流 issue: https://github.com/vercel/next.js/issues/85238
  outputFileTracingIncludes: {
    "/api/**": [
      "../../packages/pom/node_modules/@resvg/resvg-wasm/**/*",
      "../../node_modules/.pnpm/@resvg+resvg-wasm@*/node_modules/@resvg/resvg-wasm/**/*",
    ],
  },
  webpack: (config, { isServer }) => {
    // workspace link は dist/ を参照するため resolve alias でソースを直接参照する。
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // pom は server-only (WASM 含む) のため serverExternalPackages で除外済みだが
    // webpack resolve alias も設定して import を解決させる。
    if (isServer) {
      config.resolve.alias["@hirokisakabe/pom"] = resolve(
        __dirname,
        "../../packages/pom/src/index.ts",
      );
    }
    // pom/clientApi は fs/WASM を含まない純粋な parseXml/serializeXml のみを公開する。
    // サーバー/クライアント両方でソース直参照させてツリーシェイクを有効にする。
    config.resolve.alias["@hirokisakabe/pom/clientApi"] = resolve(
      __dirname,
      "../../packages/pom/src/clientApi.ts",
    );
    // pom-editor は React コンポーネント（client side）のためサーバー/クライアント両方で
    // ソース直参照させる。
    config.resolve.alias["@hirokisakabe/pom-editor"] = resolve(
      __dirname,
      "../../packages/pom-editor/src/index.ts",
    );
    return config;
  },
});
