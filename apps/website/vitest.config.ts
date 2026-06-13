import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["playground/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["playground/**/*.{ts,tsx}"],
      reporter: ["text", "html", "json", "json-summary"],
      // 実測値 (2026-06-13 時点: statements 50.12 / branches 48.29 / functions 53.6 / lines 51.18)
      // からわずかなマージンを引いた値。下回ると test:coverage が fail する。
      thresholds: {
        statements: 49,
        branches: 47,
        functions: 53,
        lines: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
