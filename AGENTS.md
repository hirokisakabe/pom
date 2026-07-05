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

Existing PPTX reading and structural round-trip work should treat `@pptx-glimpse/document` as the first candidate dependency (#895 option 2: pom → `@pptx-glimpse/document` one-way dependency). If typed model coverage is insufficient, prefer its `packageGraph.rawParts` OOXML escape hatch before adding new ZIP/XML handling in pom.

### Public API (`@hirokisakabe/pom`)

- `buildPptx(xml, slideSize, options?)` — XML string → PPTX
- `BuildPptxResult`, `ParseXmlError`, `DiagnosticsError`, `Diagnostic`, `DiagnosticCode`
- `TextMeasurementMode` (`"opentype"` | `"fallback"` | `"auto"`), `SlideMasterOptions`
- `extractThemeTokensFromPptx(buffer)` — PPTX bytes → `ThemeTokens[]` (`slideMaster` 配下の表示 layout 順に、text / background / primary / secondary / accent3..6 を 6 桁大文字 hex で返す)
- `ThemeTokens`, `FALLBACK_THEME_TOKENS`
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

## Skill 開発時の動作確認 (`skills/**`)

適用条件: `skills/pom-slide/SKILL.md` または `skills/pom-theme/SKILL.md` を編集する場合。

開発中に Claude Code / Codex CLI **両方** で

1. skill として triggered されるか
2. 想定通りに動作するか（pom XML 生成・テーマ適用・`pom preview` 起動まで）

を確認するための手順。Windows は symlink 制約のため対象外。

### 1. symlink 配置

repo ルートで以下を実行する。`skills/<name>/` を Claude Code (`.claude/skills/`) と Codex CLI (`.agents/skills/`) 双方の探索パスに symlink で繋ぎ直す。

```bash
pnpm run dev:link-skills
```

- 既存の通常ファイル / ディレクトリ / 古い symlink があっても安全に上書きする（冪等）。
- `.claude/*` と `.agents/` は `.gitignore` 除外なのでチーム影響なし。

### 2. Claude Code / Codex CLI を再起動

**Claude Code は session 開始時にしか skill を読まない**（hot-reload なし）。SKILL.md を編集した直後は必ず agent を再起動する。Codex CLI も同様にセッション再起動が安全。

Codex CLI は `.agents/skills/` を **cwd から root に向かって上向きに探索** し、symlink も追従する（[Codex Agent Skills 公式](https://developers.openai.com/codex/skills)）。ユーザースコープは `~/.agents/skills/`。

### 3. 動作確認用 fixture を走らせる

`skills/pom-slide/dev-fixtures/` 配下の Markdown プロンプト集に従い、両 agent で fixture を 1 件ずつ確認する。

- 各 fixture に「入力プロンプト」と「期待される挙動チェックリスト」が含まれる
- プロンプト本体は agent 非依存。agent 固有の差分は fixture 内の「両 agent で確認するメモ」に併記
- カバーシナリオ: pom-slide テーマなし / pom-theme.json 有り / pom-cli preview / pom-theme triggered

詳細は [`skills/pom-slide/dev-fixtures/README.md`](skills/pom-slide/dev-fixtures/README.md) を参照。

### スコープ外

- 動作確認の **自動テスト化**（CI 上で triggered 判定を再現する仕組み）は重実装のため別 issue 化対象。
- Cursor / OpenCode 等の他 agent は配布側（`npx skills add`）では対応済みだが、開発時 fixture は当面 Claude Code / Codex CLI に絞る。
- Windows は symlink 制約により非対応。
