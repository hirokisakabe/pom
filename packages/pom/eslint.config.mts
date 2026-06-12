import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "browser",
  ignores: [
    "**/*.test.ts",
    "main.ts",
    "vrt/**",
    "preview/**",
    "bench/**",
    "scripts/docs-images/**",
    "scripts/**",
    "docs/**",
    "eslint.config.mts",
    ".dependency-cruiser.cjs",
    "vitest.config.ts",
    "tsdown.config.ts",
    ".size-limit.js",
  ],
});
