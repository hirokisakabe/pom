---
"@hirokisakabe/pom": patch
---

refactor: renderPptx.ts をノードタイプ別に分割

- renderPptx.ts を 1,171行から 110行に削減
- ノードタイプごとにレンダラー関数を分離（nodes/配下）
- 共通ユーティリティを utils/ に抽出（backgroundBorder, shapeDrawing, textDrawing）
