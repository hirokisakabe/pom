# @hirokisakabe/pom

`@hirokisakabe/pom` is the core TypeScript library behind the pom kit. It parses and validates pom XML, computes Flexbox-style layout as positioned presentation nodes, and renders editable PPTX output. Agent skills and tools use this same model and pipeline rather than defining their own presentation formats.

## Install

```bash
npm install @hirokisakabe/pom
```

## Main API

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const xml = `<Slide><Text>Hello from pom</Text></Slide>`;

const { pptx, diagnostics } = await buildPptx(xml, {
  w: 1280,
  h: 720,
});

await pptx.writeFile({ fileName: "presentation.pptx" });
```

`buildPptx` accepts pom XML and a slide size, then returns a writable PPTX facade and diagnostics. The package also exposes XML parsing and serialization, theme extraction, slide-master extraction, text measurement options, and slide-master configuration.

For a runnable example, see the [TypeScript library Quick Start](/getting-started#typescript-library). For signatures and options, see the [API Reference](/api-reference).

## Client-safe XML API

`@hirokisakabe/pom/clientApi` exports `parseXml`, `serializeXml`, and `POMNode` without filesystem or WASM dependencies. Use this subpath for browser-side XML/AST editing. [pom-editor](/embedding-the-editor) builds on the client-safe model and delegates preview rendering to its host.
