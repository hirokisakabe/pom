---
"@hirokisakabe/pom": minor
"@hirokisakabe/pom-jsx": minor
---

`Chart` ノードに `sparkline="true"` モードを追加。指定すると凡例 / 軸タイトル / 軸ラベル / 軸線 / グリッド線 / マージンをすべて非表示にし、プロット領域をチャート領域いっぱいに広げる。KPI タイルに inline 表示する小寸法 (例: `h=40`) の `bar` / `line` / `area` チャートでバーや線がつぶれずに見える sparkline 風表示が可能になる。pom-jsx の `ChartProps` にも `sparkline?: boolean` を追加。
