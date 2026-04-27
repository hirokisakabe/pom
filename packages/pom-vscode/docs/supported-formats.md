# Supported Formats

pom-vscode supports two file formats for defining presentations.

## `.pom.md` — Markdown

Write slides in Markdown with optional `pomxml` code fences for complex diagrams. This format uses [pom-md](/pom-md) to convert Markdown into pom XML before rendering.

**Pipeline:** `.pom.md → parseMd() → buildPptx() → pptx-glimpse → SVG → Webview`

```markdown
---
size: 16:9
---

# Hello World

- First point
- Second point
```

See the [pom-md documentation](/pom-md) for the full Markdown syntax reference.

## `.pom.xml` — pom XML

Write slides directly in pom XML for full control over layout and styling.

**Pipeline:** `.pom.xml → buildPptx() → pptx-glimpse → SVG → Webview`

```xml
<VStack w="100%" h="max" padding="48" gap="24" alignItems="start">
  <Text fontSize="28" bold="true">Hello World</Text>
  <Ul>
    <Li>First point</Li>
    <Li>Second point</Li>
  </Ul>
</VStack>
```

See the [Nodes](/nodes) reference for the full list of available XML nodes and their attributes.
