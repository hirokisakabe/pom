<h1 align="center">pom-md</h1>
<p align="center">
  Markdown wrapper for <a href="https://www.npmjs.com/package/@hirokisakabe/pom">pom</a> — write slides in Markdown with <code>pomxml</code> code fences.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@hirokisakabe/pom-md"><img src="https://img.shields.io/npm/v/@hirokisakabe/pom-md.svg" alt="npm version"></a>
  <a href="https://github.com/hirokisakabe/pom/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@hirokisakabe/pom-md.svg" alt="License"></a>
</p>

---

## Features

- **Markdown-First Authoring** — Write slide content as standard Markdown (headings, lists, paragraphs, tables, images). `parseMd()` converts it to pom XML.
- **`pomxml` Code Fences** — Drop into raw pom XML inside a code fence to embed charts, flows, timelines, and any other pom node Markdown cannot express.
- **Slide Separators** — `---` (horizontal rule) splits the document into successive slides, Marp-style.
- **Frontmatter Configuration** — Set slide size (`16:9` / `4:3`), default background color, and master PPTX template path in a YAML frontmatter block.
- **Per-Slide Directives** — Override settings on a single slide with Marp-style `<!-- backgroundColor: red -->` HTML comments.
- **Composable with `buildPptx`** — `parseMd()` returns the XML string plus parsed metadata so you can hand it straight to `@hirokisakabe/pom`'s `buildPptx`.

## Installation

> Requires Node.js 18+

```bash
npm install @hirokisakabe/pom-md @hirokisakabe/pom
```

## Quick Start

Create a `.pom.md` file:

````markdown
---
size: 16:9
---

# Sales Report

- Q1 was strong
- Q2 had challenges

---

## Detailed Data

```pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
```

---

## Process

```pomxml
<Flow direction="horizontal" w="600" h="200">
  <FlowNode id="plan" shape="flowChartProcess" text="Plan" />
  <FlowNode id="develop" shape="flowChartProcess" text="Develop" />
  <FlowNode id="release" shape="flowChartTerminator" text="Release" />
  <FlowConnection from="plan" to="develop" />
  <FlowConnection from="develop" to="release" />
</Flow>
```
````

Then convert it to PPTX:

```ts
import { readFileSync } from "node:fs";
import { parseMd } from "@hirokisakabe/pom-md";
import { buildPptx } from "@hirokisakabe/pom";

const markdown = readFileSync("slides.pom.md", "utf-8");
const { xml, meta } = parseMd(markdown);
const { pptx } = await buildPptx(xml, meta.size);
await pptx.writeFile({ fileName: "output.pptx" });
```

## Markdown Syntax

### Slide Separator

Use `---` (horizontal rule) to separate slides.

### Frontmatter

Specify global settings in the frontmatter block:

```markdown
---
size: 16:9
backgroundColor: "#f0f0f0"
masterPptx: ./template.pptx
---
```

| Key               | Description                                                       |
| ----------------- | ----------------------------------------------------------------- |
| `size`            | Slide size preset: `16:9` (1280×720, default) or `4:3` (1024×768) |
| `backgroundColor` | Default background color for all slides (applied to VStack)       |
| `masterPptx`      | Path to an existing PPTX file to use as master template           |

### Comment Directive

Use HTML comments in Marp-style to override settings per slide:

```markdown
<!-- backgroundColor: red -->

# This slide has a red background
```

Supported directives:

| Directive         | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `backgroundColor` | Background color for this slide (overrides frontmatter default) |

### Markdown → pom XML Mapping

| Markdown           | pom Node                                          |
| ------------------ | ------------------------------------------------- |
| `# Heading`        | `<Text fontSize="28" bold="true">`                |
| `## Heading`       | `<Text fontSize="24" bold="true">`                |
| `### Heading`      | `<Text fontSize="20" bold="true">`                |
| Paragraph text     | `<Text>`                                          |
| `- List item`      | `<Ul><Li>`                                        |
| `1. Numbered item` | `<Ol><Li>`                                        |
| `**bold**`         | `<B>bold</B>` (inside Text/Li/Td)                 |
| `*italic*`         | `<I>italic</I>` (inside Text/Li/Td)               |
| `![](img.png)`     | `<Image src="img.png">`                           |
| Table syntax       | `<Table>` (header: bold + background, cellBorder) |
| ` ```pomxml `      | XML passthrough                                   |

### `pomxml` Code Fence

For complex diagrams that Markdown cannot express, embed pom XML directly:

````markdown
```pomxml
<Chart chartType="bar" w="600" h="300">
  <ChartSeries name="Revenue">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="80" />
    <ChartDataPoint label="Q3" value="120" />
    <ChartDataPoint label="Q4" value="150" />
  </ChartSeries>
</Chart>
```
````

The content inside `pomxml` fences is passed through to the output as-is.

## API

### `parseMd(markdown: string): ParseMdResult`

Converts a Markdown string into a pom XML string and metadata.

```ts
interface ParseMdResult {
  xml: string;
  meta: ParseMdMeta;
}

interface ParseMdMeta {
  size: { w: number; h: number };
  masterPptx?: string;
}
```

The returned `xml` can be passed directly to `buildPptx()` from `@hirokisakabe/pom`. The `meta` contains parsed frontmatter settings such as slide size and master PPTX path.

## License

MIT
