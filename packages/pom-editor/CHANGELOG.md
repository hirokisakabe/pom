# @hirokisakabe/pom-editor

## 0.2.6

### Patch Changes

- [#870](https://github.com/hirokisakabe/pom/pull/870) [`bef8223`](https://github.com/hirokisakabe/pom/commit/bef822347739f1c75a8b9cf6f3671491613e593a) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - 許可されない DnD 操作（異なる親への移動）に視覚的フィードバックを追加。ドラッグ中、不正な drop target にカーソルが乗ったとき該当行を赤くハイライトし、カーソルを `not-allowed` に切り替えるようにした。これまで silent に却下されていた状態を解消し、「ここには落とせない」ことが UI から判別できる。

- Updated dependencies [[`6e3e2de`](https://github.com/hirokisakabe/pom/commit/6e3e2de686227b71d623ab0f23289436baf3aef6), [`64edc50`](https://github.com/hirokisakabe/pom/commit/64edc508fe323b603af34b5b663602ccc1468709)]:
  - @hirokisakabe/pom@8.6.0

## 0.2.5

### Patch Changes

- Updated dependencies [[`94b05be`](https://github.com/hirokisakabe/pom/commit/94b05be056eb7d1b4e910b58cb92edbbc28c185b)]:
  - @hirokisakabe/pom@8.5.1

## 0.2.4

### Patch Changes

- Updated dependencies [[`7977b7b`](https://github.com/hirokisakabe/pom/commit/7977b7b425f11e4c2bce2eb854e2c76177154f7b)]:
  - @hirokisakabe/pom@8.5.0

## 0.2.3

### Patch Changes

- Updated dependencies [[`7dae5eb`](https://github.com/hirokisakabe/pom/commit/7dae5eb25daee47e088363d72f9c1e6281917205), [`481cbeb`](https://github.com/hirokisakabe/pom/commit/481cbeba4a106464d2e6b206741459c9e8813a72), [`41bd4d7`](https://github.com/hirokisakabe/pom/commit/41bd4d761f1ec65110de866b3fe535882b122abe), [`d0c1bbb`](https://github.com/hirokisakabe/pom/commit/d0c1bbb39c849d35b7ca4f0069a62645d548c67a), [`924f2e9`](https://github.com/hirokisakabe/pom/commit/924f2e98c98dd73dcbd1b81e771b7674df1ca59d)]:
  - @hirokisakabe/pom@8.4.0

## 0.2.2

### Patch Changes

- Updated dependencies [[`cc7a6c4`](https://github.com/hirokisakabe/pom/commit/cc7a6c40c05ebe789b9782032206db7afbb3e13e), [`106bb60`](https://github.com/hirokisakabe/pom/commit/106bb60742d602ff2d784688587043f0c5aedf85), [`74edfb6`](https://github.com/hirokisakabe/pom/commit/74edfb662685a59fe20f89ab6de0d6412e6ccdf3)]:
  - @hirokisakabe/pom@8.3.0

## 0.2.1

### Patch Changes

- Updated dependencies [[`0fa2f65`](https://github.com/hirokisakabe/pom/commit/0fa2f658eb78c7d73c0bdb5aa56c5e635bcfea24)]:
  - @hirokisakabe/pom@8.2.1

## 0.2.0

### Minor Changes

- [#747](https://github.com/hirokisakabe/pom/pull/747) [`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `serializeXml`, `parseXml`, `POMNode` を `@hirokisakabe/pom` の公開 API に追加する。

  `@hirokisakabe/pom-editor` パッケージを新規追加する。pom XML の AST をツリー表示し、
  DnD でノードを並び替えると `onChange` で更新後の XML が返る `PomAstEditor` コンポーネントを提供する。

### Patch Changes

- Updated dependencies [[`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b)]:
  - @hirokisakabe/pom@8.2.0
