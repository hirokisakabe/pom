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
    ],
  },
});
