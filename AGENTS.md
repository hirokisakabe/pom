# CLAUDE.md

pom (PowerPoint Object Model) — TypeScript library for declaratively describing PowerPoint presentations. Calculates Flexbox-style layouts with yoga-layout and generates PPTX files with pptxgenjs.

## Tech Stack

TypeScript 5.x, yoga-layout 3.2.1, pptxgenjs 4.0.1, opentype.js 1.3.x, fast-xml-parser 5.x, zod 4.x, Vitest, ESLint, Prettier, pnpm workspace

## Behavioral Principles

- Read existing code before making changes — especially check the 3-stage pipeline impact scope
- When adding features, follow the Feature Addition Checklist (injected via `.claude/rules/` when editing `packages/pom/src/`)
- VRT baseline updates must use Docker environment (`pnpm run vrt:docker:update`)
- When changes span multiple packages, explicitly state the impact scope

## Commands (from `packages/pom/`)

```bash
pnpm run build           # TypeScript compilation
pnpm run lint            # ESLint
pnpm run fmt             # Prettier formatting
pnpm run typecheck       # Type checking
pnpm run knip            # Detect unused code
pnpm run test:run        # Run tests
pnpm run vrt:docker:update  # Update VRT baseline (Docker)
```

Root: `pnpm --filter @hirokisakabe/pom run <script>`

## Directory Structure

```
packages/
├── pom/              # Core library — src/ (parseXml/ → calcYogaLayout/ → toPositioned/ → renderPptx/), vrt/, preview/, docs/, main.ts
├── pom-cli/          # CLI tool — preview and build presentations
├── pom-jsx/          # JSX/TSX authoring package
├── pom-md/           # Markdown → pom XML converter
├── pom-vscode/       # VS Code extension for live preview
apps/
└── website/          # Documentation website (Next.js), content → pom/docs symlink
```

## Architecture

PPTX generation pipeline: **calcYogaLayout** → **toPositioned** → **renderPptx**. Additionally, **autoFit** adjusts slides when content overflows.

### Public API

- `buildPptx(xml, slideSize, options?)` — XML string → PPTX
- `BuildPptxResult`, `ParseXmlError`, `DiagnosticsError`, `Diagnostic`, `DiagnosticCode`
- `TextMeasurementMode` (`"opentype"` | `"fallback"` | `"auto"`), `SlideMasterOptions`

### Key Internal Types

- `POMNode` — Input node (Text, Ul, Ol, Image, Table, Shape, Chart, Timeline, Matrix, Tree, Flow, ProcessArrow, Pyramid, Line, Arrow, Layer, VStack, HStack, Icon, Svg)
- `PositionedNode` — Node with absolute position (x, y, w, h)
- `parseXml` — XML strings → POMNode arrays (PascalCase tags, Zod-validated attributes)

## Packages

Managed as a pnpm workspace. Sub-package details are injected via `.claude/rules/` when editing the respective directory.
