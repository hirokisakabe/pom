<h1 align="center">pom-jsx</h1>
<p align="center">
  JSX/TSX authoring for <a href="https://www.npmjs.com/package/@hirokisakabe/pom">pom</a> — write PowerPoint slides in JSX/TSX.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom-jsx"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom-jsx.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom-jsx.svg" alt="License"></a>
</p>

---

`pom-jsx` lets you write [pom](https://www.npmjs.com/package/@hirokisakabe/pom) slide definitions in JSX/TSX instead of raw XML strings. It renders your JSX tree to the XML that `buildPptx` expects.

## Features

- **JSX/TSX Authoring** — Write pom slides as JSX/TSX. The tree is serialized to a pom XML string and passed to `buildPptx`.
- **Typed Components** — Every pom node is exported as a PascalCase component with typed props, so attribute typos and missing required attributes surface at compile time.
- **Inline Text Formatting** — `B` / `I` / `U` / `S` / `A` / `Span` / `Mark` work inside `Text` and `Li` for bold, italic, underline, strike, links, styled spans, and highlights.
- **Fragment Support** — Standard JSX Fragments (`<>...</>`) render children without a wrapper, making multi-slide composition natural.
- **Reusable Custom Components** — Compose recurring slide layouts as ordinary JSX function components.
- **Smart Attribute Serialization** — Numbers pass through as-is, booleans serialize compactly (`<Text bold>`), and objects / arrays are JSON-stringified automatically.

## Installation

> Requires Node.js 18+ and a TypeScript-with-JSX setup (`tsx` / `ts-node` / compiled `.tsx`).

```bash
npm install @hirokisakabe/pom @hirokisakabe/pom-jsx
```

## Setup

Configure TypeScript to use the custom JSX runtime.

**`tsconfig.json`**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@hirokisakabe/pom-jsx"
  }
}
```

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

## Multiple Slides

Render each slide separately and join with `\n`:

```tsx
import { renderToXml, Slide, Text } from "@hirokisakabe/pom-jsx";

const slides = [
  <Slide key="1">
    <Text>Slide 1</Text>
  </Slide>,
  <Slide key="2">
    <Text>Slide 2</Text>
  </Slide>,
];

const xml = slides.map((s) => renderToXml(s)).join("\n");
```

Or use an array directly:

```tsx
const items = ["Alpha", "Beta", "Gamma"];

const xml = renderToXml(
  <>
    {items.map((item, i) => (
      <Slide key={i}>
        <Text fontSize={32}>{item}</Text>
      </Slide>
    ))}
  </>,
);
```

## Custom Components

Extract reusable slide layouts into function components:

```tsx
import {
  renderToXml,
  Slide,
  HStack,
  VStack,
  Text,
} from "@hirokisakabe/pom-jsx";
import type { ReactNode } from "@hirokisakabe/pom-jsx";

function TwoColumnSlide({
  title,
  left,
  right,
}: {
  title: string;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <Slide>
      <VStack w="max" h="max" padding={48} gap={24}>
        <Text fontSize={32} bold>
          {title}
        </Text>
        <HStack gap={24} w="max">
          <VStack w="50%">{left}</VStack>
          <VStack w="50%">{right}</VStack>
        </HStack>
      </VStack>
    </Slide>
  );
}

const xml = renderToXml(
  <TwoColumnSlide
    title="Comparison"
    left={<Text>Left content</Text>}
    right={<Text>Right content</Text>}
  />,
);
```

## API

### `renderToXml(element)`

Converts a JSX element (or array/Fragment) to an XML string for use with `buildPptx`.

```ts
import { renderToXml } from "@hirokisakabe/pom-jsx";
```

### Components

All pom node types are available as PascalCase components:

| Component      | Description                                                                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Slide`        | Slide wrapper (required top-level element)                                                                                                        |
| `Theme`        | Top-level design token declaration — each prop declares a color token referenced as `$name` from color attributes                                 |
| `Text`         | Text with font styling, inline formatting, optional rotation, and `textGradient` for native gradient text fills                                   |
| `VStack`       | Vertical stack layout                                                                                                                             |
| `HStack`       | Horizontal stack layout                                                                                                                           |
| `Layer`        | Absolute-positioned overlay container                                                                                                             |
| `Ul`           | Unordered list                                                                                                                                    |
| `Ol`           | Ordered list                                                                                                                                      |
| `Li`           | List item                                                                                                                                         |
| `Image`        | Image from path, URL, or base64, with optional rotation                                                                                           |
| `Shape`        | PowerPoint shape (rect, ellipse, roundRect, ...) with optional rotation, native `glow`, and `outline` effects                                     |
| `Chart`        | Chart (bar, line, pie, area, doughnut, radar); `sparkline` prop hides legend / axes / margins for compact `bar` / `line` / `area` (e.g. `h={40}`) |
| `Timeline`     | Timeline / roadmap visualization                                                                                                                  |
| `Matrix`       | 2×2 positioning map                                                                                                                               |
| `Tree`         | Organization chart or decision tree                                                                                                               |
| `Flow`         | Flowchart with nodes and edges                                                                                                                    |
| `ProcessArrow` | Chevron-style process diagram                                                                                                                     |
| `Pyramid`      | Pyramid diagram                                                                                                                                   |
| `Line`         | Horizontal/vertical line                                                                                                                          |
| `Icon`         | Lucide icon with optional rotation; variant background supports native `glow` / `outline` effects                                                 |
| `Svg`          | Inline SVG                                                                                                                                        |
| `Table`        | Table                                                                                                                                             |
| `Tr`           | Table row                                                                                                                                         |
| `Td`           | Table data cell                                                                                                                                   |
| `Th`           | Table header cell                                                                                                                                 |

### Inline text formatting

Use inside `Text`, `Li`, or `Td` for rich inline formatting:

| Component | Effect        |
| --------- | ------------- |
| `B`       | Bold          |
| `I`       | Italic        |
| `U`       | Underline     |
| `S`       | Strikethrough |
| `Sub`     | Subscript     |
| `Sup`     | Superscript   |
| `A`       | Hyperlink     |
| `Span`    | Styled span   |
| `Mark`    | Highlight     |

```tsx
<Text>
  Regular <B>bold</B> and <I>italic</I> with a{" "}
  <A href="https://example.com">link</A>.
</Text>
```

### `Fragment` / `<>...</>`

Fragments are supported — they render their children without a wrapper element:

```tsx
import { Fragment } from "@hirokisakabe/pom-jsx";

const xml = renderToXml(
  <>
    <Slide>
      <Text>Slide 1</Text>
    </Slide>
    <Slide>
      <Text>Slide 2</Text>
    </Slide>
  </>,
);
```

### `ReactNode` type

```ts
import type { ReactNode } from "@hirokisakabe/pom-jsx";
```

Use `ReactNode` to type `children` props in custom components.

## Attribute notes

- **Numbers** are passed as-is: `<Text fontSize={28}>` → `fontSize="28"`
- **Booleans**: `true` props serialize as `"true"`; `false` props are omitted entirely, so `<Text bold>` and `<Text bold={true}>` both work
- **Objects / arrays** (e.g. `data`, `fill`, `border`) are JSON-stringified automatically
- The `key` prop is used for list rendering hints and is not included in the XML output

## License

MIT
