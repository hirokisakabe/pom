# @hirokisakabe/pom

## 1.1.3

### Patch Changes

- [#179](https://github.com/hirokisakabe/pom/pull/179) [`d3b8428`](https://github.com/hirokisakabe/pom/commit/d3b8428e833ead6b01eeb1f9d60e594fcec511ea) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - chore: zod を 4.1.12 から 4.3.6 にアップデート

## 1.1.2

### Patch Changes

- [#177](https://github.com/hirokisakabe/pom/pull/177) [`1350df4`](https://github.com/hirokisakabe/pom/commit/1350df4fc4953bd5839313a668a5c845105feecf) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: schema.ts に不足していたノードスキーマのエクスポートを追加

  以下のスキーマと型を `@hirokisakabe/pom/schema` からエクスポートするように修正:
  - inputTimelineNodeSchema / InputTimelineNode
  - inputMatrixNodeSchema / InputMatrixNode
  - inputTreeNodeSchema / InputTreeNode
  - inputFlowNodeSchema / InputFlowNode
  - inputProcessArrowNodeSchema / InputProcessArrowNode
  - inputLineNodeSchema / InputLineNode
  - inputLayerNodeSchema / InputLayerNode

## 1.1.1

### Patch Changes

- [#175](https://github.com/hirokisakabe/pom/pull/175) [`21f31a5`](https://github.com/hirokisakabe/pom/commit/21f31a55f984d9a65c16c95b710d92a4a14e5941) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: ESM 環境での import 拡張子問題を修正
  - TypeScript の `moduleResolution: NodeNext` と `rewriteRelativeImportExtensions` を使用して、ビルド時に相対 import に `.js` 拡張子を自動追加
  - これにより `@hirokisakabe/pom/schema` を ESM 環境でインポートした際に発生していた `ERR_MODULE_NOT_FOUND` エラーを解消

## 1.1.0

### Minor Changes

- [#171](https://github.com/hirokisakabe/pom/pull/171) [`ad7cd40`](https://github.com/hirokisakabe/pom/commit/ad7cd400794ee4b7c48947e187bc046dd505702e) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `layer` ノードの追加（絶対配置コンテナ）

  子要素を絶対座標（x, y）で配置できる `layer` ノードを追加しました。
  - 子要素は `x`, `y` を必須プロパティとして持つ
  - 描画順序は配列の順序（後の要素が上に来る）
  - layer は VStack/HStack 内に配置可能（layer 自体のサイズは Flexbox で決まる）
  - layer 内に layer をネスト可能
  - layer 内に VStack/HStack を配置可能

- [#168](https://github.com/hirokisakabe/pom/pull/168) [`9885a29`](https://github.com/hirokisakabe/pom/commit/9885a29076a9d355acfa0c7d1548fc94314d9de8) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: line ノードの追加

  接続線・矢印を描画するための `line` ノードを追加しました。
  - 絶対座標（x1, y1, x2, y2）で始点・終点を指定
  - 線の色（color）、太さ（lineWidth）、破線パターン（dashType）をサポート
  - 矢印オプション（beginArrow, endArrow）をサポート
  - 矢印タイプ（none, arrow, triangle, diamond, oval, stealth）を指定可能

## 1.0.0

### Major Changes

- [#161](https://github.com/hirokisakabe/pom/pull/161) [`f926577`](https://github.com/hirokisakabe/pom/commit/f92657708da4f9daaf48e83387c1226a5bff8349) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - BREAKING CHANGE: Replace MasterSlideOptions with SlideMasterOptions

  This release replaces the pseudo master slide implementation with pptxgenjs's native `defineSlideMaster` API, creating true PowerPoint master slides that are editable in PowerPoint.

  ### Breaking Changes
  - **Removed**: `MasterSlideOptions` type
  - **Removed**: `composePage` and `replacePlaceholders` internal functions
  - **Removed**: Dynamic placeholders (`{{page}}`, `{{totalPages}}`, `{{date}}`)
  - **Removed**: `header` and `footer` options (use `objects` instead)
  - **Removed**: `pageNumber.position` option (use `slideNumber` instead)

  ### New API

  The new `SlideMasterOptions` type provides:
  - `title`: Master slide name (optional, auto-generated if omitted)
  - `background`: Slide background (`{ color }`, `{ path }`, or `{ data }`)
  - `margin`: Content margins in pixels
  - `objects`: Array of static objects (`text`, `image`, `rect`, `line`) with absolute coordinates
  - `slideNumber`: Page number configuration using pptxgenjs built-in feature

  ### Migration Guide

  Before:

  ```typescript
  {
    master: {
      header: { type: "hstack", ... },
      footer: { type: "hstack", ... },
      pageNumber: { position: "right" },
      date: { value: "2025/01/01" },
    }
  }
  ```

  After:

  ```typescript
  {
    master: {
      title: "MY_MASTER",
      objects: [
        { type: "rect", x: 0, y: 0, w: 1280, h: 40, fill: { color: "0F172A" } },
        { type: "text", text: "Header", x: 48, y: 12, w: 200, h: 28, fontPx: 14 },
        { type: "text", text: "2025/01/01", x: 1032, y: 12, w: 200, h: 28, fontPx: 12 },
      ],
      slideNumber: { x: 1100, y: 680, fontPx: 10 },
    }
  }
  ```

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
