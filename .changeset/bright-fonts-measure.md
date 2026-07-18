---
"@hirokisakabe/pom": minor
---

`buildPptx` の `fonts` オプションで `ArrayBuffer` / `Uint8Array` の custom font data を受け取り、Text・list・Shape の幅と折り返しを実フォントの advance width で計測できるようにしました。
