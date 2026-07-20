# pom XML

pom XML is the declarative source format and shared intermediate representation used throughout the pom kit. It describes slides as nested presentation nodes, keeps layout intent explicit, and remains editable after generation by an agent or another authoring surface.

```xml
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" alignItems="start">
    <Text fontSize="48" bold="true">Presentation Title</Text>
    <Text fontSize="24" color="666666">Subtitle</Text>
  </VStack>
</Slide>
```

Each slide is a top-level `<Slide>`. Containers such as `VStack`, `HStack`, and `Layer` define composition; leaf and diagram nodes define editable PowerPoint content. pom parses and validates the XML, computes a `PositionedNode` tree, and renders it to PPTX or preview formats.

## Where XML comes from

- Write it directly for explicit control or agent-friendly source editing.
- Convert Markdown with [pom-md](/pom-md).
- Serialize typed JSX/TSX with [pom-jsx](/pom-jsx).
- Generate and revise it from natural language with [pom-slide](/agent-skills/pom-slide).
- Edit the XML or its AST with [pom-editor](/embedding-the-editor), [pom CLI](/pom-cli), or [Playground](/playground).

All of these paths converge before layout and rendering. See [Choosing an Authoring Format](/authoring) for a comparison.

## Learn the format

- [Nodes](/nodes) — supported elements and attributes
- [Layout System](/layout-system) — Flexbox-style sizing and composition
- [Styling Guide](/styling-guide) — colors, typography, and visual effects
- [Slide Master](/master-slide) — reusable background and shared objects
- [Text Measurement](/text-measurement) — font metrics and measurement modes
- [llm.txt](/llm.txt) — compact XML reference for custom agent prompts
