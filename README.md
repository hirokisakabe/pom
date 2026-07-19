<h1 align="center">pom</h1>
<p align="center">
  Prompt-to-PowerPoint with agent skills, an XML source, and a live-preview CLI.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom.svg" alt="License"></a>
</p>

<p align="center">
  <b>pom kit</b> turns a prompt into editable PowerPoint files while keeping pom XML as the source of truth.
</p>

<p align="center">
  <a href="https://pom.pptx.app/playground"><b>Try it online — Playground</b></a>
</p>

<p align="center">
  <a href="https://pom.pptx.app/playground">
    <img src="./packages/pom/docs/images/playground.png" alt="Playground" width="800">
  </a>
</p>

---

## Quick Start — pom kit

> Requires Node.js 22+

```bash
npx skills add hirokisakabe/pom --all   # install pom-slide and pom-theme
npm install -g @hirokisakabe/pom-cli    # install preview / build CLI
```

Then ask your coding agent to create a deck:

```text
/pom-slide Create a three-slide quarterly sales report
```

The skill writes `slides.pom.xml`, reviews the rendered slides, and starts live preview when `pom-cli` is available. Build the final deck with:

```bash
pom build slides.pom.xml -o slides.pptx
```

## Packages

This repository is a pnpm monorepo containing the following packages:

| Package                                       | Role                                                                        | Distribution                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [packages/pom-cli](./packages/pom-cli/)       | Primary CLI — preview, build, and render pom XML                            | [`@hirokisakabe/pom-cli`](https://www.npmjs.com/package/@hirokisakabe/pom-cli)             |
| [packages/pom](./packages/pom/)               | Core library — parse, layout, and render pom XML to PPTX                    | [`@hirokisakabe/pom`](https://www.npmjs.com/package/@hirokisakabe/pom)                     |
| [packages/pom-md](./packages/pom-md/)         | Markdown authoring surface that converts to pom XML                         | [`@hirokisakabe/pom-md`](https://www.npmjs.com/package/@hirokisakabe/pom-md)               |
| [packages/pom-jsx](./packages/pom-jsx/)       | Typed JSX/TSX authoring surface that serializes to pom XML                  | [`@hirokisakabe/pom-jsx`](https://www.npmjs.com/package/@hirokisakabe/pom-jsx)             |
| [packages/pom-editor](./packages/pom-editor/) | Visual AST editor component with pom XML input and output                   | [`@hirokisakabe/pom-editor`](https://www.npmjs.com/package/@hirokisakabe/pom-editor)       |
| [packages/pom-vscode](./packages/pom-vscode/) | VS Code extension for pom XML / Markdown live preview                       | [Marketplace](https://marketplace.visualstudio.com/items?itemName=hirokisakabe.pom-vscode) |
| [apps/website](./apps/website/)               | Documentation website and playground ([pom.pptx.app](https://pom.pptx.app)) | —                                                                                          |

## How the authoring surfaces fit together

**pom XML is the canonical, editable source passed to the layout and rendering pipeline.** Choose the authoring surface that fits your workflow:

- **Agent skills (recommended)** — `pom-slide` generates and revises pom XML from prompts; `pom-theme` supplies reusable brand tokens and master settings. The generated XML, not the prompt, is the deck source of truth.
- **XML** — Author the canonical format directly for maximum control, then preview or build it with `pom-cli`.
- **Markdown** — `pom-md` converts approachable `.pom.md` content (plus optional `pomxml` fences) into pom XML before rendering.
- **JSX/TSX** — `pom-jsx` serializes typed components and reusable layouts into pom XML before rendering.
- **Visual editor** — `pom-editor` reads pom XML and emits updated pom XML after drag-and-drop structure edits.
- **Library API** — `@hirokisakabe/pom` accepts pom XML via `buildPptx()` for advanced or programmatic integrations.

Markdown, JSX, and the visual editor are alternative authoring surfaces, not deprecated paths or separate rendering models. They all converge on the same pom XML representation.

## pom kit workflow

The **pom kit** bundles two agent skills (`pom-theme`, `pom-slide`) and the `pom-cli` preview server. Installed into a coding agent such as [Claude Code](https://claude.ai/code), it gives you a prompt-to-PPTX workflow: onboard your brand, generate slides from natural language, and iterate in a live preview.

**Install (2 commands):**

```bash
npx skills add hirokisakabe/pom --all   # install all skills (pom-slide, pom-theme)
npm install -g @hirokisakabe/pom-cli    # live preview / build CLI
```

[`skills`](https://github.com/vercel-labs/skills) auto-detects your installed agents (Claude Code, Codex, Cursor, and more) and places the skills for each. Note that `--all` installs every skill for every detected agent, scoped to the current project; pass `-g` for a user-level (global) install, or `--agent` / `--skill` to narrow the targets. To update the skills later, run `npx skills update`.

**Usage — theme → design → preview:**

1. **Theme** (optional): onboard your brand assets with `/pom-theme`:

   ```
   /pom-theme ブランドカラーは #0052CC。コーポレート向けのライトテーマで
   ```

   This saves a `pom-theme.json` (color palette + typography + SlideMaster settings) in the current directory. Subsequent `/pom-slide` runs automatically apply its colors, fonts, and background. The SlideMaster settings can also be passed directly to `buildPptx()` as the `master` option.

2. **Design**: generate slides with `/pom-slide`:

   ```
   /pom-slide 四半期の売上レポート。3 枚構成で、タイトル・グラフ・まとめを含む
   ```

   The agent generates a `slides.pom.xml` file in the current directory, applying the theme if present, and self-reviews the rendered result.

3. **Preview**: if `pom-cli` is installed, a live preview server starts automatically at `http://localhost:3000`. Edit the XML (yourself or via follow-up prompts) and the preview updates live. When you're happy, export the deck with `pom build slides.pom.xml -o slides.pptx`.

## Programmatic library use

Install the core library when you want to integrate pom into a TypeScript pipeline:

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

## Features

- **AI Friendly** — Simple XML structure designed for LLM code generation.
- **Declarative** — Describe slides as XML. No imperative API calls needed.
- **Flexible Layout** — Flexbox-style layout with VStack / HStack, powered by yoga-layout.
- **Rich Nodes** — 20 built-in node types: charts, flowcharts, tables, timelines, org trees, and more.
- **Schema-validated** — XML input is validated with Zod schemas at runtime with clear error messages.
- **PowerPoint Native** — Full access to native PowerPoint shape features (roundRect, ellipse, arrows, etc.).

## Documentation

| Document                                                    | Description                           |
| ----------------------------------------------------------- | ------------------------------------- |
| [API Reference](./packages/pom/docs/api-reference.md)       | `buildPptx()` function and options    |
| [Nodes](./packages/pom/docs/nodes.md)                       | Complete reference for all node types |
| [Master Slide](./packages/pom/docs/master-slide.md)         | Headers, footers, and page numbers    |
| [Text Measurement](./packages/pom/docs/text-measurement.md) | Text measurement options and settings |
| [llm.txt](https://pom.pptx.app/llm.txt)                     | Compact XML reference for LLM prompts |
| [Playground](https://pom.pptx.app/playground)               | Try pom XML in the browser            |

## License

MIT
