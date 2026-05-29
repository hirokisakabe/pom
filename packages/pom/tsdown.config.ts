import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/clientApi.ts"],
  format: "esm",
  fixedExtension: false,
  dts: true,
  unbundle: true,
  deps: {
    neverBundle: ["yoga-layout", "@resvg/resvg-wasm"],
  },
});
