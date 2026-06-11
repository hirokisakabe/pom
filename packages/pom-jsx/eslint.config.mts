import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "browser",
  ignores: [
    "**/*.test.ts",
    "**/*.test.tsx",
    "docs/**",
    "eslint.config.mts",
    "vitest.config.ts",
  ],
});
