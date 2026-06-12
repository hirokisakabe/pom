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
pnpm run lint:deps       # Dependency layer boundary check (dependency-cruiser)
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
├── pom-editor/       # React component for visual DnD AST editing — PomAstEditor
├── pom-jsx/          # JSX/TSX authoring package
├── pom-md/           # Markdown → pom XML converter
├── pom-vscode/       # VS Code extension for live preview
apps/
└── website/          # Documentation website (Next.js), content → pom/docs symlink
```

## Architecture

PPTX generation pipeline: **calcYogaLayout** → **toPositioned** → **renderPptx**. Additionally, **autoFit** adjusts slides when content overflows.

### Public API (`@hirokisakabe/pom`)

- `buildPptx(xml, slideSize, options?)` — XML string → PPTX
- `BuildPptxResult`, `ParseXmlError`, `DiagnosticsError`, `Diagnostic`, `DiagnosticCode`
- `TextMeasurementMode` (`"opentype"` | `"fallback"` | `"auto"`), `SlideMasterOptions`
- `parseXml(xml)` — XML string → `POMNode[]` (PascalCase tags, Zod-validated attributes). トップレベル `<Theme>` でデザイントークン（配色）を宣言でき、色属性の `$name` 参照は parse 時に解決される（`<Theme>` 自体はノードにならない）
- `serializeXml(nodes)` — `POMNode[]` → XML string (inverse of parseXml; 解決済みの `<Theme>` は保持されない)
- `POMNode` — Input node union type (Text, Ul, Ol, Image, Table, Shape, Chart, Timeline, Matrix, Tree, Flow, ProcessArrow, Pyramid, Line, Arrow, Layer, VStack, HStack, Icon, Svg)

`@hirokisakabe/pom/clientApi` — `parseXml` / `serializeXml` / `POMNode` のみを再エクスポートするクライアント安全なサブパス。`fs` / WASM を含まないため client bundle に含められる。

### Public API (`@hirokisakabe/pom-editor`)

- `PomAstEditor` — React コンポーネント。`xml` と `onChange` props を受け取り、AST ツリーを表示して DnD でノードを並び替えると更新後の XML を返す。

### Key Internal Types

- `PositionedNode` — Node with absolute position (x, y, w, h)
- Leaf nodes `Text` / `Shape` / `Image` / `Icon` may include `rotate` (degrees clockwise). Rotation is applied in `renderPptx` only; yoga layout uses unrotated bounds.

## Packages

Managed as a pnpm workspace. Sub-package details are injected via `.claude/rules/` when editing the respective directory.
