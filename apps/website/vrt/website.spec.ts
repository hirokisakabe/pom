import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const screenshotStylePath = path.resolve("vrt/screenshot.css");

async function waitForStablePage(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images)
        .filter((image) => {
          const bounds = image.getBoundingClientRect();
          return (
            bounds.bottom > 0 &&
            bounds.right > 0 &&
            bounds.top < window.innerHeight &&
            bounds.left < window.innerWidth
          );
        })
        .map(async (image) => {
          if (!image.complete) {
            await new Promise<void>((resolve) => {
              image.addEventListener("load", () => resolve(), { once: true });
              image.addEventListener("error", () => resolve(), { once: true });
            });
          }
          await image.decode().catch(() => undefined);
        }),
    );
  });
}

const cases = [
  {
    name: "landing desktop",
    path: "/",
    screenshot: "landing-desktop.png",
    viewport: { width: 1440, height: 900 },
    ready: (page: Page) =>
      page.getByRole("heading", { name: /to editable PowerPoint/ }),
  },
  {
    name: "landing mobile",
    path: "/",
    screenshot: "landing-mobile.png",
    viewport: { width: 390, height: 844 },
    ready: (page: Page) =>
      page.getByRole("heading", { name: /to editable PowerPoint/ }),
  },
  {
    name: "nodes desktop",
    path: "/nodes",
    screenshot: "nodes-desktop.png",
    viewport: { width: 1440, height: 900 },
    ready: (page: Page) => page.getByRole("heading", { name: "Nodes" }),
  },
  {
    name: "playground desktop",
    path: "/playground",
    screenshot: "playground-desktop.png",
    viewport: { width: 1440, height: 900 },
    ready: (page: Page) => page.getByTestId("pom-slide-preview"),
  },
] as const;

for (const screenshotCase of cases) {
  test(screenshotCase.name, async ({ page }) => {
    await page.setViewportSize(screenshotCase.viewport);
    await page.goto(screenshotCase.path, { waitUntil: "networkidle" });
    await expect(screenshotCase.ready(page)).toBeVisible();
    await waitForStablePage(page);

    await expect(page).toHaveScreenshot(screenshotCase.screenshot, {
      fullPage: false,
      stylePath: screenshotStylePath,
    });
  });
}
