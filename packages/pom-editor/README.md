<h1 align="center">pom-editor</h1>
<p align="center">
  Visual AST editor for <a href="https://www.npmjs.com/package/@hirokisakabe/pom">pom</a> — drag-and-drop reordering of slide node trees.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom-editor"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom-editor.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom-editor.svg" alt="License"></a>
</p>

---

## Features

- **Drag-and-Drop Reordering** — Sort sibling nodes within `VStack` / `HStack` / `Layer` containers, plus top-level slides, by dragging them in the AST tree.
- **XML In / XML Out** — Accepts a pom XML string via `xml` and returns the updated XML via `onChange` after each reorder, so it drops into any editor / preview layout.
- **AST-Aware Tree View** — Renders the parsed pom AST as a labeled tree so the structure of slides and nested containers is visible at a glance.
- **Powered by `@dnd-kit`** — Built on `@dnd-kit/core` + `@dnd-kit/sortable` for accessible, keyboard-friendly drag interactions.

## Installation

> Requires React 18+ and `@hirokisakabe/pom` as peer dependencies.

```bash
npm install @hirokisakabe/pom-editor @hirokisakabe/pom react
```

## Quick Start

```tsx
import { PomAstEditor } from "@hirokisakabe/pom-editor";
import { useState } from "react";

const initialXml = `
<Slide>
  <VStack gap="16" padding="24">
    <Text fontSize="32" bold="true">Title</Text>
    <Text>Body text</Text>
  </VStack>
</Slide>
`;

function App() {
  const [xml, setXml] = useState(initialXml);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, borderRight: "1px solid #e5e7eb" }}>
        <PomAstEditor xml={xml} onChange={setXml} />
      </div>
      <div style={{ flex: 1, padding: 24 }}>
        <pre>{xml}</pre>
      </div>
    </div>
  );
}
```

## API

### `<PomAstEditor xml onChange />`

| Prop       | Type                    | Description                                              |
| ---------- | ----------------------- | -------------------------------------------------------- |
| `xml`      | `string`                | pom XML string (one or more `<Slide>` elements)          |
| `onChange` | `(xml: string) => void` | Called with updated XML after each drag-and-drop reorder |

Renders a tree of nodes from the parsed XML. Nodes within the same parent container (`VStack`, `HStack`, `Layer`) can be reordered by dragging. Top-level slides can also be reordered.

## License

MIT
