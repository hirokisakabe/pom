# Getting Started

Choose the workflow that matches how you want to create presentations. Both paths produce the same pom XML model and can use the same preview and rendering tools.

## AI agent + pom CLI (recommended)

Use this path when you want to describe a deck in natural language and review the generated presentation while your coding agent edits it.

### 1. Install the agent skills and CLI

Requires Node.js 22 or later.

```bash
npx skills add hirokisakabe/pom --all
npm install -g @hirokisakabe/pom-cli
```

### 2. Ask your agent for a deck

If the running agent does not discover the newly installed skills, restart its session first.

For example:

```text
Create a three-slide quarterly sales report with a title, chart, and summary.
```

The agent selects `pom-slide`, creates `slides.pom.xml`, validates it, renders it for review, and starts or reuses a live preview. You can keep asking for targeted changes while the XML remains editable and version-control friendly.

### 3. Preview and build

```bash
pom preview slides.pom.xml
pom build slides.pom.xml -o slides.pptx
```

Keep preview open while the agent edits the file: saves are reflected in the browser, so the agent handles source changes while you judge layout and content. See [Agent Skills](/agent-skills) and the [pom CLI guide](/pom-cli) for the complete workflow.

## TypeScript library

Use the core package directly when pom is part of an application, service, or custom build pipeline.

```bash
npm install @hirokisakabe/pom
```

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const xml = `
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" alignItems="start">
    <Text fontSize="48" bold="true">Presentation Title</Text>
    <Text fontSize="24" color="666666">Subtitle</Text>
  </VStack>
</Slide>
`;

const { pptx } = await buildPptx(xml, { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });
```

Continue with the [`@hirokisakabe/pom` library guide](/pom-library) and [API Reference](/api-reference).

## Choose an authoring surface

Every surface ultimately produces or edits pom XML; choose based on who authors the deck and how much abstraction you need.

| Surface                      | Best for                                           | Trade-off                                     | Next step                                 |
| ---------------------------- | -------------------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| pom XML                      | Precise control, AI editing, portable source files | Most explicit syntax                          | [pom XML](/pom-xml)                       |
| Markdown (`pom-md`)          | Prose-first decks and quick outlines               | Advanced layouts use embedded `pomxml` fences | [pom-md](/pom-md)                         |
| JSX/TSX (`pom-jsx`)          | Typed composition and reusable components          | Requires a TypeScript JSX toolchain           | [pom-jsx](/pom-jsx)                       |
| Visual editor (`pom-editor`) | Embedding XML / AST editing in a React product     | The host supplies preview and file actions    | [Embedding the Editor](/embedding-editor) |

You can mix workflows. For example, an agent can edit XML while `pom-cli` previews it, or a React application can generate XML with `pom-jsx` and expose it through `pom-editor`.
