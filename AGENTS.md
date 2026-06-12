# AGENTS.md

pom (PowerPoint Object Model) — TypeScript library for declaratively describing PowerPoint presentations. Calculates Flexbox-style layouts with yoga-layout and generates PPTX files with pptxgenjs.

## Agent Instructions の配置方針

- AI agent 向け作業ルールの**正本は各階層の `AGENTS.md`**（このファイルおよび `packages/*/AGENTS.md`）。Codex など `AGENTS.md` を読む agent はこれを直接参照する。
- Claude Code 向けには各 `AGENTS.md` と同階層に `CLAUDE.md`（実ファイル）を置き、内容は原則 `@AGENTS.md` import のみとする。symlink は Windows 互換性と GitHub 上での可読性のため使わない。
- Claude 固有のルールが将来必要になった場合のみ、`CLAUDE.md` の `@AGENTS.md` の下に Claude 専用セクションを追加する。
- 配置一覧:
  - ルート `AGENTS.md` — リポジトリ全体の共通ルールとリリースフロー（このファイル）
  - `packages/pom/AGENTS.md` — コアライブラリのルール（Feature Addition Checklist / Preview Workflow / Text Measurement）
  - `packages/pom-cli/AGENTS.md` / `packages/pom-editor/AGENTS.md` / `packages/pom-jsx/AGENTS.md` / `packages/pom-md/AGENTS.md` / `packages/pom-vscode/AGENTS.md` — 各パッケージ別ルール

## Tech Stack

TypeScript 5.x, yoga-layout 3.2.1, pptxgenjs 4.0.1, opentype.js 1.3.x, fast-xml-parser 5.x, zod 4.x, Vitest, ESLint, Prettier, pnpm workspace

## Behavioral Principles

- Read existing code before making changes — especially check the 3-stage pipeline impact scope
- When adding features, follow the Feature Addition Checklist in `packages/pom/AGENTS.md`
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

Managed as a pnpm workspace. Sub-package rules live in each package's `AGENTS.md` (see 「Agent Instructions の配置方針」).

## Release Flow (Changesets) — npm packages + pom-vscode

適用条件: `.changeset/**` または各パッケージのリリースに関わる変更をする場合。

All npm packages (`@hirokisakabe/pom`, `@hirokisakabe/pom-md`, `@hirokisakabe/pom-cli`, `@hirokisakabe/pom-jsx`, `@hirokisakabe/pom-editor`) and `pom-vscode` use [Changesets](https://github.com/changesets/changesets) for versioning. The unified workflow (`release.yml`) handles all packages.

1. Add a changeset: `pnpm exec changeset add`
2. Push to main → GitHub Actions creates a Release PR (version bump + CHANGELOG)
3. Merge the Release PR → `changeset publish` publishes all npm packages, then detects pom-vscode version change → `vsce publish` to VS Code Marketplace + Git tag + GitHub Release

## Distribution (skills/)

適用条件: `skills/**` を変更する場合。

Skills (`pom-slide`, `pom-theme`) have **no release workflow**. They are distributed via `npx skills add hirokisakabe/pom --all` (vercel-labs/skills CLI), which fetches `skills/*/SKILL.md` directly from main HEAD — merging to main is the release (#791).

- **No git tags / GitHub Releases** for skills. The former `release-skill.yml` (`gh skill publish` with per-skill tags) was removed.
- **Validation**: `ci-skills.yml` runs `gh skill publish --dry-run` as an agentskills.io spec-compliance check on PRs touching `skills/**`.
- `metadata.version` in SKILL.md frontmatter is informational only; bumping it triggers nothing.
