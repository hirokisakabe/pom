---
"@hirokisakabe/pom": patch
---

fix: horizontal Timeline の両端アイテムでラベルがコンテナ外にはみ出す不具合を修正

`renderHorizontalTimeline` で線端点を `labelW / 2` でインセットし、両端アイテムのラベル矩形が Timeline コンテナの矩形内に収まるようにした。あわせて `measureTimeline` の intrinsic width を `labelW + (itemCount - 1) * minItemSpacing` に補正し、scaleFactor の過大算出も解消している。
