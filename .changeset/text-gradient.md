---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

`<Text>` ノードに `textGradient` 属性を追加しました。`backgroundGradient` と同じ `linear-gradient(...)` 構文 (角度 + 2 色以上のカラーストップ) で文字自体をネイティブの PowerPoint グラデーション塗りにできます。`color` よりも優先され、`<Span>` / `<B>` などの inline run 単位の色も上書きして Text 全体に同じグラデーションが適用されます (run 単位の指定は今後の課題)。Theme トークン (`$tokenName`) 参照も `textGradient` 文字列内で解決されます。`pom-jsx` 側にも対応する `textGradient` prop を追加しました。
