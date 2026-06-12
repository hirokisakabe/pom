# pom-vscode

## 0.3.2

### Patch Changes

- [#836](https://github.com/hirokisakabe/pom/pull/836) [`481cbeb`](https://github.com/hirokisakabe/pom/commit/481cbeba4a106464d2e6b206741459c9e8813a72) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: 辺ごとの border 指定 `borderTop` / `borderRight` / `borderBottom` / `borderLeft` を追加

  全ノード共通属性として、辺ごとに `color` / `width` / `dashType` を指定できる per-side border を追加しました。「左辺だけ太いアクセントバー付きのカード」「下線だけのセクション見出し」などをワークアラウンドなしで表現できます。
  - `borderLeft.color="1D4ED8" borderLeft.width="6"` のように dot 記法 / JSON shorthand の両方で指定可能
  - 既存の `border` (4 辺一律) と併用した場合、各辺はフィールド単位でマージされ辺ごとの指定が優先されます
  - `border` のみ指定した既存 XML の出力は変化しません (後方互換)
  - `borderRadius` との併用はサポート外です。併用時は diagnostics 警告 (`PER_SIDE_BORDER_WITH_RADIUS`) を発し、辺ごとの指定を無視して一律 `border` で描画します
  - pom-jsx の `BaseProps` にも同名の props を追加しました
  - pom-vscode の diagnostics 重大度マップに `PER_SIDE_BORDER_WITH_RADIUS` (Warning) を追加しました

## 0.3.1

### Patch Changes

- [#628](https://github.com/hirokisakabe/pom/pull/628) [`07e38e1`](https://github.com/hirokisakabe/pom/commit/07e38e13f7bc92739863dbd8cf996dddd6191df8) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: pom-md の Directive 対応に追随（動的 slideSize、masterPptx 読み込み）

## 0.2.0

### Minor Changes

- [#574](https://github.com/hirokisakabe/pom/pull/574) [`25f1378`](https://github.com/hirokisakabe/pom/commit/25f1378a84058c58590323196172729b2e73c5b3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - .pom.xml ファイルのライブプレビューおよび PPTX エクスポートに対応
