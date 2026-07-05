<h1 align="center">pom-vscode</h1>
<p align="center">
  VS Code extension for live preview of pom-md / pom XML presentations.
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=hirokisakabe.pom-vscode"><img src="https://img.shields.io/visual-studio-marketplace/v/hirokisakabe.pom-vscode.svg" alt="VS Marketplace version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/github/license/hirokisakabe/pom.svg" alt="License"></a>
</p>

<p align="center">
  <img src="images/preview.png" alt="pom-vscode preview" width="800">
</p>

---

## Features

- **Live Preview** — Real-time slide preview as you edit. Changes are reflected instantly.
- **Editor Integration** — Preview button appears in the editor title bar for `.pom.md` / `.pom.xml` files.
- **PPTX Export** — Export to PowerPoint via `pom: Export PPTX` command.
- **Error Diagnostics** — Inline error display helps you catch issues as you type.
- **Command Palette** — Open preview via `pom: Open Preview`, export via `pom: Export PPTX`.

## Installation

> Requires VS Code 1.101+ (Node.js 22 extension host)

Search for **pom** in the VS Code Extensions view, or install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=hirokisakabe.pom-vscode).

## Quick Start

1. Create a new file with `.pom.md` or `.pom.xml` extension
2. Click the preview icon in the editor title bar, or run `pom: Open Preview` from the Command Palette
3. Edit your file — the preview updates in real time
4. When ready, run `pom: Export PPTX` to generate a PowerPoint file

## Supported Formats

| Format  | Extension  | Description                                       |
| ------- | ---------- | ------------------------------------------------- |
| pom-md  | `.pom.md`  | Markdown-based presentation syntax. Easy to write |
| pom XML | `.pom.xml` | XML-based syntax. Fine-grained layout control     |

See the [pom documentation](https://github.com/hirokisakabe/pom) for details.

## License

MIT
