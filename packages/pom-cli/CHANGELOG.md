# @hirokisakabe/pom-cli

## 0.6.6

### Patch Changes

- Updated dependencies [[`433193e`](https://github.com/hirokisakabe/pom/commit/433193e1e3d3ef6342e4ffbda1278ae706b08add), [`cc5aaa8`](https://github.com/hirokisakabe/pom/commit/cc5aaa86d60fbded6c9d0136bafdf7043a06a698)]:
  - @hirokisakabe/pom@8.9.0

## 0.6.5

### Patch Changes

- Updated dependencies [[`617de43`](https://github.com/hirokisakabe/pom/commit/617de431a17c99943d96de9cc8ad70f240138a8d), [`fea9dbb`](https://github.com/hirokisakabe/pom/commit/fea9dbb8270dc87105009bccb4febcef9f2854f2), [`3f01b2c`](https://github.com/hirokisakabe/pom/commit/3f01b2c00528fdae98aaf644ff59259742bee5d5)]:
  - @hirokisakabe/pom@8.8.0

## 0.6.4

### Patch Changes

- Updated dependencies [[`196ac27`](https://github.com/hirokisakabe/pom/commit/196ac27d3c8af47535092b90f59dcca8be03cf69), [`cd56388`](https://github.com/hirokisakabe/pom/commit/cd563889dfc83d1d05b7ae1d4ae0a7a933261be3)]:
  - @hirokisakabe/pom@8.7.0

## 0.6.3

### Patch Changes

- Updated dependencies [[`6e3e2de`](https://github.com/hirokisakabe/pom/commit/6e3e2de686227b71d623ab0f23289436baf3aef6), [`64edc50`](https://github.com/hirokisakabe/pom/commit/64edc508fe323b603af34b5b663602ccc1468709)]:
  - @hirokisakabe/pom@8.6.0

## 0.6.2

### Patch Changes

- [#857](https://github.com/hirokisakabe/pom/pull/857) [`50770de`](https://github.com/hirokisakabe/pom/commit/50770de0904631f19129be0d58185ce810414067) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - pptx-glimpse を 1.1.1 に更新しました。

## 0.6.1

### Patch Changes

- Updated dependencies [[`94b05be`](https://github.com/hirokisakabe/pom/commit/94b05be056eb7d1b4e910b58cb92edbbc28c185b)]:
  - @hirokisakabe/pom@8.5.1

## 0.6.0

### Minor Changes

- [#848](https://github.com/hirokisakabe/pom/pull/848) [`3448b2b`](https://github.com/hirokisakabe/pom/commit/3448b2b84e81ef0c3fd468b6e1ad580206dd256b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - pptx-glimpse を 1.1.0 に更新し、SVG のネイティブテキスト出力 (`textOutput: "text"`) を取り込み
  - `pom render --format svg` に `--text-output <path|text>` オプションを追加。`text` を指定すると、グリフのアウトライン `<path>` ではなくネイティブ `<text>` 要素 + サブセット化フォントの `@font-face` (data URI) 埋め込みで出力する (デフォルトは従来どおり `path`)
  - `pom preview` はインライン SVG 表示のため常に `textOutput: "text"` で変換するように変更。ブラウザのネイティブテキスト描画 (ヒンティング等) が効き、テキスト選択も可能になる

## 0.5.2

### Patch Changes

- Updated dependencies [[`7977b7b`](https://github.com/hirokisakabe/pom/commit/7977b7b425f11e4c2bce2eb854e2c76177154f7b)]:
  - @hirokisakabe/pom@8.5.0

## 0.5.1

### Patch Changes

- Updated dependencies [[`7dae5eb`](https://github.com/hirokisakabe/pom/commit/7dae5eb25daee47e088363d72f9c1e6281917205), [`481cbeb`](https://github.com/hirokisakabe/pom/commit/481cbeba4a106464d2e6b206741459c9e8813a72), [`41bd4d7`](https://github.com/hirokisakabe/pom/commit/41bd4d761f1ec65110de866b3fe535882b122abe), [`d0c1bbb`](https://github.com/hirokisakabe/pom/commit/d0c1bbb39c849d35b7ca4f0069a62645d548c67a), [`924f2e9`](https://github.com/hirokisakabe/pom/commit/924f2e98c98dd73dcbd1b81e771b7674df1ca59d)]:
  - @hirokisakabe/pom@8.4.0

## 0.5.0

### Minor Changes

- [#819](https://github.com/hirokisakabe/pom/pull/819) [`360c1ca`](https://github.com/hirokisakabe/pom/commit/360c1caeec8ebddc8b1c5d2722283db91cdee1ad) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `pom render <file> -o <dir>` サブコマンドを追加しました。pptx-glimpse を使って各スライドを LibreOffice なしで直接 PNG / SVG 画像として出力できます。`--format svg` で SVG 出力、`--slides 2,5` で対象スライドの指定が可能です。

## 0.4.0

### Minor Changes

- [#802](https://github.com/hirokisakabe/pom/pull/802) [`36ff2d2`](https://github.com/hirokisakabe/pom/commit/36ff2d26ec07029f8fa7f05bb8d2d0afda11a20d) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `pom preview` 起動時にブラウザを自動オープンするようにした（`--no-open` で抑止可能）。ファイル監視をディレクトリ監視方式に変更し、エディタの atomic save 後も live reload が継続するようにした。

### Patch Changes

- Updated dependencies [[`cc7a6c4`](https://github.com/hirokisakabe/pom/commit/cc7a6c40c05ebe789b9782032206db7afbb3e13e), [`106bb60`](https://github.com/hirokisakabe/pom/commit/106bb60742d602ff2d784688587043f0c5aedf85), [`74edfb6`](https://github.com/hirokisakabe/pom/commit/74edfb662685a59fe20f89ab6de0d6412e6ccdf3)]:
  - @hirokisakabe/pom@8.3.0

## 0.3.2

### Patch Changes

- Updated dependencies [[`0fa2f65`](https://github.com/hirokisakabe/pom/commit/0fa2f658eb78c7d73c0bdb5aa56c5e635bcfea24)]:
  - @hirokisakabe/pom@8.2.1

## 0.3.1

### Patch Changes

- [#778](https://github.com/hirokisakabe/pom/pull/778) [`ae7815f`](https://github.com/hirokisakabe/pom/commit/ae7815f747e8f476715cac5d8a53a5dc76e28bff) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - deps: pptx-glimpse を 0.11.0 → 0.11.2 に更新

## 0.3.0

### Minor Changes

- [#777](https://github.com/hirokisakabe/pom/pull/777) [`c13343d`](https://github.com/hirokisakabe/pom/commit/c13343df1c325062213b2907ed92d279dde000b2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `pom build` に `--watch` フラグを追加。入力ファイルの変更を監視して自動再ビルドする。ビルドエラー時もプロセスを終了せず次の変更を待ち続ける。

- [#764](https://github.com/hirokisakabe/pom/pull/764) [`19feed7`](https://github.com/hirokisakabe/pom/commit/19feed7eaa1b9d870be615faf2889aee0566a9c4) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `pom preview` に `--port <number>` オプションを追加。ポート番号を指定してサーバーを起動できるようになった。未指定時は従来通り 3000 番を使用。

- [#774](https://github.com/hirokisakabe/pom/pull/774) [`93189a8`](https://github.com/hirokisakabe/pom/commit/93189a8bf8b02e5c8aa14872f65c51f2e5d02b8f) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `pom build` と `pom preview` に `--verbose` フラグを追加した。指定するとビルド処理の各ステップ（ファイル読み込み・Markdown パース・PPTX ビルド・書き出し）の処理時間が `[pom] ...` 形式で stderr に出力される。

### Patch Changes

- [#771](https://github.com/hirokisakabe/pom/pull/771) [`378ccfe`](https://github.com/hirokisakabe/pom/commit/378ccfe49a3f32645ad6e86ee70f0fd85e36f0a5) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `pom build` でバリデーションエラーが発生した際、診断コードとメッセージを1件ずつ整形して stderr に出力するようになった。複数エラーがある場合はすべて列挙される。

## 0.2.5

### Patch Changes

- Updated dependencies [[`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b)]:
  - @hirokisakabe/pom@8.2.0

## 0.2.4

### Patch Changes

- [#745](https://github.com/hirokisakabe/pom/pull/745) [`39d5739`](https://github.com/hirokisakabe/pom/commit/39d5739c9bc064350b279c5cc5d74371e7f25dcd) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - プレビューサーバーの UI を全面リニューアルする: ダークツールバー・接続ステータスインジケーター・スピナーアニメーション・スライド番号オーバーレイ・+/- キーズームを追加

## 0.2.3

### Patch Changes

- [#733](https://github.com/hirokisakabe/pom/pull/733) [`3e25e11`](https://github.com/hirokisakabe/pom/commit/3e25e11c3dda30b90cefaaf66fc2b9d918c38ace) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: workspace:\* 依存を正しく解決した状態で再リリースする

## 0.2.2

### Patch Changes

- [#731](https://github.com/hirokisakabe/pom/pull/731) [`f021271`](https://github.com/hirokisakabe/pom/commit/f021271fd3df63b436589eebe29bd7cdca5efc54) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: リリースパイプラインの修正に伴う再リリース (workspace:\* 解決)

## 0.2.1

### Patch Changes

- [#728](https://github.com/hirokisakabe/pom/pull/728) [`a06f811`](https://github.com/hirokisakabe/pom/commit/a06f811a37e1ec1e9c6e3a91e4b8e9701855dac8) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: workspace:\* 依存が npm publish 時に解決されない問題を修正する

## 0.2.0

### Minor Changes

- [#716](https://github.com/hirokisakabe/pom/pull/716) [`6ec94fc`](https://github.com/hirokisakabe/pom/commit/6ec94fc7266f777aaa9e15bb9c76bfff2b8394c8) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - skipSystemFonts を使い SVG 生成の worker プロセスを廃止

### Patch Changes

- Updated dependencies [[`587f842`](https://github.com/hirokisakabe/pom/commit/587f842b67223762378fe4c415cd91126d4b5e03)]:
  - @hirokisakabe/pom@8.1.0
