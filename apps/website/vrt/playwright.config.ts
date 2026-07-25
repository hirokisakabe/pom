import { defineConfig } from "@playwright/test";
import path from "node:path";

const baseURL = "http://127.0.0.1:3000";

export default defineConfig({
  testDir: ".",
  testMatch: "website.spec.ts",
  outputDir: "results",
  snapshotPathTemplate: "{testDir}/expected/{arg}{ext}",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: "line",
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixels: 0,
    },
  },
  use: {
    baseURL,
    browserName: "chromium",
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "en-US",
    timezoneId: "UTC",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3000",
    cwd: path.resolve("."),
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
