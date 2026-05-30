---
"@hirokisakabe/pom-cli": patch
---

`pom build` でバリデーションエラーが発生した際、診断コードとメッセージを1件ずつ整形して stderr に出力するようになった。複数エラーがある場合はすべて列挙される。
