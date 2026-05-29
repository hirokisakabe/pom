---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-editor": minor
---

`serializeXml`, `parseXml`, `POMNode` を `@hirokisakabe/pom` の公開 API に追加する。

`@hirokisakabe/pom-editor` パッケージを新規追加する。pom XML の AST をツリー表示し、
DnD でノードを並び替えると `onChange` で更新後の XML が返る `PomAstEditor` コンポーネントを提供する。
