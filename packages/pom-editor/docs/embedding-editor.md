# Embedding the Editor

`@hirokisakabe/pom-editor` provides React components for embedding pom XML / AST editing, preview, diagnostics, and host actions in an application. It edits the same pom XML model used by the other authoring surfaces; preview generation and persistence remain under host control.

## Install

Requires Node.js 22 or later and React 18 or later.

```bash
npm install @hirokisakabe/pom-editor react
```

## Embed the complete editor

```tsx
import { PomEditor } from "@hirokisakabe/pom-editor";

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
    return response.json();
  }}
  onDownload={(nextXml) => downloadPptx(nextXml)}
  onSave={(nextXml) => saveXml(nextXml)}
/>;
```

`PomEditor` is controlled through `xml` and `onChange`. It includes XML / AST modes, debounced preview, diagnostics, Refresh, and slide pagination. `onDownload` and `onSave` add toolbar actions, while `onCopyPreview` adds a Copy button to the preview; each appears only when its callback is supplied. SVG previews are sanitized before insertion.

| Prop                                    | Purpose                                                                     |
| --------------------------------------- | --------------------------------------------------------------------------- |
| `xml`, `onChange`                       | Controlled pom XML source and updates                                       |
| `onPreview`                             | Host adapter returning `{ svgs }` or `{ errors }`; receives an abort signal |
| `onDownload`, `onSave`, `onCopyPreview` | Optional host actions                                                       |
| `toolbarStart`, `toolbarEnd`            | Host content around standard toolbar actions                                |
| `debounceMs`                            | Preview delay; defaults to 500 ms                                           |
| `className`, `style`                    | Root element styling                                                        |

## Embed only the AST editor

```tsx
import { PomAstEditor } from "@hirokisakabe/pom-editor";
import { useState } from "react";

function App() {
  const [xml, setXml] = useState(`<Slide><Text>Hello</Text></Slide>`);
  return <PomAstEditor xml={xml} onChange={setXml} />;
}
```

`PomAstEditor` shows the parsed tree and supports drag-and-drop reordering and nesting for `VStack`, `HStack`, and `Layer`. It returns serialized pom XML after every accepted move.

For server-side preview generation, pass the XML to [`buildPptx()`](/pom-library) and convert the result to SVG, or expose an application-specific endpoint like the example above. See [pom XML](/pom-xml) for the shared model.
