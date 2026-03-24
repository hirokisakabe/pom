import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    exclude: [
      ...configDefaults.exclude,
      "website/**",
      "packages/**",
      "vendor/**",
    ],
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["text", "html", "json", "json-summary"],
    },
    benchmark: {
      include: ["bench/**/*.bench.ts"],
    },
  },
});
