import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "node",
  files: ["**/*.{ts,mts,cts}"],
  ignores: ["**/*.test.ts", "eslint.config.mts", "vitest.config.ts"],
});
