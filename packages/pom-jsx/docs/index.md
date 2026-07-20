# pom-jsx

`@hirokisakabe/pom-jsx` is a typed JSX/TSX authoring surface for pom. It serializes JSX components to the same pom XML consumed by `buildPptx`, so it adds reusable code composition without introducing a separate presentation model.

Requires Node.js 22 or later and a TypeScript JSX toolchain.

## Install

```bash
npm install @hirokisakabe/pom @hirokisakabe/pom-jsx
```

## Configure the JSX runtime

Set the custom runtime in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hirokisakabe/pom-jsx"
  }
}
```

This uses `@hirokisakabe/pom-jsx/jsx-runtime`; React is not required to render the slide tree.

## Quick Start

```tsx
import { buildPptx } from "@hirokisakabe/pom";
import { renderToXml, Slide, VStack, Text } from "@hirokisakabe/pom-jsx";

const xml = renderToXml(
  <Slide>
    <VStack w="max" h="max" padding={48} gap={24} alignItems="start">
      <Text fontSize={48} bold>
        Presentation Title
      </Text>
      <Text fontSize={24} color="666666">
        Subtitle
      </Text>
    </VStack>
  </Slide>,
);

const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });
```

`renderToXml` accepts a JSX element, array, or Fragment. Supported pom node types are exported as PascalCase components with typed props. Numbers pass through as attribute values, `true` booleans serialize as `"true"`, false booleans are omitted, and objects or arrays are JSON-encoded.

## Multiple slides and reusable components

Use a Fragment for multiple slides:

```tsx
const xml = renderToXml(
  <>
    <Slide>
      <Text>First slide</Text>
    </Slide>
    <Slide>
      <Text>Second slide</Text>
    </Slide>
  </>,
);
```

Ordinary function components can encapsulate repeated layouts and accept typed children or data. The final result remains pom XML, so it can be previewed with [pom CLI](/pom-cli), inspected in [Playground](/playground), passed to `buildPptx`, or parsed with `parseXml`.

See [Choosing an Authoring Format](/authoring) for when to prefer JSX/TSX over raw XML, Markdown, or a visual editor. See [Nodes](/nodes) for the available presentation elements.
