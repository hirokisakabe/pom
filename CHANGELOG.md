# @hirokisakabe/pom

## 0.3.0

### Minor Changes

- [#159](https://github.com/hirokisakabe/pom/pull/159) [`a0b8407`](https://github.com/hirokisakabe/pom/commit/a0b84072e7107ca0422bdaf65b66d193c9b39be7) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: ブラウザ互換性対応 - canvas を opentype.js に置き換え
  - `canvas` パッケージを `opentype.js` に置き換え
  - Noto Sans JP フォントをライブラリにバンドル（Base64）
  - Node.js とブラウザ両方で動作するテキスト計測を実現
  - `TextMeasurementMode` の値を `"canvas"` から `"opentype"` に変更

  BREAKING CHANGE: `textMeasurement` オプションの `"canvas"` 値は `"opentype"` に変更されました

### Patch Changes

- [#157](https://github.com/hirokisakabe/pom/pull/157) [`459217e`](https://github.com/hirokisakabe/pom/commit/459217ea4c411ba94762ab991c4c7688e1a303e4) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: measureText.ts の重複コード排除
  - measureTextCanvas と measureTextFallback の折り返しロジックを wrapText 関数に抽出
  - 結果計算ロジックを calculateResult 関数に抽出
  - 約50行の削減

- [#158](https://github.com/hirokisakabe/pom/pull/158) [`eb3c332`](https://github.com/hirokisakabe/pom/commit/eb3c332d94f3cb1c8e1bf46f11620a833323c684) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: calcYogaLayout.ts の Flex 処理を統合

- [#155](https://github.com/hirokisakabe/pom/pull/155) [`597912f`](https://github.com/hirokisakabe/pom/commit/597912f7b127dc303dad67db6801a973b32a334f) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: renderPptx.ts をノードタイプ別に分割
  - renderPptx.ts を 1,171行から 110行に削減
  - ノードタイプごとにレンダラー関数を分離（nodes/配下）
  - 共通ユーティリティを utils/ に抽出（backgroundBorder, shapeDrawing, textDrawing）

## 0.2.0

### Minor Changes

- [#151](https://github.com/hirokisakabe/pom/pull/151) [`0537eee`](https://github.com/hirokisakabe/pom/commit/0537eeed1f20c34e99300548d4c93d7a461f7332) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - ProcessArrowNode を追加
