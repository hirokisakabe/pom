import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

/**
 * 全パッケージ共通の ESLint flat config を生成する。
 * 各パッケージの eslint.config.mts はこの関数を import し、
 * パッケージ固有の差分 (environment / files / ignores / rules) のみを渡す。
 *
 * @param {Object} options
 * @param {string} options.tsconfigRootDir - 各パッケージの `import.meta.dirname` を渡す
 * @param {"browser" | "node"} options.environment - globals の環境
 * @param {string[]} [options.files] - lint 対象の glob (既定: ts/tsx/mts/cts)
 * @param {string[]} [options.ignores] - パッケージ固有の ignore (dist/node_modules は常に ignore)
 * @param {Record<string, unknown>} [options.rules] - パッケージ固有のルール上書き
 */
export function defineSharedConfig({
  tsconfigRootDir,
  environment,
  files = ["**/*.{ts,tsx,mts,cts}"],
  ignores = [],
  rules = {},
}) {
  return defineConfig([
    {
      ignores: ["dist/**", "coverage/**", "node_modules/**", ...ignores],
    },
    {
      files,
      plugins: { js },
      extends: ["js/recommended"],
      languageOptions: {
        globals: globals[environment],
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
    },
    ...tseslint.configs.recommendedTypeChecked,
    {
      files,
      rules: {
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-argument": "error",
        "@typescript-eslint/switch-exhaustiveness-check": [
          "error",
          { considerDefaultExhaustiveForUnions: true },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
        ...rules,
      },
    },
  ]);
}
