# @hirokisakabe/pom-cli

CLI tool for [pom](https://github.com/hirokisakabe/pom) — preview and build presentations from pom XML / Markdown.

## Installation

```bash
npm install -g @hirokisakabe/pom-cli
```

## Usage

### Preview

Starts a local preview server with live reload on file changes.

```bash
pom preview slides.pom.xml
pom preview slides.pom.md
```

Open http://localhost:3000 in your browser. The page updates automatically when the file is saved.

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

To print per-step timing on stderr:

```bash
pom build slides.pom.xml -o output.pptx --verbose
```

## Fonts

This package bundles Carlito and Noto Sans CJK JP fonts for SVG rendering. These fonts are used when converting slides to SVG in the preview server. System fonts are not scanned.

## License

MIT
