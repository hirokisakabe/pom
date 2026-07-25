# pom-jsx

`@hirokisakabe/pom-jsx` is a typed JSX/TSX authoring surface. It serializes JSX to the same pom XML consumed by `buildPptx()` and the rest of the pom kit.

## Install

Requires Node.js 22 or later and a TypeScript JSX toolchain.

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

## Build a presentation

```tsx
import { buildPptx } from "@hirokisakabe/pom";
import { renderToXml, Slide, Text, VStack } from "@hirokisakabe/pom-jsx";

const xml = renderToXml(
  <Slide>
    <VStack w="100%" h="max" padding={48} gap={24} alignItems="start">
      <Text fontSize={48} bold>
        Presentation Title
      </Text>
      <Text fontSize={24} color="666666">
        Typed JSX, shared pom XML
      </Text>
    </VStack>
  </Slide>,
);

const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });
```

`renderToXml()` accepts a JSX element, Fragment, or array. pom-jsx's supported pom nodes are exported as PascalCase components with typed props. Ordinary function components can package reusable slide layouts, and inline components such as `B`, `I`, `U`, `A`, `Span`, and `Mark` work inside text.

## Multiple slides

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

The result is still pom XML, so you can inspect it with [pom XML](/pom-xml), pass it to the [core library](/pom-library), or write it to a file for [pom CLI](/pom-cli).
