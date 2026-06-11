import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "node",
  ignores: [
    "**/*.test.ts",
    ".vscode-test/**",
    "docs/**",
    "eslint.config.mts",
    "esbuild.mjs",
    "vitest.config.ts",
    ".vscode-test.mjs",
    "run-vsix-test.mjs",
  ],
});
