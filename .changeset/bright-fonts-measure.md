---
"@hirokisakabe/pom": minor
---

`buildPptx` の `fonts` オプションに `ArrayBuffer` / `Uint8Array` の font data を持つ `FontInput[]` を指定し、Text・Ul・Ol・Shape の幅と折り返しを実フォントの advance width で計測できるようにしました。
