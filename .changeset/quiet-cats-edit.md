---
"@hirokisakabe/pom-editor": major
---

公開コンポーネントを `PomEditor` に一本化し、package root から `PomAstEditor` と `PomAstEditorProps` の export を削除します。

AST 編集を利用する場合は、XML / AST モード切り替え、preview、diagnostics、host actions をまとめた `PomEditor` へ移行してください。
