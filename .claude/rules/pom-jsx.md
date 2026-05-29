---
paths:
  - packages/pom-jsx/**
---

## pom-jsx (`packages/pom-jsx/`)

JSX/TSX authoring package for pom. Provides a custom JSX runtime so users can write pom slides as JSX/TSX components, which are serialized to pom XML strings and passed to `buildPptx()`.

```bash
pnpm --filter @hirokisakabe/pom-jsx run build           # TypeScript compilation
pnpm --filter @hirokisakabe/pom-jsx run lint            # ESLint
pnpm --filter @hirokisakabe/pom-jsx run fmt             # Prettier formatting
pnpm --filter @hirokisakabe/pom-jsx run fmt:check       # Format check
pnpm --filter @hirokisakabe/pom-jsx run typecheck       # Type checking (tsconfig.test.json)
pnpm --filter @hirokisakabe/pom-jsx run knip            # Detect unused code
pnpm --filter @hirokisakabe/pom-jsx run test:run        # Run tests
pnpm --filter @hirokisakabe/pom-jsx run test:coverage   # Run tests with coverage
```

### Adding a New Node Type

When a new node type is added to `@hirokisakabe/pom`, update the following files in order:

1. **`src/types.ts`** — Add props type for the new node
2. **`src/components.ts`** — Export the new JSX component
3. **`src/jsx-runtime.ts`** — Register the new tag in the JSX runtime if needed
4. **`src/integration.test.tsx`** — Add integration test covering the new node
5. **`README.md`** — Document the new component

### Release Flow

pom-jsx uses Changesets for versioning. The release is handled by the unified `release.yml` workflow.

1. Add a changeset: `pnpm exec changeset add`
2. Release PR merges → `changeset version` bumps `package.json` version
3. `release.yml` runs `changeset publish` → publishes to npm as `@hirokisakabe/pom-jsx`
