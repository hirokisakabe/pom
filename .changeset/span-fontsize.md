---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

`<Span>` に `fontSize` 属性を追加。`<Text>` / `<Li>` / `<Td>` 内で 1 つの run だけ大きい / 小さいフォントサイズを混ぜられるようになる。KPI ダッシュボードで頻出する「大きい数字 + 小さい単位」(例: `¥84.2`+`M`、`118`+`%`) を、`HStack` + 2 Text の回避策なしで単一 Text 内で表現できる。親 Text の `bold` / `color` / `fontFamily` は継承され、Span 側で明示的に上書きしない限り維持される。レイアウト計測は最大 `fontSize` を採用するため、Text 枠は最大グリフに合わせて確保されクリッピングが起きない。`@hirokisakabe/pom-jsx` の `SpanProps` にも `fontSize?: number` を追加。
