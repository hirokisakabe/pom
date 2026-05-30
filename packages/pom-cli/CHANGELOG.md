# @hirokisakabe/pom-cli

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
