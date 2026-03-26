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
      // native binary を直接解析しないように js-binding のみ external にする。
      config.externals = config.externals || [];
      config.externals.push("@resvg/resvg-js");
    }
    return config;
  },
});
