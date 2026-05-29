# @hirokisakabe/pom-editor

Visual AST editor for [pom](https://github.com/hirokisakabe/pom) — drag-and-drop reordering of slide node trees.

## Install

```bash
npm install @hirokisakabe/pom-editor @hirokisakabe/pom react
```

## Usage

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

| Prop | Type | Description |
|---|---|---|
| `xml` | `string` | pom XML string (one or more `<Slide>` elements) |
| `onChange` | `(xml: string) => void` | Called with updated XML after each drag-and-drop reorder |

Renders a tree of nodes from the parsed XML. Nodes within the same parent container (`VStack`, `HStack`, `Layer`) can be reordered by dragging. Top-level slides can also be reordered.

## Requirements

- React 18 or later
- `@hirokisakabe/pom` (peer dependency resolved automatically as a workspace dependency; install separately in non-monorepo setups)

## License

MIT
