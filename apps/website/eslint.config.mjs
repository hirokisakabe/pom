import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "browser",
  ignores: [".next/**", "**/*.mjs", "next-env.d.ts"],
  rules: {
    "@typescript-eslint/unbound-method": "off",
  },
});
