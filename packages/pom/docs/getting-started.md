# Getting Started

pom supports two primary starting points. The recommended workflow pairs an AI coding agent with pom CLI, while application developers can call the TypeScript library directly. Both paths use pom XML as the editable source of truth and the same layout and rendering pipeline.

Requires Node.js 22 or later.

## AI agent + pom CLI

Choose this path when you want to describe a deck in natural language, inspect the result as the agent edits it, and keep the generated source under version control.

### 1. Install the skills and CLI

```bash
npx skills add hirokisakabe/pom --all
npm install -g @hirokisakabe/pom-cli
```

This installs [pom-slide](/agent-skills/pom-slide) for slide generation and [pom-theme](/agent-skills/pom-theme) for brand onboarding, plus the [`pom` command](/pom-cli) for preview and output.

### 2. Ask your agent for a presentation

For example:

```text
Create a three-slide quarterly sales report with a title, chart, and summary.
```

An agent can select `pom-slide` automatically when the request matches the installed skill. It writes an editable `slides.pom.xml` file, validates the complete deck, renders it for self-review, and starts or reuses a live preview when pom CLI is available.

### 3. Preview while you refine

```bash
pom preview slides.pom.xml
```

Keep the preview open while asking the agent for changes. File edits refresh the browser, so the agent can work in pom XML while you verify composition and content. The preview also provides XML and AST editing for `.pom.xml` files. See [AI-assisted live preview](/pom-cli#ai-assisted-live-preview) for conflict-safe save behavior.

### 4. Build the editable PowerPoint

```bash
pom build slides.pom.xml -o slides.pptx
```

The XML and generated PPTX can both be kept as project artifacts. Use `pom render` when you also need PNG or SVG images.

If you have an existing PowerPoint theme or brand colors, start with [pom-theme](/agent-skills/pom-theme), then ask the agent to create the deck in the same directory. `pom-slide` automatically reads `pom-theme.json`.

## TypeScript library

Choose this path when presentation generation is part of an application, service, build script, or custom pipeline.

### 1. Install the core library

```bash
npm install @hirokisakabe/pom
```

### 2. Build a PPTX from pom XML

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

Each slide must be wrapped in a `<Slide>` element. List multiple `<Slide>` elements at the top level to create a multi-slide deck.

Continue with [Nodes](/nodes), [Layout System](/layout-system), [Styling Guide](/styling-guide), and the [API Reference](/api-reference).

## Which workflow should I use?

| Need                                                     | Recommended path                              |
| -------------------------------------------------------- | --------------------------------------------- |
| Prompt-to-PowerPoint with a human review loop            | AI agent + pom CLI                            |
| Repeatable or data-driven generation in application code | TypeScript library                            |
| Prose-first deck with diagrams written as pom XML        | [pom-md](/pom-md)                             |
| Typed, reusable slide components                         | [pom-jsx](/pom-jsx)                           |
| XML/AST editing inside your own React application        | [Embedding the Editor](/embedding-the-editor) |
| Quick experimentation in a browser                       | [Playground](/playground)                     |

All of these workflows converge on the same pom XML model, so you can combine them rather than making an irreversible choice.
