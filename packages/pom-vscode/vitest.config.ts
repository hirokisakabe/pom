import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: ["src/test/**", "dist/test/**", "node_modules/**"],
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "json-summary"],
      // 実測値 (2026-06-13 時点: statements 31.25 / branches 32.95 / functions 29.03 / lines 31.92)
      // からわずかなマージンを引いた値。下回ると test:coverage が fail する。
      thresholds: {
        statements: 30,
        branches: 32,
        functions: 28,
        lines: 31,
      },
    },
  },
});
