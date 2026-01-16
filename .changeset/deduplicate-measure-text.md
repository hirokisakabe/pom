---
"@hirokisakabe/pom": patch
---

refactor: measureText.ts の重複コード排除

- measureTextCanvas と measureTextFallback の折り返しロジックを wrapText 関数に抽出
- 結果計算ロジックを calculateResult 関数に抽出
- 約50行の削減
