# API Reference

## buildPptx

The main function that takes an XML string and generates a PowerPoint presentation.

### Signature

```typescript
async function buildPptx(
  xml: string,
  slideSize: { w: number; h: number },
  options?: {
    master?: SlideMasterOptions;
    masterPptx?: ArrayBuffer | Uint8Array;
    textMeasurement?: TextMeasurementMode;
    autoFit?: boolean;
  },
): Promise<PptxGenJS>;
```

### Parameters

#### `xml` (required)

An XML string describing the slide content. Each top-level `<Slide>` element represents one slide and wraps that slide's content. See [Nodes](./nodes.md) for available node types and [llm.txt](/llm.txt) for the complete XML reference.

```typescript
const xml = `
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Slide 1</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="24">Slide 2</Text>
  </VStack>
</Slide>
`;
```

#### `slideSize` (required)

The slide dimensions in pixels. Internally converted to inches at 96 DPI.

```typescript
// 16:9 (recommended)
{ w: 1280, h: 720 }

// 4:3
{ w: 960, h: 720 }
```

#### `options` (optional)

| Property          | Type                        | Default     | Description                                                                                       |
| ----------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `master`          | `SlideMasterOptions`        | `undefined` | Slide master settings                                                                             |
| `masterPptx`      | `ArrayBuffer \| Uint8Array` | `undefined` | Existing PPTX file to use as master (extracts background). See [Master Slide](./master-slide.md). |
| `textMeasurement` | `TextMeasurementMode`       | `"auto"`    | Text width measurement method                                                                     |
| `autoFit`         | `boolean`                   | `true`      | Auto-fit content when it overflows slides                                                         |
| `strict`          | `boolean`                   | `false`     | Throw `DiagnosticsError` if any diagnostics are collected                                         |

### Return Value

Returns a `BuildPptxResult` object:

| Field         | Type           | Description                                 |
| ------------- | -------------- | ------------------------------------------- |
| `pptx`        | pptxgenjs      | The generated presentation instance         |
| `diagnostics` | `Diagnostic[]` | Warnings collected during the build process |

```typescript
const { pptx, diagnostics } = await buildPptx(xml, { w: 1280, h: 720 });

// Save to file (Node.js)
await pptx.writeFile({ fileName: "output.pptx" });

// Check for warnings
if (diagnostics.length > 0) {
  console.warn("Build warnings:", diagnostics);
}
```

### Errors

- **`ParseXmlError`** — Thrown when the XML string is invalid or contains unknown tags/attributes.
- **`DiagnosticsError`** — Thrown when `strict: true` is set and diagnostics are collected during build.

```typescript
import { buildPptx, ParseXmlError, DiagnosticsError } from "@hirokisakabe/pom";

try {
  const { pptx } = await buildPptx(xml, { w: 1280, h: 720 }, { strict: true });
} catch (e) {
  if (e instanceof ParseXmlError) {
    console.error("Invalid XML:", e.message);
  }
  if (e instanceof DiagnosticsError) {
    console.error("Build diagnostics:", e.diagnostics);
  }
}
```

---

## Options

### master

Defines a slide master with static objects and page numbers applied to all slides. See [Master Slide](./master-slide.md) for full documentation.

```typescript
const { pptx } = await buildPptx(
  xml,
  { w: 1280, h: 720 },
  {
    master: {
      title: "MY_MASTER",
      background: { color: "F8FAFC" },
      objects: [
        {
          type: "text",
          text: "Header",
          x: 48,
          y: 12,
          w: 200,
          h: 28,
          fontSize: 14,
        },
      ],
      slideNumber: { x: 1100, y: 690, fontSize: 10 },
    },
  },
);
```

### textMeasurement

Controls how text width is measured for line breaking and layout. Accepts `"opentype"`, `"fallback"`, or `"auto"` (default). See [Text Measurement](./text-measurement.md) for details on each mode.

### autoFit

When enabled (default), content that exceeds the slide height is automatically adjusted to fit. Adjustments are applied in priority order:

1. Reduce table row heights
2. Reduce text font sizes
3. Reduce gap / padding
4. Uniform scaling (fallback)

```typescript
// Disable auto-fit
const { pptx } = await buildPptx(
  xml,
  { w: 1280, h: 720 },
  {
    autoFit: false,
  },
);
```

---

## Exported Types

```typescript
import type {
  BuildPptxResult,
  TextMeasurementMode,
  Diagnostic,
  DiagnosticCode,
  SlideMasterOptions,
  SlideMasterBackground,
  SlideMasterMargin,
  MasterObject,
  MasterTextObject,
  MasterImageObject,
  MasterRectObject,
  MasterLineObject,
  SlideNumberOptions,
} from "@hirokisakabe/pom";
```
