---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

`<Timeline>` ノードのカスタマイズ範囲を拡張しました。

- `connectorColor`: 軸線色をハードコードの `E2E8F0` から変更可能になりました
- `connectorGradient`: `backgroundGradient` と同じ `linear-gradient(...)` 構文で軸線にリニアグラデーションを適用できます
- `useColorForDate`: `true` を指定すると各 `<TimelineItem>` の `color` が `date` テキスト色として連動します
- `<TimelineItem dateColor>`: per-item で `date` 色を上書きできます。`Timeline.dateColor` / `useColorForDate` よりも優先されます
- `fontFamily`: `Noto Sans JP` ハードコードを解除し、Timeline 全体のフォントファミリを指定できるようになりました (未指定時は従来通り `Noto Sans JP`)

既存 Timeline の出力は変化しません (後方互換)。`pom-jsx` 側にも対応する props を追加しました。
