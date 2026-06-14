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

- **Live Preview Server** — `pom preview` opens a browser, watches the source file, and rebuilds + reloads on every save (handles editor atomic writes like Vim).
- **PPTX Build** — `pom build` converts `.pom.xml` / `.pom.md` to a `.pptx` file, with optional `--watch` mode for incremental rebuilds.
- **PNG / SVG Render** — `pom render` rasterizes each slide to PNG (default) or SVG without LibreOffice, useful for slide-image previews in docs.
- **Diagnostic Surfacing** — Layout, image, master, and auto-fit diagnostics from `buildPptx` fail the run on stderr with a non-zero exit (`pom build` / `pom render`), while `pom preview` keeps updating so issues can be fixed interactively.
- **Bundled Fonts** — Carlito and Noto Sans CJK JP are bundled for consistent text measurement and SVG rendering across machines.
- **Configurable Output** — Choose port, target slides, output format, text rendering mode (`path` outlines vs native `<text>`), and verbose per-step timing.

## Installation

> Requires Node.js 18+

```bash
npm install -g @hirokisakabe/pom-cli
```

## Quick Start

One command is all it takes — no global install required:

```bash
npx @hirokisakabe/pom-cli preview slides.pom.xml
```

This starts a local preview server, opens your browser automatically, and live-reloads the preview every time the file is saved. This also works well when invoked from agent skills or scripts.

## Usage

### Preview

Starts a local preview server with live reload on file changes.

```bash
pom preview slides.pom.xml
pom preview slides.pom.md
```

The browser opens http://localhost:3000 automatically. The page updates whenever the file is saved — including atomic saves performed by editors like Vim.

To suppress the automatic browser open (e.g. in CI or headless environments):

```bash
pom preview slides.pom.xml --no-open
```

To use a different port (e.g. when 3000 is already in use):

```bash
pom preview slides.pom.xml --port 3001
```

Use the zoom buttons in the toolbar or press `+` / `-` to zoom in and out. The current zoom level is saved across sessions.

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

## Diagnostics

`pom build` and `pom render` invoke `buildPptx` with `strict: true`, so any diagnostic collected during the build — layout problems (`NODE_OUT_OF_BOUNDS`, `NODE_OVERLAP`, `ARROW_REF_NOT_FOUND`, `PER_SIDE_BORDER_WITH_RADIUS`), image / master issues (`IMAGE_MEASURE_FAILED`, `IMAGE_NOT_PREFETCHED`, `MASTER_PPTX_PARSE_FAILED`), or `AUTOFIT_OVERFLOW` — fails the run with a non-zero exit code and prints the diagnostic codes / messages to stderr. Fix the offending XML or input and re-run to proceed. The `pom preview` server continues to update even when diagnostics are emitted, so you can iterate on the file interactively.

## Fonts

This package bundles Carlito and Noto Sans CJK JP fonts for image rendering. These fonts are used when converting slides to SVG in the preview server and to PNG / SVG in `pom render`. System fonts are not scanned.

## License

MIT
