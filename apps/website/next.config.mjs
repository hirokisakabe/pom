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
