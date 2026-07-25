<h1 align="center">pom-cli</h1>
<p align="center">
  CLI tool for <a href="https://www.npmjs.com/package/@hirokisakabe/pom">pom</a> — preview, build, and render presentations from pom XML / Markdown.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom-cli"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom-cli.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom-cli.svg" alt="License"></a>
</p>

---

## Features

- **Browser Editor + Live Preview** — `pom preview` opens the shared `PomEditor`, with XML / AST editing, unsaved previews, and explicit conflict-safe saves for `.pom.xml` files.
- **PPTX Build** — `pom build` converts `.pom.xml` / `.pom.md` to a `.pptx` file, with optional `--watch` mode for incremental rebuilds.
- **PNG / SVG Render** — `pom render` rasterizes each slide to PNG (default) or SVG without LibreOffice, useful for slide-image previews in docs.
- **Theme Extraction** — `pom theme extract` reads an existing `.pptx` and prints its theme colors as pom `ThemeTokens` JSON, for onboarding brand assets.
- **Diagnostic Surfacing** — Layout, image, master, and auto-fit diagnostics from `buildPptx` fail the run on stderr with a non-zero exit (`pom build` / `pom render`), while `pom preview` keeps updating so issues can be fixed interactively.
- **Bundled Fonts** — Carlito and Noto Sans CJK JP are bundled for SVG / PNG rendering, so output looks the same on machines without those fonts installed.
- **Configurable Output** — Choose port, target slides, output format, text rendering mode (`path` outlines vs native `<text>`), and verbose per-step timing.

## Installation

> Requires Node.js 22+

```bash
npm install -g @hirokisakabe/pom-cli
```

## Quick Start

One command is all it takes — no global install required:

```bash
npx @hirokisakabe/pom-cli preview slides.pom.xml
```

This starts a local editor and preview server and opens your browser automatically. The editor client is bundled with `pom-cli`, so it does not need a CDN or an internet connection. This also works well when invoked from agent skills or scripts.

## Usage

### Preview

Starts the browser editor and live preview server.

```bash
pom preview slides.pom.xml
pom preview slides.pom.md
```

The browser opens http://localhost:3000 automatically. For `.pom.xml` files, XML and AST edits are kept in the browser and immediately reflected in the preview. Use **Save** to write the current XML back to the input file. If another editor changed the file after it was loaded, Save is rejected instead of overwriting that change. Successful saves replace the file atomically.

External file changes continue to update the browser when there are no unsaved browser edits. When unsaved edits exist, they are preserved and the toolbar reports the external change. `.pom.md` input remains preview-only because writing generated XML back to Markdown is outside the editor's scope.

To suppress the automatic browser open (e.g. in CI or headless environments):

```bash
pom preview slides.pom.xml --no-open
```

To use a different port (e.g. when 3000 is already in use):

```bash
pom preview slides.pom.xml --port 3001
```

To print per-step timing on stderr when each rebuild completes:

```bash
pom preview slides.pom.xml --verbose
```

### Build

Converts a pom file to a PPTX file.

```bash
pom build slides.pom.xml -o output.pptx
pom build slides.pom.md -o output.pptx
```

To watch for file changes and rebuild automatically:

```bash
pom build slides.pom.xml -o output.pptx --watch
```

The process stays running and rebuilds every time the input file is saved. Build progress is printed to stderr:

```
[pom] Watching: slides.pom.xml
[pom] Built: output.pptx (367ms)
[pom] File changed, rebuilding...
[pom] Built: output.pptx (342ms)
```

If a build fails, the error is printed but the process continues watching for the next change. Press `Ctrl+C` to stop.

To print per-step timing on stderr:

```bash
pom build slides.pom.xml -o output.pptx --verbose
```

### Render

Renders each slide to a PNG (default) or SVG image — no LibreOffice or other external tools required.

```bash
pom render slides.pom.xml -o ./images
pom render slides.pom.md -o ./images
```

The images are written to the output directory as `slide-01.png`, `slide-02.png`, ... The directory is created if it does not exist. The rendering pipeline is the same as the preview server, so the images match what you see in `pom preview`.

> **LibreOffice fallback caveat:** Current `pom render` uses `pptx-glimpse` directly and does not require LibreOffice. If you are using an older `pom-cli` / `pptx-glimpse` version or a fallback workflow that converts PPTX through LibreOffice before PNG output, pure numeric text with leading zeros (for example `01` / `001`) may be displayed without those zeros in the PNG (`01` -> `1`). The generated PPTX keeps the original text (`<a:t>01</a:t>`), so it displays as intended when opened in PowerPoint. For decorative numbering that must survive both paths, mix in one non-numeric character such as `01.` or `#01`.

To output SVG instead of PNG:

```bash
pom render slides.pom.xml -o ./images --format svg
```

By default, SVG output converts text to `<path>` outlines so it renders identically in any environment. Pass `--text-output text` to emit native `<text>` elements with subsetted fonts embedded as `@font-face` data URIs instead — text becomes selectable and renders with browser font hinting, but may not display correctly when the SVG is referenced via `<img src="...">` or sanitized:

```bash
pom render slides.pom.xml -o ./images --format svg --text-output text
```

To render only specific slides (1-based, comma-separated) — useful when re-checking just the slides you edited:

```bash
pom render slides.pom.xml -o ./images --slides 2,5
```

To print per-step timing on stderr:

```bash
pom render slides.pom.xml -o ./images --verbose
```

### Theme Extract

Extracts PowerPoint theme colors from an existing `.pptx` as pom `ThemeTokens` JSON — useful for onboarding brand assets (e.g. the `pom-theme` agent skill).

```bash
pom theme extract brand-master.pptx
```

Prints a JSON array to stdout with one entry per visible slide layout (`text` / `background` / `primary` / `secondary` / `accent3`–`accent6`, all 6-digit uppercase hex prefixed with `#`), preserving the source master/layout order.

## Diagnostics

`pom build` and `pom render` invoke `buildPptx` with `strict: true`, so any diagnostic collected during the build — layout problems (`NODE_OUT_OF_BOUNDS`, `NODE_OVERLAP`, `ARROW_REF_NOT_FOUND`), image / master issues (`IMAGE_MEASURE_FAILED`, `IMAGE_NOT_PREFETCHED`, `MASTER_PPTX_PARSE_FAILED`), or `AUTOFIT_OVERFLOW` — fails the run with a non-zero exit code and prints the diagnostic codes / messages to stderr. Fix the offending XML or input and re-run to proceed. The `pom preview` server continues to update even when diagnostics are emitted, so you can iterate on the file interactively.

## Fonts

This package bundles Carlito and Noto Sans CJK JP fonts for image rendering. These fonts are used when converting slides to SVG in the preview server and to PNG / SVG in `pom render`. System fonts are not scanned.

## License

MIT
