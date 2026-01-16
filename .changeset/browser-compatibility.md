---
"@hirokisakabe/pom": minor
---

feat: ブラウザ互換性対応 - canvas を opentype.js に置き換え

- `canvas` パッケージを `opentype.js` に置き換え
- Noto Sans JP フォントをライブラリにバンドル（Base64）
- Node.js とブラウザ両方で動作するテキスト計測を実現
- `TextMeasurementMode` の値を `"canvas"` から `"opentype"` に変更

BREAKING CHANGE: `textMeasurement` オプションの `"canvas"` 値は `"opentype"` に変更されました
