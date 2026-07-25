<h1 align="center">pom-editor</h1>
<p align="center">
  Reusable browser editor for <a href="https://www.npmjs.com/package/@hirokisakabe/pom">pom</a> — XML / AST editing, preview, diagnostics, and host actions.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom-editor"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom-editor.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom-editor.svg" alt="License"></a>
</p>

---

## Features

- **Complete Browser Editor** — `PomEditor` provides XML / AST mode switching, debounced preview, diagnostics, Refresh, pagination, and optional host actions.
- **Drag-and-Drop Structure Editing** — Reorder siblings, move nodes between `VStack` / `HStack` / `Layer` containers, pull container children up to the root, or nest a container inside another — all by dragging in the AST tree.
- **Distinct "between" vs "inside" Drop Targets** — Dropping on the gap before/after a row inserts as a sibling; dropping on a container body itself nests the node inside.
- **XML In / XML Out** — Accepts a pom XML string via `xml` and returns the updated XML via `onChange` after each edit, so it drops into any editor / preview layout.
- **AST-Aware Tree View** — Renders the parsed pom AST as a labeled tree so the structure of slides and nested containers is visible at a glance.
- **Powered by `@dnd-kit/core`** — Built on `@dnd-kit/core`'s `PointerSensor` for pointer-driven drag interactions.

## Installation

> Requires Node.js 22+ and React 18+

```bash
npm install @hirokisakabe/pom-editor react
```

`@hirokisakabe/pom` is pulled in automatically as a regular dependency — no separate install needed.

## Quick Start

### Complete editor

```tsx
import { PomEditor } from "@hirokisakabe/pom-editor";

<PomEditor
  xml={xml}
  onChange={setXml}
  onPreview={async (nextXml, { signal }) => {
    const response = await fetch("/api/preview", {
      method: "POST",
      body: JSON.stringify({ xml: nextXml }),
      signal,
    });
    return response.json();
  }}
  onDownload={(nextXml) => downloadPptx(nextXml)}
  onExportImages={(nextXml, { format, scope, currentSlide }) =>
    exportImages(nextXml, {
      format,
      slides: scope === "current" ? [currentSlide] : undefined,
    })
  }
/>;
```

Preview generation and file operations stay in the host application. `onDownload`, `onExportImages`, `onSave`, and `onCopyPreview` are optional, and their actions only appear when the corresponding callback is provided. Image export adds PNG / SVG and current / all slide controls to the toolbar.
SVG preview results are sanitized before they are inserted into the document.

## API

### `<PomEditor />`

| Prop             | Type                                                                   | Description                                      |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------ |
| `xml`            | `string`                                                               | Controlled pom XML source                        |
| `onChange`       | `(xml: string) => void`                                                | Receives XML and AST edits                       |
| `onPreview`      | `(xml, { signal }) => Promise<{ svgs } \| { errors }>`                 | Host-provided preview adapter                    |
| `onDownload`     | `(xml: string) => void \| Promise<void>`                               | Optional Download action                         |
| `onExportImages` | `(xml, options: PomEditorImageExportOptions) => void \| Promise<void>` | Optional PNG / SVG image export action           |
| `onSave`         | `(xml: string) => void \| Promise<void>`                               | Optional Save action                             |
| `onCopyPreview`  | `(svg: string) => void \| Promise<void>`                               | Optional preview image copy action               |
| `toolbarStart`   | `ReactNode`                                                            | Host content before the standard toolbar actions |
| `toolbarEnd`     | `ReactNode`                                                            | Host content after the standard toolbar actions  |
| `debounceMs`     | `number`                                                               | Preview debounce delay (default: `500`)          |
| `className`      | `string`                                                               | Optional class name for the editor root          |
| `style`          | `CSSProperties`                                                        | Optional inline style for the editor root        |

## License

MIT
