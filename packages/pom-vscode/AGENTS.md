# AGENTS.md — packages/pom-vscode

VS Code extension for live preview of `.pom.md` / `.pom.xml` files. Converts content to SVG via pptx-glimpse and displays in a webview panel. リポジトリ共通ルールはルート `AGENTS.md` を参照。

```bash
pnpm --filter pom-vscode run build       # esbuild bundle
pnpm --filter pom-vscode run watch       # esbuild watch mode
pnpm --filter pom-vscode run lint        # ESLint
pnpm --filter pom-vscode run fmt         # Prettier formatting
pnpm --filter pom-vscode run fmt:check   # Format check
pnpm --filter pom-vscode run typecheck   # Type checking
pnpm --filter pom-vscode run knip        # Detect unused code
```

Pipeline:

- `.pom.md → parseMd() → buildPptx() → pptx-glimpse (convertPptxToSvg) → Webview`
- `.pom.xml → buildPptx() → pptx-glimpse (convertPptxToSvg) → Webview`

To test locally: open `packages/pom-vscode` in VS Code and press F5 to launch Extension Development Host.

## Documentation Symlinks

`packages/pom-vscode/docs/` 配下にドキュメントファイルを追加・リネーム・削除した場合、`apps/website/content/pom-vscode/` 側にもファイル単位の symlink を追加・更新する。Next 16 / Turbopack はディレクトリ symlink を辿れないため、ファイルごとに symlink を張る方針を採用している。

```bash
# 新規ファイルを追加した場合の例
cd apps/website/content/pom-vscode
ln -s ../../../../packages/pom-vscode/docs/<new-file>.md <new-file>.md
```

## Release Flow

pom-vscode uses Changesets for versioning (`privatePackages` config). The release is handled by the unified `release.yml` workflow.

1. Add a changeset including pom-vscode: `pnpm exec changeset add`
2. Release PR merges → `changeset version` bumps pom-vscode's `package.json` version
3. `release.yml` detects pom-vscode version change → builds, tests, and publishes to VS Code Marketplace + creates Git tag (`pom-vscode-v{version}`) + GitHub Release

Each publish/tag/release step is idempotent: if the workflow fails midway, re-running will skip already-completed steps and resume from the point of failure.

## PR 作成前チェック

- [ ] changeset を追加する: `pnpm exec changeset add`
