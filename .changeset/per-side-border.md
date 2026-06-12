---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

feat: 辺ごとの border 指定 `borderTop` / `borderRight` / `borderBottom` / `borderLeft` を追加

全ノード共通属性として、辺ごとに `color` / `width` / `dashType` を指定できる per-side border を追加しました。「左辺だけ太いアクセントバー付きのカード」「下線だけのセクション見出し」などをワークアラウンドなしで表現できます。

- `borderLeft.color="1D4ED8" borderLeft.width="6"` のように dot 記法 / JSON shorthand の両方で指定可能
- 既存の `border` (4 辺一律) と併用した場合、各辺はフィールド単位でマージされ辺ごとの指定が優先されます
- `border` のみ指定した既存 XML の出力は変化しません (後方互換)
- `borderRadius` との併用はサポート外です。併用時は diagnostics 警告 (`PER_SIDE_BORDER_WITH_RADIUS`) を発し、辺ごとの指定を無視して一律 `border` で描画します
- pom-jsx の `BaseProps` にも同名の props を追加しました
