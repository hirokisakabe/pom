# @hirokisakabe/pom-md

Markdown wrapper for [pom](https://github.com/hirokisakabe/pom) — write slides in Markdown with `pomxml` code fences.

## Install

```bash
npm install @hirokisakabe/pom-md @hirokisakabe/pom
```

## Usage

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
<Chart type="bar" labels="Q1,Q2,Q3,Q4" values="100,80,120,150" />
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
