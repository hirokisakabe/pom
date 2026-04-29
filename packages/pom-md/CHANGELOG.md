# @hirokisakabe/pom-md

## 3.0.0

### Major Changes

- [#687](https://github.com/hirokisakabe/pom/pull/687) [`8d5ff85`](https://github.com/hirokisakabe/pom/commit/8d5ff853bc23828edf5453215e7a686ad3c5ddb6) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - 最上位 XML 要素を `<Slide>` で必須ラップする形式に変更（破壊的変更）。

  ## 変更内容
  - `parseXml` の最上位要素は `<Slide>` のみ許容。それ以外を直下に置くとエラー
  - 各 `<Slide>` が 1 つのスライドを表し、その子要素がスライドのルートとなる
  - `<Slide>` は属性なしの最小実装。子要素が複数ある場合は暗黙的に VStack でラップされる
  - pom-md の出力も `<Slide>` ラップ形式に統一

  ## 移行ガイド

  Before:

  ```xml
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Slide 1</Text>
  </VStack>
  <VStack w="100%" h="max" padding="48">
    <Text fontSize="32" bold="true">Slide 2</Text>
  </VStack>
  ```

  After:

  ```xml
  <Slide>
    <VStack w="100%" h="max" padding="48">
      <Text fontSize="32" bold="true">Slide 1</Text>
    </VStack>
  </Slide>
  <Slide>
    <VStack w="100%" h="max" padding="48">
      <Text fontSize="32" bold="true">Slide 2</Text>
    </VStack>
  </Slide>
  ```

  各スライドのコンテンツを `<Slide>...</Slide>` で囲んでください。属性は受け付けません（背景色や notes などの per-slide 属性は別 issue で順次対応予定）。

## 2.0.0

### Major Changes

- [#628](https://github.com/hirokisakabe/pom/pull/628) [`568b406`](https://github.com/hirokisakabe/pom/commit/568b40642737d305fbbad44c2354caf9940922e9) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Directive 対応（frontmatter 拡張 + コメント directive）

  ### Breaking Change
  - `parseMd()` の返り値を `string` から `{ xml: string; meta: ParseMdMeta }` に変更

  ### 新機能
  - frontmatter に `masterPptx` と `backgroundColor` を追加
  - コメント directive（`<!-- backgroundColor: value -->`）でスライド単位の背景色指定に対応

## 1.0.0

### Major Changes

- [#607](https://github.com/hirokisakabe/pom/pull/607) [`9f26a87`](https://github.com/hirokisakabe/pom/commit/9f26a8770deb18916d8855e0ea90ff7e593260db) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Table の子タグ名を HTML 風の短縮名に変更: `<TableColumn>` → `<Col>`, `<TableRow>` → `<Tr>`, `<TableCell>` → `<Td>`

## 0.4.0

### Minor Changes

- [#600](https://github.com/hirokisakabe/pom/pull/600) [`b79338b`](https://github.com/hirokisakabe/pom/commit/b79338be26be3f38982cf8fff6dd4655cd2ac85e) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - テーブル変換時にヘッダー行のスタイル（bold, backgroundColor）と cellBorder をデフォルト付与

## 0.3.0

### Minor Changes

- [#567](https://github.com/hirokisakabe/pom/pull/567) [`89b844d`](https://github.com/hirokisakabe/pom/commit/89b844df5802787adf7aa0a5c80e763cfc53aa03) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - リンク（ハイパーリンク）のサポートを追加
  - pom core: `<A href="...">` タグによるインラインハイパーリンクをサポート。TextRun に `href` プロパティを追加し、pptxgenjs の `hyperlink` 機能と連携
  - pom-md: Markdown のリンク記法 `[text](url)` を `<A href="...">` タグに変換

## 0.2.0

### Minor Changes

- [#560](https://github.com/hirokisakabe/pom/pull/560) [`9ed325f`](https://github.com/hirokisakabe/pom/commit/9ed325f6240b6a54926ab94c85a6cb99af7fd667) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Text, Li, TableCell ノード内で `<B>`/`<I>` タグによる部分的な太字・斜体をサポート。pom-md で Markdown の `**bold**` / `*italic*` が反映されるようになった。

## 0.1.1

### Patch Changes

- [#539](https://github.com/hirokisakabe/pom/pull/539) [`7a51188`](https://github.com/hirokisakabe/pom/commit/7a511883a976508b256ac5df769974b97fb1633b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - TypeScript を 6.0.2 に統一し、ルート package.json に巻き上げ
