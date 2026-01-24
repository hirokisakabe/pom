---
"@hirokisakabe/pom": minor
---

feat: DiagramNode を追加

ネットワーク構成図やアーキテクチャ図など、絶対座標で要素を配置し接続線で結ぶダイアグラムを作成する機能を追加しました。

- 背景エリア（areas）: グループ化のための背景領域
- 要素（elements）: 各種シェイプ（rect, roundRect, ellipse, cloud, can, cube, hexagon, diamond, parallelogram, triangle）
- 接続線（connections）: 直線およびL字型（elbow）接続、矢印対応
- 分岐接続（splitConnections）: 1対多の分岐接続
- アンカーポイント: top, bottom, left, right, center
- デフォルトスタイル: defaultElementStyle, defaultConnectionStyle
