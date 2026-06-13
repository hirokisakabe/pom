import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "json-summary"],
      // 実測値 (2026-06-13 時点: statements 97.25 / branches 82.4 / functions 100 / lines 97.2)
      // からわずかなマージンを引いた値。下回ると test:coverage が fail する。
      thresholds: {
        statements: 96,
        branches: 81,
        functions: 99,
        lines: 96,
      },
    },
  },
});
