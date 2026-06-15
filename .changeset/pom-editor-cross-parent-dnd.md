---
"@hirokisakabe/pom-editor": minor
---

`PomAstEditor` の DnD を拡張し、AST の nest 構造そのものを変更できるようにしました。これまで同じ親内のきょうだい並び替えしかできなかったところ、別の container (`VStack` / `HStack` / `Layer`) への移動、container 配下のノードの root への引き上げ、container 自体の入れ子化が可能になります。各行の前後の隙間 (gap) に drop すると **きょうだい**として挿入され、container 本体に drop すると **その container の末尾子要素**として nest される動作を UI 上でも区別できるようにしました (gap は青い挿入インジケータ、inside drop は container 本体の青ハイライト)。サイクルになる移動 (自分の子孫の中への drop) と container 以外への inside drop は構造上禁止しています。

破壊的変更ではありませんが、内部依存だった `@dnd-kit/sortable` / `@dnd-kit/utilities` は不要になったため削除しています (公開 API は不変)。
