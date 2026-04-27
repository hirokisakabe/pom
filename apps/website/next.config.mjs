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
  outputFileTracingIncludes: {
    "/api/**": [
      "../../packages/pom/node_modules/@resvg/resvg-wasm/**/*",
      "../../node_modules/.pnpm/@resvg+resvg-wasm@*/node_modules/@resvg/resvg-wasm/**/*",
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // workspace link の @hirokisakabe/pom は dist/ を参照するため
      // webpack がバンドルせず外部モジュール扱いしてしまう。
      // resolve alias でソースを直接参照し、webpack にバンドルさせる。
      config.resolve = config.resolve || {};
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias["@hirokisakabe/pom"] = resolve(
        __dirname,
        "../../packages/pom/src/index.ts",
      );
    }
    return config;
  },
});
