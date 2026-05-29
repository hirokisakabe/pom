---
paths:
  - packages/pom/src/**
---

## Feature Addition Checklist

When adding new properties or features, update the following files:

1. **Type definitions**: `packages/pom/src/types.ts` - Add new types or properties
2. **Coercion rules**: `packages/pom/src/parseXml/coercionRules.ts` - Add attribute coercion rules
3. **XML parser**: `packages/pom/src/parseXml/parseXml.ts` - Add XML tag/attribute conversion logic
4. **Node registry**: `packages/pom/src/registry/definitions/` - Add node definition to the registry
5. **Rendering**: Under `packages/pom/src/renderPptx/` - Implement pptxgenjs conversion
6. **VRT test data**: `packages/pom/vrt/lib/generatePptx.ts` - Add test cases for the new feature
7. **Update VRT baseline**: Run `pnpm run vrt:docker:update` (from `packages/pom/`)
8. **Documentation updates**:
   - `packages/pom/README.md` - User-facing documentation
   - `packages/pom/docs/nodes.md` - Nodes
   - `apps/website/public/llm.txt` - XML reference for LLMs (for prompts)
   - `CLAUDE.md` - Add to Key Internal Types section
9. **Documentation image updates** (when adding new node types):
   - Add to `NODE_TYPES` in `packages/pom/scripts/docs-images/config.ts`
   - Define sample XML in `packages/pom/scripts/docs-images/sampleNodes.ts`
   - Run `pnpm run docs:images:docker:update` (from `packages/pom/`)
10. **Add changeset**: Run `pnpm exec changeset add` before creating a PR
11. **pom-jsx updates** (when adding new node types):
    - `packages/pom-jsx/src/types.ts` - Add `{NodeName}Props` interface
    - `packages/pom-jsx/src/components.ts` - Add component function
    - `packages/pom-jsx/src/jsx-runtime.ts` - Add to `JSX.IntrinsicElements`
    - `packages/pom-jsx/src/index.ts` - Export the new component and `{NodeName}Props` type
    - `packages/pom-jsx/src/integration.test.tsx` - Add test case
    - `packages/pom-jsx/README.md` - Add to component table
12. **pom-editor updates** (when adding new node types):
    - `packages/pom-editor/src/ast.ts` - Add new node type to AST mapping if needed
    - `packages/pom-editor/src/AstTree.tsx` - Add label to `NODE_LABELS` if needed
