# pom-slide

`pom-slide` generates or incrementally edits pom presentations from natural language. It applies presentation design principles, honors a local `pom-theme.json`, validates the complete deck, renders slides for self-review, and reuses or launches a pom CLI preview.

## Install

```bash
npx skills add hirokisakabe/pom --all
npm install -g @hirokisakabe/pom-cli
```

## Basic flow

1. Ask your coding agent for a deck, for example: `Create a five-slide product launch proposal.`
2. The skill writes `slides.pom.xml` by default (or the filename you request).
3. It runs strict validation and reviews rendered slide images, correcting problems it introduced.
4. It starts or reuses `pom preview`, letting you inspect the deck while asking for revisions.
5. Build the accepted source with `pom build slides.pom.xml -o slides.pptx`.

The skill can also update only a specified slide, replace the full deck, or insert a new slide while preserving the rest of the XML and its top-level `<Theme>`.

## Use a brand theme

When `pom-theme.json` exists in the working directory, `pom-slide` automatically applies its tone, colors, fonts, and background. Create that file first with [pom-theme](/agent-skills/pom-theme), then request the deck from the same directory.

## Output and handoff

The main output is pom XML, not an opaque generated presentation. You can continue editing it with an agent, [pom CLI](/pom-cli), [pom-vscode](/pom-vscode), the [Playground](/playground), or an embedded visual editor before producing the final PPTX.
