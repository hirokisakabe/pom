---
"@hirokisakabe/pom": minor
---

feat: Table セル / ProcessArrow / Pyramid / TextRun（`<Span>`）に `fontFamily` 属性を追加

- `<Td fontFamily="...">` でセル単位のフォント指定が可能に
- `<ProcessArrow fontFamily="...">` / `<Pyramid fontFamily="...">` でラベルフォントを切り替え可能に
- `<Text>` / `<Li>` 内の `<Span fontFamily="...">` でインラインのフォント切り替えに対応（親 `fontFamily` を上書き）
- 未指定時の挙動と既存ノードのデフォルト（`Noto Sans JP`）は変更なし
