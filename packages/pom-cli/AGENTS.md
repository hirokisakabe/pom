# AGENTS.md — packages/pom-cli

CLI tool for pom — preview and build presentations. Wraps `@hirokisakabe/pom` and `@hirokisakabe/pom-md` to provide `pom` binary for rendering `.pom.xml` / `.pom.md` files to PPTX or launching a live preview server. リポジトリ共通ルールはルート `AGENTS.md` を参照。

```bash
pnpm --filter @hirokisakabe/pom-cli run build       # TypeScript compilation + chmod dist/cli.js
pnpm --filter @hirokisakabe/pom-cli run lint        # ESLint
pnpm --filter @hirokisakabe/pom-cli run fmt         # Prettier formatting
pnpm --filter @hirokisakabe/pom-cli run fmt:check   # Format check
pnpm --filter @hirokisakabe/pom-cli run typecheck   # Type checking
pnpm --filter @hirokisakabe/pom-cli run knip        # Detect unused code
```

## Release Flow

pom-cli uses Changesets for versioning. The release is handled by the unified `release.yml` workflow.

1. Add a changeset: `pnpm exec changeset add`
2. Release PR merges → `changeset version` bumps `package.json` version
3. `release.yml` runs `changeset publish` → publishes to npm as `@hirokisakabe/pom-cli`

## PR 作成前チェック

- [ ] changeset を追加する: `pnpm exec changeset add`
