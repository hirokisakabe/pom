# @hirokisakabe/pom-editor

## 0.6.1

### Patch Changes

- [#986](https://github.com/hirokisakabe/pom/pull/986) [`9971cb2`](https://github.com/hirokisakabe/pom/commit/9971cb2fbb76f05f03a44181ac1a4525b5437a60) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Add package-owned documentation for the pom kit website information architecture.

- [#984](https://github.com/hirokisakabe/pom/pull/984) [`a0bc2bb`](https://github.com/hirokisakabe/pom/commit/a0bc2bbc2422248bc46afec3cb4cf53df22d50ea) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - AST ツリーの drop hit area、挿入先 feedback、drag overlay、auto-scroll を改善する。

- Updated dependencies [[`9971cb2`](https://github.com/hirokisakabe/pom/commit/9971cb2fbb76f05f03a44181ac1a4525b5437a60)]:
  - @hirokisakabe/pom@10.2.1

## 0.6.0

### Minor Changes

- [#980](https://github.com/hirokisakabe/pom/pull/980) [`bf25b9c`](https://github.com/hirokisakabe/pom/commit/bf25b9c813a040f2ab3470fe5a00171c6341f70b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - AST モードの diagnostic から XML の該当行へ移動できるようにし、行情報がない error と parse 不能状態にも案内を追加しました。

## 0.5.0

### Minor Changes

- [#973](https://github.com/hirokisakabe/pom/pull/973) [`586647d`](https://github.com/hirokisakabe/pom/commit/586647ddb62f9fa7baafceb2d002677094efb00f) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - XML / AST 編集、debounced preview、diagnostics、Refresh、optionalなDownload / Save操作をまとめた再利用可能な`PomEditor`コンポーネントを追加します。website playgroundも同コンポーネントへ移行し、既存の`PomAstEditor` APIは維持します。

## 0.4.6

### Patch Changes

- Updated dependencies [[`6bd917d`](https://github.com/hirokisakabe/pom/commit/6bd917d98833fd4a5e544c87c1c19a41fba36a9e), [`30e3cba`](https://github.com/hirokisakabe/pom/commit/30e3cbad973770c2f27d99cea18b14c2335d40c7), [`a41f08f`](https://github.com/hirokisakabe/pom/commit/a41f08f3ac87966ceec9fb58e69e15f0053e3f7f)]:
  - @hirokisakabe/pom@10.2.0

## 0.4.5

### Patch Changes

- Updated dependencies [[`ce6fe6d`](https://github.com/hirokisakabe/pom/commit/ce6fe6dd96f3c38d1aaa54ffa34d8095b8421680), [`78ee654`](https://github.com/hirokisakabe/pom/commit/78ee654d21504e61491053266eb6fe6ff8f91e16)]:
  - @hirokisakabe/pom@10.1.0

## 0.4.4

### Patch Changes

- Updated dependencies [[`e5abe7b`](https://github.com/hirokisakabe/pom/commit/e5abe7b7452f54a469d00b999978357c5001bbc7), [`3f28c15`](https://github.com/hirokisakabe/pom/commit/3f28c1515d601a4852f1b73e6a826a6fa8215ed7)]:
  - @hirokisakabe/pom@10.0.0

## 0.4.3

### Patch Changes

- Updated dependencies [[`72774d5`](https://github.com/hirokisakabe/pom/commit/72774d5ed91bedee03e59ef12ad1d4b146d66c88), [`a61d148`](https://github.com/hirokisakabe/pom/commit/a61d148b216a37f1f02892a2f1209accc88d995d)]:
  - @hirokisakabe/pom@9.1.2

## 0.4.2

### Patch Changes

- Updated dependencies [[`90622a7`](https://github.com/hirokisakabe/pom/commit/90622a7acdc9aa63c4483d283bb6d9c517d78323)]:
  - @hirokisakabe/pom@9.1.1

## 0.4.1

### Patch Changes

- Updated dependencies [[`f748519`](https://github.com/hirokisakabe/pom/commit/f74851911968de692df8e64f8d1de865f41f5207), [`2fa8c77`](https://github.com/hirokisakabe/pom/commit/2fa8c77d1ff9511e585f79fba8f2e6a990885998)]:
  - @hirokisakabe/pom@9.1.0

## 0.4.0

### Minor Changes

- [#924](https://github.com/hirokisakabe/pom/pull/924) [`d4b2b24`](https://github.com/hirokisakabe/pom/commit/d4b2b24119a02cb71077ccd17eb4a9457d2c71c0) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Node.js のサポート範囲を 22 以降に引き上げました。`@pptx-glimpse/document` 消費に備えて、pom 関連 package と VS Code extension の engines を Node 22 に揃えています。VS Code extension は Node.js 22 extension host を前提にするため、最小 VS Code バージョンも 1.101 に引き上げています。

### Patch Changes

- Updated dependencies [[`d4b2b24`](https://github.com/hirokisakabe/pom/commit/d4b2b24119a02cb71077ccd17eb4a9457d2c71c0)]:
  - @hirokisakabe/pom@9.0.0

## 0.3.1

### Patch Changes

- Updated dependencies [[`433193e`](https://github.com/hirokisakabe/pom/commit/433193e1e3d3ef6342e4ffbda1278ae706b08add), [`cc5aaa8`](https://github.com/hirokisakabe/pom/commit/cc5aaa86d60fbded6c9d0136bafdf7043a06a698)]:
  - @hirokisakabe/pom@8.9.0

## 0.3.0

### Minor Changes

- [#903](https://github.com/hirokisakabe/pom/pull/903) [`fb856b5`](https://github.com/hirokisakabe/pom/commit/fb856b559229eafea35d4abfe5fde86aaf86f92a) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `PomAstEditor` の DnD を拡張し、AST の nest 構造そのものを変更できるようにしました。これまで同じ親内のきょうだい並び替えしかできなかったところ、別の container (`VStack` / `HStack` / `Layer`) への移動、container 配下のノードの root への引き上げ、container 自体の入れ子化が可能になります。各行の前後の隙間 (gap) に drop すると **きょうだい**として挿入され、container 本体に drop すると **その container の末尾子要素**として nest される動作を UI 上でも区別できるようにしました (gap は青い挿入インジケータ、inside drop は container 本体の青ハイライト)。サイクルになる移動 (自分の子孫の中への drop) と container 以外への inside drop は構造上禁止しています。

  破壊的変更ではありませんが、内部依存だった `@dnd-kit/sortable` / `@dnd-kit/utilities` は不要になったため削除しています (公開 API は不変)。

### Patch Changes

- Updated dependencies [[`617de43`](https://github.com/hirokisakabe/pom/commit/617de431a17c99943d96de9cc8ad70f240138a8d), [`fea9dbb`](https://github.com/hirokisakabe/pom/commit/fea9dbb8270dc87105009bccb4febcef9f2854f2), [`3f01b2c`](https://github.com/hirokisakabe/pom/commit/3f01b2c00528fdae98aaf644ff59259742bee5d5)]:
  - @hirokisakabe/pom@8.8.0

## 0.2.7

### Patch Changes

- Updated dependencies [[`196ac27`](https://github.com/hirokisakabe/pom/commit/196ac27d3c8af47535092b90f59dcca8be03cf69), [`cd56388`](https://github.com/hirokisakabe/pom/commit/cd563889dfc83d1d05b7ae1d4ae0a7a933261be3)]:
  - @hirokisakabe/pom@8.7.0

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
