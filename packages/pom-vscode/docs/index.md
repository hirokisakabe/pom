# pom-vscode

VS Code extension for live preview of `.pom.md` and `.pom.xml` files. It converts content to SVG via [pptx-glimpse](https://github.com/nicokoenig/pptx-glimpse) and displays it in a webview panel.

## Requirements

- VS Code 1.101 or later (Node.js 22 extension host)

## Install

Search for **pom** in the VS Code Extensions view, or install from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=hirokisakabe.pom-vscode).

## Usage

1. Open a `.pom.md` or `.pom.xml` file in VS Code
2. Click the preview icon in the editor title bar, or run **pom: Open Preview** from the Command Palette

The preview updates in real-time as you edit the file.

## Commands

| Command             | Description                             |
| ------------------- | --------------------------------------- |
| `pom: Open Preview` | Open a live preview of the current file |
| `pom: Export PPTX`  | Export the current file to PPTX         |

Both commands are available from the Command Palette. For `.pom.md` and `.pom.xml` files, the preview and export icons also appear in the editor title bar.
