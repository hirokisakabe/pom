# Embedding the Editor

`@hirokisakabe/pom-editor` provides React components for embedding pom XML/AST editing, preview, diagnostics, and host actions in an application. The controlled value is pom XML, so the editor works with the same source of truth as pom CLI, pom-vscode, Playground, and the core APIs.

Requires Node.js 22 or later and React 18 or later.

## Install

```bash
npm install @hirokisakabe/pom-editor react
```

`@hirokisakabe/pom` is installed as a regular dependency.

## Complete editor

`PomEditor` combines XML and drag-and-drop AST modes with debounced preview, diagnostics, refresh, pagination, and optional host actions:

```tsx
import { useState } from "react";
import { PomEditor } from "@hirokisakabe/pom-editor";
import type { PomEditorPreviewResult } from "@hirokisakabe/pom-editor";

function isPreviewResult(value: unknown): value is PomEditorPreviewResult {
  if (typeof value !== "object" || value === null) return false;
  return (
    ("svgs" in value && Array.isArray(value.svgs)) ||
    ("errors" in value && Array.isArray(value.errors))
  );
}

export function PresentationEditor() {
  const [xml, setXml] = useState("<Slide><Text>Hello</Text></Slide>");

  return (
    <PomEditor
      xml={xml}
      onChange={setXml}
      onPreview={async (nextXml, { signal }) => {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ xml: nextXml }),
          signal,
        });
        if (!response.ok) {
          throw new Error(`Preview request failed: ${response.status}`);
        }
        const result: unknown = await response.json();
        if (!isPreviewResult(result)) {
          throw new Error("Preview endpoint returned an invalid response");
        }
        return result;
      }}
    />
  );
}
```

The host application owns preview generation and file operations. `onDownload`, `onSave`, and `onCopyPreview` are optional. Download and Save appear in the toolbar when their callbacks are provided; Copy appears over the preview when `onCopyPreview` is provided. SVG preview results are sanitized before insertion into the document.

| Prop                                    | Purpose                                                                       |
| --------------------------------------- | ----------------------------------------------------------------------------- |
| `xml`, `onChange`                       | Controlled pom XML value and update callback                                  |
| `onPreview`                             | Host adapter that returns preview SVGs or errors and respects an abort signal |
| `onDownload`, `onSave`, `onCopyPreview` | Optional host actions                                                         |
| `toolbarStart`, `toolbarEnd`            | Host content around the standard toolbar actions                              |
| `debounceMs`                            | Preview delay; defaults to `500` ms                                           |
| `className`, `style`                    | Root element styling hooks                                                    |

## Standalone AST editor

Use `PomAstEditor` when you only need structural drag-and-drop editing:

```tsx
import { useState } from "react";
import { PomAstEditor } from "@hirokisakabe/pom-editor";

export function AstEditor() {
  const [xml, setXml] = useState(`
<Slide>
  <VStack gap="16" padding="24">
    <Text fontSize="32" bold="true">Title</Text>
    <Text>Body text</Text>
  </VStack>
</Slide>`);

  return <PomAstEditor xml={xml} onChange={setXml} />;
}
```

Rows expose separate drop targets for sibling insertion and nesting inside `VStack`, `HStack`, or `Layer`. Top-level slides can also be reordered. The component rejects drops that would create a cycle.

## Connect a preview backend

The `onPreview` callback should send the current XML to a trusted Node.js server or server-side worker that runs the pom build pipeline and converts the result to SVG. Keep rendering and filesystem access outside the browser component. The website Playground and pom CLI are examples of hosts built around this same separation.

Compare the visual editor with other [authoring formats](/authoring), or see the [`@hirokisakabe/pom` API Reference](/api-reference) for implementing build and preview adapters.
