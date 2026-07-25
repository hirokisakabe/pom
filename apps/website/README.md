<h1 align="center">pom-docs</h1>
<p align="center">
  Documentation website for pom — <a href="https://pom.pptx.app">pom.pptx.app</a>
</p>

---

## Overview

**pom-docs** is the documentation website for the [pom](../../packages/pom/) library. Built with [Next.js](https://nextjs.org/) and [Nextra](https://nextra.site/), it includes API documentation, guides, and an interactive playground.

## Features

- **Documentation** — API reference, node documentation, and guides powered by Nextra.
- **Playground** — Interactive editor to try pom XML in the browser with live PPTX preview.
- **Content Symlink** — Documentation source lives in `packages/pom/docs/` and is symlinked to `content/`.

## Website VRT

The four primary views (`/` desktop/mobile, `/nodes` desktop, and
`/playground` desktop) are compared at their fixed first viewport with
Playwright screenshots. The Docker image builds the production Next.js site
before starting it, and pins the OS, Chromium, locale, timezone, color scheme,
and device scale factor used for screenshots.

Run the comparison from this directory:

```bash
pnpm run vrt:docker
```

After reviewing an intentional visual change, update the expected PNG files in
the same Docker environment:

```bash
pnpm run vrt:docker:update
pnpm run vrt:docker
```

Only files in `vrt/expected/` are committed. `vrt/results/` and the Playwright
report are temporary; CI uploads the expected, actual, and diff images when a
comparison fails.

## License

MIT
