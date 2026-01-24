---
"@hirokisakabe/pom": minor
---

feat: `layer` ノードの追加（絶対配置コンテナ）

子要素を絶対座標（x, y）で配置できる `layer` ノードを追加しました。

- 子要素は `x`, `y` を必須プロパティとして持つ
- 描画順序は配列の順序（後の要素が上に来る）
- layer は VStack/HStack 内に配置可能（layer 自体のサイズは Flexbox で決まる）
- layer 内に layer をネスト可能
- layer 内に VStack/HStack を配置可能
