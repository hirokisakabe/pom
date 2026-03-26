import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import nextra from "nextra";

const withNextra = nextra({});

export default withNextra({
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  outputFileTracingRoot: dirname(
    dirname(dirname(fileURLToPath(import.meta.url))),
  ),
  serverExternalPackages: ["@resvg/resvg-js"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // workspace リンクされた @hirokisakabe/pom は serverExternalPackages では
      // 外部化されず、内部の @resvg/resvg-js native バイナリの解析に失敗する。
      // @resvg 関連パッケージのみ webpack externals で明示的に除外する。
      config.externals = config.externals || [];
      config.externals.push(/^@resvg\//);
    }
    return config;
  },
});
