import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "node",
  files: ["**/*.{ts,tsx,mts,cts}"],
  ignores: ["**/*.test.ts", "docs/**", "eslint.config.mts", "vitest.config.ts"],
});
