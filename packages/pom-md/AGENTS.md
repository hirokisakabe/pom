# AGENTS.md — packages/pom-md

Markdown → pom XML converter. Converts Markdown with `pomxml` code fences into pom XML strings. リポジトリ共通ルールはルート `AGENTS.md` を参照。

```bash
pnpm --filter @hirokisakabe/pom-md run build       # TypeScript compilation
pnpm --filter @hirokisakabe/pom-md run lint         # ESLint
pnpm --filter @hirokisakabe/pom-md run fmt          # Prettier formatting
pnpm --filter @hirokisakabe/pom-md run fmt:check    # Format check
pnpm --filter @hirokisakabe/pom-md run typecheck    # Type checking
pnpm --filter @hirokisakabe/pom-md run knip         # Detect unused code
pnpm --filter @hirokisakabe/pom-md run test:run     # Run tests
```

Pipeline: `Markdown → parseMd() → pom XML string → buildPptx() (core)`

## Documentation Symlinks

`packages/pom-md/docs/` 配下にドキュメントファイルを追加・リネーム・削除した場合、`apps/website/content/pom-md/` 側にもファイル単位の symlink を追加・更新する。Next 16 / Turbopack はディレクトリ symlink を辿れないため、ファイルごとに symlink を張る方針を採用している。

```bash
# 新規ファイルを追加した場合の例
cd apps/website/content/pom-md
ln -s ../../../../packages/pom-md/docs/<new-file>.md <new-file>.md
```

## PR 作成前チェック

- [ ] changeset を追加する: `pnpm exec changeset add`
