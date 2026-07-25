# AGENTS.md — packages/pom

Core library of pom. PPTX generation pipeline: `parseXml/` → `calcYogaLayout/` → `toPositioned/` → `renderPptx/`. リポジトリ共通ルールはルート `AGENTS.md` を参照。

## Feature Addition Checklist

適用条件: `src/**` を変更して新しいプロパティや機能を追加する場合。

When adding new properties or features, update the following files:

1. **Type definitions**: `packages/pom/src/types.ts` - Add new types or properties
2. **Coercion rules**: `packages/pom/src/parseXml/coercionRules.ts` - Add attribute coercion rules
3. **XML parser**: `packages/pom/src/parseXml/parseXml.ts` - Add XML tag/attribute conversion logic
4. **Node registry**: `packages/pom/src/registry/definitions/` - Add node definition to the registry
5. **Rendering**: Under `packages/pom/src/renderPptx/` - Implement `@pptx-glimpse/document` authoring conversion
6. **VRT test data**: `packages/pom/vrt/lib/generatePptx.ts` - Add test cases for the new feature
7. **Update VRT baseline**: Run `pnpm run vrt:docker:update` (from `packages/pom/`)
8. **Documentation updates**:
   - `packages/pom/README.md` - User-facing documentation
   - `packages/pom/docs/nodes.md` - Nodes
   - `apps/website/public/llm.txt` - XML reference for LLMs (for prompts)
   - ルート `AGENTS.md` - Add to Key Internal Types section
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

## Preview Workflow

適用条件: `main.ts` を編集して PPTX 出力を検証する場合。

1. Edit `packages/pom/main.ts` (and modify logic under `packages/pom/src/` as needed)
2. Run `pnpm run preview:docker` from `packages/pom/`
3. Visually verify `packages/pom/preview/output/sample.png`
4. If there are layout issues, fix and return to step 2
5. If everything looks good, commit

### Output Files

- `packages/pom/preview/output/sample.pptx` - Generated PPTX
- `packages/pom/preview/output/sample.png` - PNG image (for layout verification)

## Text Measurement

適用条件: `src/calcYogaLayout/**` を変更する場合。

Text width measurement uses `opentype.js`. The Noto Sans JP font is bundled with the library and works in both Node.js and browser environments.

- `packages/pom/src/calcYogaLayout/measureText.ts` - Text measurement logic
- `packages/pom/src/calcYogaLayout/fontLoader.ts` - Font loading (opentype.js)
- `packages/pom/src/calcYogaLayout/fonts/` - Bundled fonts (Base64)
- The `textMeasurement` option in `buildPptx` allows explicit specification of the measurement method
  - `"opentype"`: Always measure with opentype.js; unregistered fonts use bundled Noto Sans JP metrics
  - `"fallback"`: Always use fallback calculation (CJK characters = 1em, alphanumeric = 0.5em)
  - `"auto"`: Measure bundled or registered fonts with opentype.js and use fallback for unregistered fonts (default)

### Unit Conversion

- User input: pixels (px)
- Internal layout: pixels (yoga-layout)
- PPTX output: inches (converted via `pxToIn`, 96 DPI basis)
