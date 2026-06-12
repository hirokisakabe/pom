/**
 * パイプライン (parseXml → calcYogaLayout → toPositioned → renderPptx) の
 * 層境界を機械的に強制する dependency-cruiser 設定。
 *
 * - 前段モジュールから後段モジュールへの import を禁止する
 * - 循環依存を禁止する
 *
 * registry/ は NodeDefinition metadata の単一ソース (#814) として
 * 全ステージの実装を集約参照する設計のため、層順序の対象外とする。
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-forward-import-from-parsexml",
      comment:
        "parseXml (1 段目) から後段 (calcYogaLayout / toPositioned / renderPptx) への import は層構造違反",
      severity: "error",
      from: { path: "^src/parseXml" },
      to: { path: "^src/(calcYogaLayout|toPositioned|renderPptx)" },
    },
    {
      name: "no-forward-import-from-calcyogalayout",
      comment:
        "calcYogaLayout (2 段目) から後段 (toPositioned / renderPptx) への import は層構造違反",
      severity: "error",
      from: { path: "^src/calcYogaLayout" },
      to: { path: "^src/(toPositioned|renderPptx)" },
    },
    {
      name: "no-forward-import-from-topositioned",
      comment:
        "toPositioned (3 段目) から後段 (renderPptx) への import は層構造違反",
      severity: "error",
      from: { path: "^src/toPositioned" },
      to: { path: "^src/renderPptx" },
    },
    {
      name: "no-circular",
      comment: "モジュール間の循環依存は禁止",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.test\\.ts$" },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
