# Choosing an Authoring Format

Every pom authoring surface produces or edits the same **pom XML** model. Choose based on who writes the source and how much composition or visual interaction the workflow needs; the downstream layout, preview, validation, and rendering pipeline remains shared.

| Authoring surface                | Best for                                                                       | Trade-offs                                                    | Next step                                           |
| -------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------- |
| **pom XML**                      | Agents, precise declarative control, portable source files                     | Most explicit syntax; you manage repeated structures yourself | [Nodes](/nodes) and [Layout System](/layout-system) |
| **Markdown (`pom-md`)**          | Prose-heavy decks and familiar Markdown authoring                              | Complex layouts still use `pomxml` code fences                | [pom-md](/pom-md)                                   |
| **JSX/TSX (`pom-jsx`)**          | Typed composition, loops, data mapping, reusable components                    | Requires a TypeScript JSX toolchain                           | [pom-jsx](/pom-jsx)                                 |
| **Visual editor (`pom-editor`)** | Embedding XML/AST editing, drag-and-drop structure, and preview in a React app | The host supplies preview and file operations                 | [Embedding the Editor](/embedding-the-editor)       |

## pom XML as the source of truth

pom XML is both a human-editable source format and the intermediate representation shared across the kit:

```text
Markdown ──pom-md──┐
JSX/TSX ──pom-jsx──├──▶ pom XML ──▶ PositionedNode ──▶ PPTX / SVG / PNG
AI prompt ─pom-slide─┘         ▲
Visual editor ──────────────┘
```

This lets a deck move between workflows. An agent can generate XML, a person can adjust its AST in the editor, pom-vscode or pom CLI can preview it, and the core library can render it without translating to a different presentation model.

## Tools use the same model

- [pom CLI](/pom-cli) previews, builds, and renders `.pom.xml` or `.pom.md`; Markdown is converted to pom XML first.
- [pom-vscode](/pom-vscode) previews and exports `.pom.xml` and `.pom.md` through the same core build pipeline.
- [Playground](/playground) lets you edit pom XML and inspect its output in the browser.

The tools differ in interface and output workflow, not in their underlying presentation data model.
