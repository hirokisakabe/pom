import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [...configDefaults.exclude, "src/**/*.browser.test.ts"],
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "json-summary"],
      // 実測値 (2026-06-13 時点: statements 87.84 / branches 76.21 / functions 92.76 / lines 89.08)
      // からわずかなマージンを引いた値。下回ると test:coverage が fail する。
      thresholds: {
        statements: 87,
        branches: 75,
        functions: 92,
        lines: 88,
      },
    },
    benchmark: {
      include: ["bench/**/*.bench.ts"],
    },
  },
});
