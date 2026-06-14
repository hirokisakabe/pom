import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "browser",
  ignores: [
    "eslint.config.mts",
    "vitest.config.ts",
    "vitest.setup.ts",
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
  ],
});
