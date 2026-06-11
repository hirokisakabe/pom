import { defineSharedConfig } from "../../eslint.config.shared.mjs";

export default defineSharedConfig({
  tsconfigRootDir: import.meta.dirname,
  environment: "browser",
  ignores: ["eslint.config.mts"],
});
