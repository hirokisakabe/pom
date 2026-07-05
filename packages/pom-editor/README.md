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

Renders a tree of nodes from the parsed XML. Each row supports two drop targets:

- A thin gap between rows — drop here to insert as a **sibling** at that position (works across parents, so a node can be moved to any container or pulled up to the root).
- The container row body itself — drop here to nest the dragged node as the **last child of that container** (`VStack` / `HStack` / `Layer` only). Drops on non-container bodies are ignored.

Top-level slides can be reordered via the root-level gaps. Cycle-forming drops (e.g. moving a container into its own descendant) are silently rejected.

## License

MIT
