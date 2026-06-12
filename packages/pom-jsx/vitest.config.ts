import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "json-summary"],
      // 実測値 (2026-06-13 時点: statements 89.62 / branches 92.5 / functions 76.74 / lines 98.63)
      // からわずかなマージンを引いた値。下回ると test:coverage が fail する。
      thresholds: {
        statements: 89,
        branches: 92,
        functions: 76,
        lines: 98,
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "react/jsx-dev-runtime",
        replacement: path.resolve(__dirname, "src/jsx-runtime.ts"),
      },
      {
        find: "react/jsx-runtime",
        replacement: path.resolve(__dirname, "src/jsx-runtime.ts"),
      },
      {
        find: "@hirokisakabe/pom-jsx/jsx-runtime",
        replacement: path.resolve(__dirname, "src/jsx-runtime.ts"),
      },
      {
        find: "@hirokisakabe/pom",
        replacement: path.resolve(__dirname, "../pom/src/index.ts"),
      },
    ],
  },
});
