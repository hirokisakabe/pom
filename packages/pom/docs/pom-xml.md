# pom XML

pom XML is the shared source of truth and intermediate representation (IR) for the pom kit. Agent skills can generate it, `pom-md` and `pom-jsx` compile to it, `pom-editor` edits it, and the core library parses it before layout and rendering.

```text
pom-slide   pom-md   pom-jsx   direct authoring
     \        |        |          /
                pom XML
                   |
            parse + layout
                   |
            PositionedNode
                   |
              PPTX / SVG / PNG
```

## Basic document

Each slide is a top-level `<Slide>`. Multiple slides are listed one after another.

```xml
<Theme text="172033" background="F7F9FC" primary="5965E0" />

<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" alignItems="start">
    <Text fontSize="48" bold="true" color="$text">Quarterly report</Text>
    <Text fontSize="24" color="$primary">Revenue and outlook</Text>
  </VStack>
</Slide>
```

The optional top-level `<Theme>` declares color tokens. References such as `$primary` are resolved while parsing.

## Where to go next

- Browse every available element in [Nodes](/nodes).
- Learn Flexbox-style sizing and placement in [Layout System](/layout-system).
- Apply colors, typography, and effects with the [Styling Guide](/styling-guide).
- Try XML immediately in the [Playground](/playground).
- Preview and build a `.pom.xml` file with [pom CLI](/pom-cli).
