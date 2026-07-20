# @hirokisakabe/pom

`@hirokisakabe/pom` is the core TypeScript library behind every pom authoring surface and tool. Use it directly when you are building an application, service, or custom rendering pipeline.

## Install

Requires Node.js 22 or later.

```bash
npm install @hirokisakabe/pom
```

## Build a PPTX

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const xml = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24">
    <Text fontSize="40" bold="true">Hello from pom</Text>
  </VStack>
</Slide>`;

const { pptx, diagnostics } = await buildPptx(xml, { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });
```

`buildPptx()` parses pom XML, calculates Flexbox-style layout, converts the result to positioned nodes, and renders native PowerPoint objects.

## Related APIs

- `parseXml()` / `serializeXml()` provide validated XML and AST conversion. The browser-safe `@hirokisakabe/pom/clientApi` subpath exports only these APIs and `POMNode`.
- `extractThemeTokensFromPptx()` reads theme colors from existing PowerPoint files.
- `extractSlideMastersAsPptx()` creates one blank slide per visible layout for master inspection.
- `buildPptx(..., { strict: true })` throws when diagnostics are produced.

See the [API Reference](/api-reference) for signatures and options, [pom XML](/pom-xml) for the shared input model, and [Nodes](/nodes) for the schema.
