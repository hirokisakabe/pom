---
paths:
  - packages/pom-editor/**
---

## pom-editor (`packages/pom-editor/`)

Visual DnD AST editor component for pom. Exports `PomAstEditor` — a React component that receives pom XML via `xml` prop, renders the AST as a draggable tree, and calls `onChange` with updated XML when nodes are reordered.

```bash
pnpm --filter @hirokisakabe/pom-editor run build       # TypeScript compilation
pnpm --filter @hirokisakabe/pom-editor run lint        # ESLint
pnpm --filter @hirokisakabe/pom-editor run fmt         # Prettier formatting
pnpm --filter @hirokisakabe/pom-editor run fmt:check   # Format check
pnpm --filter @hirokisakabe/pom-editor run typecheck   # Type checking
pnpm --filter @hirokisakabe/pom-editor run knip        # Detect unused code
```

React 18+ is a peer dependency. DnD is powered by `@dnd-kit/core` + `@dnd-kit/sortable`.

### Release Flow

pom-editor uses Changesets for versioning. The release is handled by the unified `release.yml` workflow.

1. Add a changeset: `pnpm exec changeset add`
2. Release PR merges → `changeset version` bumps `package.json` version
3. `release.yml` runs `changeset publish` → publishes to npm as `@hirokisakabe/pom-editor`

### PR 作成前チェック

- [ ] changeset を追加する: `pnpm exec changeset add`
