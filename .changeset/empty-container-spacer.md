---
"@hirokisakabe/pom": patch
---

空の `<VStack />` / `<HStack />` / `<Layer />` を許容するように修正。これまでは子要素を持たないコンテナノードを描画しようとすると `containerNode.children is not iterable` で TypeError になっていた。`<VStack grow="1" />` のような透明スペーサー primitive として使えるようになる。
