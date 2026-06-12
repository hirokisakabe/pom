# @hirokisakabe/pom

## 8.5.0

### Minor Changes

- [#842](https://github.com/hirokisakabe/pom/pull/842) [`7977b7b`](https://github.com/hirokisakabe/pom/commit/7977b7b425f11e4c2bce2eb854e2c76177154f7b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: はみ出し・重なりを build 時に静的検出する diagnostics を追加

  `buildPptx` がレイアウト計算後の絶対座標を検査し、レイアウト上の問題を警告として報告するようになりました（ビルドは止まりません。`strict: true` 時のみ `DiagnosticsError`）。
  - `NODE_OUT_OF_BOUNDS` — ノードの矩形がスライド境界からはみ出している場合に警告します。メッセージにはスライド番号・ノード（タグ / id / ルートからのパス）・はみ出し方向と量が含まれ、原因に最も近い最深ノードのみが報告されます。
  - `NODE_OVERLAP` — `VStack` / `HStack` 内の兄弟ノード同士の矩形交差を警告します。意図的な重なり（`Layer` 配下・`position="absolute"`・負 `margin` / `gap`・`zIndex` 明示）は検出対象外です。

  `rotate` 指定ノードと `Line` / `Arrow` は誤検知回避のため境界判定の対象外です。

## 8.4.0

### Minor Changes

- [#821](https://github.com/hirokisakabe/pom/pull/821) [`7dae5eb`](https://github.com/hirokisakabe/pom/commit/7dae5eb25daee47e088363d72f9c1e6281917205) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: テーマ機構を導入 — 複合ノードのテキスト色制御 + `<Theme>` デザイントークン参照

  **複合ノードのテキスト色制御**: 内部テキスト色が固定だった複合ノードに、既存の `textColor` と命名・挙動を揃えた色属性を追加しました（optional / `#` 任意 / 未指定時は従来色で後方互換）。
  - `Timeline`: `dateColor` / `titleColor` / `descriptionColor`
  - `Matrix`: `axisLabelColor` / `quadrantLabelColor` / `itemLabelColor` + `<MatrixItem textColor>`
  - `Tree`: `textColor` + `<TreeItem textColor>`
  - `Flow`: `connectorStyle.labelColor` + `<FlowConnection labelColor>`

  **デザイントークン参照**: トップレベル `<Theme>` 要素で配色トークンを 1 箇所宣言し、各ノードの色属性から `$name` で参照できるようになりました。参照は `parseXml` 時に解決され、未知トークンは "did you mean" つきの `ParseXmlError` になります。

  ```xml
  <Theme surface="0F172A" accent="38BDF8" textMain="F8FAFC" textMuted="94A3B8" />
  <Slide>
    <VStack w="100%" h="max" padding="48" backgroundColor="$surface">
      <Timeline dateColor="$textMuted" titleColor="$textMain" w="1000" h="120">
        <TimelineItem date="Q1" title="Phase 1" color="$accent" />
      </Timeline>
    </VStack>
  </Slide>
  ```

  これによりダーク背景でも `Timeline` 等の全テキストが視認できるようになり、パレットの hex 値を全ノードに繰り返し書く必要がなくなります。

- [#836](https://github.com/hirokisakabe/pom/pull/836) [`481cbeb`](https://github.com/hirokisakabe/pom/commit/481cbeba4a106464d2e6b206741459c9e8813a72) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: 辺ごとの border 指定 `borderTop` / `borderRight` / `borderBottom` / `borderLeft` を追加

  全ノード共通属性として、辺ごとに `color` / `width` / `dashType` を指定できる per-side border を追加しました。「左辺だけ太いアクセントバー付きのカード」「下線だけのセクション見出し」などをワークアラウンドなしで表現できます。
  - `borderLeft.color="1D4ED8" borderLeft.width="6"` のように dot 記法 / JSON shorthand の両方で指定可能
  - 既存の `border` (4 辺一律) と併用した場合、各辺はフィールド単位でマージされ辺ごとの指定が優先されます
  - `border` のみ指定した既存 XML の出力は変化しません (後方互換)
  - `borderRadius` との併用はサポート外です。併用時は diagnostics 警告 (`PER_SIDE_BORDER_WITH_RADIUS`) を発し、辺ごとの指定を無視して一律 `border` で描画します
  - pom-jsx の `BaseProps` にも同名の props を追加しました
  - pom-vscode の diagnostics 重大度マップに `PER_SIDE_BORDER_WITH_RADIUS` (Warning) を追加しました

- [#839](https://github.com/hirokisakabe/pom/pull/839) [`41bd4d7`](https://github.com/hirokisakabe/pom/commit/41bd4d761f1ec65110de866b3fe535882b122abe) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Text / Shape / Image / Icon に rotate 属性を追加

  `Text` / `Shape` / `Image` / `Icon` ノードで `rotate` 属性を指定できるようになりました。値は時計回りの度数で、PowerPoint への描画時に pptxgenjs の `rotate` option として渡されます。

  回転はレイアウト計算後の描画時にのみ適用されます。Yoga layout は非回転時のバウンディングボックスで計算するため、回転しても兄弟要素の配置や親サイズには影響しません。

  ```xml
  <Text rotate="12">Rotated label</Text>
  <Shape shapeType="rect" w="120" h="60" rotate="-15" />
  <Image src="sample_images/sample_0.png" w="160" h="100" rotate="8" />
  <Icon name="cpu" rotate="45" />
  ```

- [#837](https://github.com/hirokisakabe/pom/pull/837) [`d0c1bbb`](https://github.com/hirokisakabe/pom/commit/d0c1bbb39c849d35b7ca4f0069a62645d548c67a) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Text ノードに glow / outline 文字効果を追加

  `Text` ノードで `glow`（光彩）と `outline`（文字の輪郭線）を指定できるようになりました。背景画像の上に置くタイトル文字など、視認性と装飾性を両立したいケースで使えます。どちらも PowerPoint のネイティブ文字効果として出力されるため、生成後も PowerPoint 上で編集できます（画像化しません）。
  - `glow`: `size`（px、デフォルト 8）/ `opacity`（0–1、デフォルト 0.75）/ `color`（hex、デフォルト `FFFFFF`）
  - `outline`: `size`（px、デフォルト 1）/ `color`（hex、デフォルト `FFFFFF`）
  - ドット記法・JSON shorthand の両方に対応。インライン整形（`<B>` / `<Span>` など）併用時はノード単位の効果が全 run に適用されます。

  ```xml
  <Text fontSize="40" bold="true" color="FFFFFF" glow.size="8" glow.opacity="0.5" glow.color="1D4ED8">Glowing title</Text>
  <Text fontSize="40" bold="true" color="FFFFFF" outline.size="2" outline.color="0F172A">Outlined title</Text>
  ```

### Patch Changes

- [#840](https://github.com/hirokisakabe/pom/pull/840) [`924f2e9`](https://github.com/hirokisakabe/pom/commit/924f2e98c98dd73dcbd1b81e771b7674df1ca59d) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: XML child parsing / serialization ルールを registry 側の `xmlChildRule` として内部共通化

  parseXml に分散していた child element の受け入れルール（許容タグ・変換先 property）を registry の宣言的なデータ `xmlChildRule` として整理しました。インライン装飾タグ（B/I/A/U/S/Mark/Span）と `TextRun` の対応ルールは parseXml / serializeXml の双方から共有されます。公開 API・XML 構文・エラーメッセージに変更はありません。

## 8.3.0

### Minor Changes

- [#806](https://github.com/hirokisakabe/pom/pull/806) [`cc7a6c4`](https://github.com/hirokisakabe/pom/commit/cc7a6c40c05ebe789b9782032206db7afbb3e13e) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `grow` 属性で flex-grow 比率レイアウトを指定できるようになりました

  すべてのノードに `grow` 属性（正の数値）を指定でき、VStack / HStack 内の兄弟ノード間で余白が `grow` の比率どおりに配分されます（CSS の `flex-grow` 相当）。「左 2 : 右 1 の 2 カラム」のような比率レイアウトを `%` 計算なしで記述できます。

  既存の `w="max"` / `h="max"` は従来どおり `grow="1"` 相当として動作し、`grow` と同時指定された場合は `grow` が優先されます。

  ```xml
  <HStack w="max" h="max" gap="16">
    <VStack grow="2">…</VStack>
    <VStack grow="1">…</VStack>
  </HStack>
  ```

- [#805](https://github.com/hirokisakabe/pom/pull/805) [`106bb60`](https://github.com/hirokisakabe/pom/commit/106bb60742d602ff2d784688587043f0c5aedf85) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `backgroundGradient` 属性でリニアグラデーション背景を指定できるようになりました

  CSS 風の `linear-gradient()` 構文（角度または `to <方向>` キーワード + 2 色以上のカラーストップ）をすべてのノードの背景塗りとして指定できます。生成される PPTX には DrawingML ネイティブの `<a:gradFill>` として出力されるため、PowerPoint 上で編集可能です。ルートノードに指定した場合はスライド背景に適用されます。

  ```xml
  <VStack backgroundGradient="linear-gradient(135deg, #667EEA 0%, #764BA2 100%)">
    <Text color="FFFFFF">Hello</Text>
  </VStack>
  ```

- [#803](https://github.com/hirokisakabe/pom/pull/803) [`74edfb6`](https://github.com/hirokisakabe/pom/commit/74edfb662685a59fe20f89ab6de0d6412e6ccdf3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Text ノードと runs（`<Span>`）に letterSpacing 属性を追加。px で指定し、PPTX 出力時に pt（pptxgenjs の charSpacing）へ変換する。テキスト幅計測も字間を考慮するためレイアウトがはみ出さない。

## 8.2.1

### Patch Changes

- [#781](https://github.com/hirokisakabe/pom/pull/781) [`0fa2f65`](https://github.com/hirokisakabe/pom/commit/0fa2f658eb78c7d73c0bdb5aa56c5e635bcfea24) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: Matrix の Y 軸ラベルが CJK テキストで折り返される問題を修正

## 8.2.0

### Minor Changes

- [#747](https://github.com/hirokisakabe/pom/pull/747) [`c96f84a`](https://github.com/hirokisakabe/pom/commit/c96f84a6cb9808051cfa04adae54381a5dba9f2b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `serializeXml`, `parseXml`, `POMNode` を `@hirokisakabe/pom` の公開 API に追加する。

  `@hirokisakabe/pom-editor` パッケージを新規追加する。pom XML の AST をツリー表示し、
  DnD でノードを並び替えると `onChange` で更新後の XML が返る `PomAstEditor` コンポーネントを提供する。

## 8.1.0

### Minor Changes

- [#712](https://github.com/hirokisakabe/pom/pull/712) [`587f842`](https://github.com/hirokisakabe/pom/commit/587f842b67223762378fe4c415cd91126d4b5e03) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Add Arrow node: ID-based connector between nodes

  `<Arrow from="id" to="id" />` draws a straight-line connector between the center points of two nodes referenced by their `id` attribute. Supports `color`, `lineWidth`, `dashType`, `beginArrow`, and `endArrow` style attributes. Emits an `ARROW_REF_NOT_FOUND` diagnostic when a referenced ID is not found.

## 8.0.0

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

## 7.4.0

### Minor Changes

- [#678](https://github.com/hirokisakabe/pom/pull/678) [`63fc969`](https://github.com/hirokisakabe/pom/commit/63fc9699a04c2fdd8bb498c60a6a879486344d68) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Table セル / ProcessArrow / Pyramid / TextRun（`<Span>`）に `fontFamily` 属性を追加
  - `<Td fontFamily="...">` でセル単位のフォント指定が可能に
  - `<ProcessArrow fontFamily="...">` / `<Pyramid fontFamily="...">` でラベルフォントを切り替え可能に
  - `<Text>` / `<Li>` 内の `<Span fontFamily="...">` でインラインのフォント切り替えに対応（親 `fontFamily` を上書き）
  - 未指定時の挙動と既存ノードのデフォルト（`Noto Sans JP`）は変更なし

## 7.3.2

### Patch Changes

- [#675](https://github.com/hirokisakabe/pom/pull/675) [`26355ad`](https://github.com/hirokisakabe/pom/commit/26355add8f6a173a7e29c17f7d9956caddc64447) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: horizontal Timeline の両端アイテムでラベルがコンテナ外にはみ出す不具合を修正

  `renderHorizontalTimeline` で線端点を `labelW / 2` でインセットし、両端アイテムのラベル矩形が Timeline コンテナの矩形内に収まるようにした。あわせて `measureTimeline` の intrinsic width を `labelW + (itemCount - 1) * minItemSpacing` に補正し、scaleFactor の過大算出も解消している。

## 7.3.1

### Patch Changes

- [#666](https://github.com/hirokisakabe/pom/pull/666) [`a74a240`](https://github.com/hirokisakabe/pom/commit/a74a240a1744cf6f6784eb2cde3e23dad483e7e2) Thanks [@dependabot](https://github.com/apps/dependabot)! - fix: hide dynamic `require` in `renderIcon.ts` from bundler static analysis using `Function` constructor. Resolves Next.js 16 / Turbopack build failure (`Module not found: Can't resolve <dynamic>`) when consuming `@hirokisakabe/pom` in Next.js apps. Runtime behavior is unchanged.

## 7.3.0

### Minor Changes

- [#655](https://github.com/hirokisakabe/pom/pull/655) [`b10c367`](https://github.com/hirokisakabe/pom/commit/b10c3674ae25aa1220fdffb445554df5921f85ac) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Svg ノードを追加し、インラインSVGの発見可能性を向上
  - `<Svg>` ノードでインラインSVGを描画可能に（`width`, `height`, `color` 属性）
  - `Icon` ノードから `<svg>` 子要素によるインラインSVG機能を廃止（破壊的変更）
  - `Icon` ノードの `rasterizeSvgContent` を内部で共有し、実装の重複なし

## 7.2.0

### Minor Changes

- [#650](https://github.com/hirokisakabe/pom/pull/650) [`ed7a1c6`](https://github.com/hirokisakabe/pom/commit/ed7a1c6a03bd8c5cf86fd4e02e1ad2c06eb09231) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - padding 等のショートハンド属性とドット記法属性 (padding.top など) を同一ノードで混在指定できるようにした。ショートハンドが全方向のデフォルトとして展開され、ドット記法側のキーで個別上書きされる。

## 7.1.0

### Minor Changes

- [#618](https://github.com/hirokisakabe/pom/pull/618) [`ef2add9`](https://github.com/hirokisakabe/pom/commit/ef2add93e05825cbe0cc9b78d618314baaf6f2f7) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: `masterPptx` オプションで既存 PPTX ファイルの背景をスライドマスターに適用可能に

### Patch Changes

- [#614](https://github.com/hirokisakabe/pom/pull/614) [`db87b95`](https://github.com/hirokisakabe/pom/commit/db87b955e1f00ef512d6f195a6229dd1bba817de) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - docs: ドキュメント用ノード画像のサンプル XML を改善（センタリング・サイズ調整）

## 7.0.0

### Major Changes

- [#607](https://github.com/hirokisakabe/pom/pull/607) [`9f26a87`](https://github.com/hirokisakabe/pom/commit/9f26a8770deb18916d8855e0ea90ff7e593260db) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Table の子タグ名を HTML 風の短縮名に変更: `<TableColumn>` → `<Col>`, `<TableRow>` → `<Tr>`, `<TableCell>` → `<Td>`

## 6.4.0

### Minor Changes

- [#596](https://github.com/hirokisakabe/pom/pull/596) [`00ca36c`](https://github.com/hirokisakabe/pom/commit/00ca36c69bdcb796c99917bc2be6109671dfd503) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: テーブルのセルボーダー描画をサポート (`cellBorder` 属性)

## 6.3.0

### Minor Changes

- [#577](https://github.com/hirokisakabe/pom/pull/577) [`7575568`](https://github.com/hirokisakabe/pom/commit/75755684529c8bdc42d9103dc78acf7180bec7f5) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - インラインタグ `<U>`, `<S>`, `<Mark>` を追加（underline / strikethrough / highlight）

- [#581](https://github.com/hirokisakabe/pom/pull/581) [`547efa9`](https://github.com/hirokisakabe/pom/commit/547efa9f0357c8312142cb85213ba9cf318d196c) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: インラインテキスト色指定 `<Span color="...">` タグを追加

## 6.2.0

### Minor Changes

- [#567](https://github.com/hirokisakabe/pom/pull/567) [`89b844d`](https://github.com/hirokisakabe/pom/commit/89b844df5802787adf7aa0a5c80e763cfc53aa03) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - リンク（ハイパーリンク）のサポートを追加
  - pom core: `<A href="...">` タグによるインラインハイパーリンクをサポート。TextRun に `href` プロパティを追加し、pptxgenjs の `hyperlink` 機能と連携
  - pom-md: Markdown のリンク記法 `[text](url)` を `<A href="...">` タグに変換

## 6.1.0

### Minor Changes

- [#560](https://github.com/hirokisakabe/pom/pull/560) [`9ed325f`](https://github.com/hirokisakabe/pom/commit/9ed325f6240b6a54926ab94c85a6cb99af7fd667) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Text, Li, TableCell ノード内で `<B>`/`<I>` タグによる部分的な太字・斜体をサポート。pom-md で Markdown の `**bold**` / `*italic*` が反映されるようになった。

## 6.0.3

### Patch Changes

- [#542](https://github.com/hirokisakabe/pom/pull/542) [`4fd7496`](https://github.com/hirokisakabe/pom/commit/4fd7496b676389c5fdcac2e3e6376f598e91b6d2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: .prettierignore に dist/ を追加し、publish 時の fmt:check 失敗を修正

- [#540](https://github.com/hirokisakabe/pom/pull/540) [`e410c35`](https://github.com/hirokisakabe/pom/commit/e410c35aaa6567d4830f15b077177262ee536820) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: @resvg/resvg-js を @resvg/resvg-wasm に置き換え、pom-vscode でのネイティブバイナリ読み込みエラーを解消

## 6.0.2

### Patch Changes

- [#539](https://github.com/hirokisakabe/pom/pull/539) [`7a51188`](https://github.com/hirokisakabe/pom/commit/7a511883a976508b256ac5df769974b97fb1633b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - TypeScript を 6.0.2 に統一し、ルート package.json に巻き上げ

- [#530](https://github.com/hirokisakabe/pom/pull/530) [`947bb8c`](https://github.com/hirokisakabe/pom/commit/947bb8c07bf2aaa35189efedf05a0fd97bb79ff9) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - shadow プロパティを basePOMNodeSchema に移動し、全ノードタイプで共通利用可能にした

## 6.0.1

### Patch Changes

- [#504](https://github.com/hirokisakabe/pom/pull/504) [`7bb3e8d`](https://github.com/hirokisakabe/pom/commit/7bb3e8d16e2b75fe71a1ffd4d79925018d9091ae) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: image-size モジュールを静的 import に変更し esbuild バンドルに含まれるようにする

## 6.0.0

### Major Changes

- [#477](https://github.com/hirokisakabe/pom/pull/477) [`223d69b`](https://github.com/hirokisakabe/pom/commit/223d69b19f27b3656a2c4dd3197f0027908db206) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Box ノードを削除し VStack に統一。Box ノードと single-child カテゴリを廃止し、従来 Box を使用していた箇所は VStack で代替可能。

### Patch Changes

- [#478](https://github.com/hirokisakabe/pom/pull/478) [`848821e`](https://github.com/hirokisakabe/pom/commit/848821e0b1c362a9c3e94104b744f2a690d57628) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: TableColumn なしの Table で columns.reduce クラッシュを修正

## 5.6.0

### Minor Changes

- [#474](https://github.com/hirokisakabe/pom/pull/474) [`eeebd0b`](https://github.com/hirokisakabe/pom/commit/eeebd0bbf052aee2a5177988e10ddc100067fce2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: Icon ノードでインライン SVG をサポート

  `<Icon>` の子要素に `<svg>` を直接記述して、プリセットにないカスタムアイコンを描画できるようになりました。
  `size`, `color`, `variant`, `bgColor` などの既存属性もインライン SVG に適用されます。

## 5.5.1

### Patch Changes

- [#442](https://github.com/hirokisakabe/pom/pull/442) [`6b48337`](https://github.com/hirokisakabe/pom/commit/6b48337ed32b333136d068cd863e76d996911438) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Text/Ul/Ol のレイアウト計測時に fontFamily を反映し、描画フォントとの乖離を削減

- [#440](https://github.com/hirokisakabe/pom/pull/440) [`4e57f99`](https://github.com/hirokisakabe/pom/commit/4e57f997ffc158eed3ea07e533722748b9dba3ed) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: VStack の alignItems="center" 配下で HStack 子要素のテキスト幅が潰れる問題を修正

- [#447](https://github.com/hirokisakabe/pom/pull/447) [`121b542`](https://github.com/hirokisakabe/pom/commit/121b5427f7d13b0dd4ac605436960d80bc1bfc42) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Upgrade TypeScript from 5.9.3 to 6.0.2 and fix type errors

## 5.5.0

### Minor Changes

- [#425](https://github.com/hirokisakabe/pom/pull/425) [`8cfaccc`](https://github.com/hirokisakabe/pom/commit/8cfacccce068cb3c187f84adee83e14f51448a39) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Add structured diagnostics for warnings and fallbacks. `buildPptx()` now returns `{ pptx, diagnostics }` instead of just the pptx instance. A new `strict` option throws `DiagnosticsError` when diagnostics are collected.

### Patch Changes

- [#409](https://github.com/hirokisakabe/pom/pull/409) [`bcf609f`](https://github.com/hirokisakabe/pom/commit/bcf609f3705dd2e40310a8086cc0ccf6e5e774df) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - CI に size-limit を導入してパッケージサイズを監視

- [#428](https://github.com/hirokisakabe/pom/pull/428) [`6c11d11`](https://github.com/hirokisakabe/pom/commit/6c11d11fda489ea79562d8325e105495c47beafa) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Fix icon aspect ratio distortion when variant-less Icon node is stretched with padding

- [#426](https://github.com/hirokisakabe/pom/pull/426) [`ce5e266`](https://github.com/hirokisakabe/pom/commit/ce5e26619b41bc6592891f5c0c125e591b35d45b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Fix leaf node padding rendering to correctly offset content position and size by padding values

- [#411](https://github.com/hirokisakabe/pom/pull/411) [`74b47c9`](https://github.com/hirokisakabe/pom/commit/74b47c9150631a02ff1d6a5a6e7090597b259563) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Refactor layout runtime state to localize Yoga usage with YogaNodeMap

- [#419](https://github.com/hirokisakabe/pom/pull/419) [`8fcb2cc`](https://github.com/hirokisakabe/pom/commit/8fcb2ccf4e163219ca6170cf6db45f221b4974b1) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: inputSchema.ts を削除し、types.ts のスキーマを Single Source of Truth に統合

- [#420](https://github.com/hirokisakabe/pom/pull/420) [`0ccb643`](https://github.com/hirokisakabe/pom/commit/0ccb643d90f178d2bd90a205d39d8b093bf9f02a) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Fix icon stretching horizontally when placed inside HStack without explicit width

## 5.4.0

### Minor Changes

- [#386](https://github.com/hirokisakabe/pom/pull/386) [`30a7ce4`](https://github.com/hirokisakabe/pom/commit/30a7ce4c5ae004e1a0d332f3de2a066a521abe58) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - プリセットアイコンを Lucide v0.577.0 全 1,951 個に拡充

### Patch Changes

- [#382](https://github.com/hirokisakabe/pom/pull/382) [`c803885`](https://github.com/hirokisakabe/pom/commit/c803885c00f527cde725a40dde2019c86d48f405) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Add API reference documentation for `buildPptx()` options

## 5.3.0

### Minor Changes

- [#378](https://github.com/hirokisakabe/pom/pull/378) [`27ba994`](https://github.com/hirokisakabe/pom/commit/27ba99429ab0ab0a8b4ea368ac8d96a9b70926f1) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Icon ノードに variant / bgColor 属性を追加し、背景付きアイコンを1タグで描画可能に

## 5.2.1

### Patch Changes

- [#350](https://github.com/hirokisakabe/pom/pull/350) [`0551862`](https://github.com/hirokisakabe/pom/commit/05518625d786bae1c67f4bcede3a98d504294063) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - buildPptx 実行コンテキストを分離し、並列実行時のグローバル状態干渉を防止

- [#321](https://github.com/hirokisakabe/pom/pull/321) [`1b45e09`](https://github.com/hirokisakabe/pom/commit/1b45e0909eb5696aaa54fca9693b18f3f960bce7) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: NodeRegistry を導入し、ノード処理の分岐を集約

- [#346](https://github.com/hirokisakabe/pom/pull/346) [`5e430b3`](https://github.com/hirokisakabe/pom/commit/5e430b3944548b1060c7d07dc86e44474c6b4128) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - refactor: Yoga ノードのライフサイクルを明示化し解放を保証する

## 5.2.0

### Minor Changes

- [#312](https://github.com/hirokisakabe/pom/pull/312) [`2937014`](https://github.com/hirokisakabe/pom/commit/29370141b31913c52c3f406741ccd6503a9a2681) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Layout v2: margin, zIndex, position, alignSelf, flexWrap を追加

## 5.1.0

### Minor Changes

- [#302](https://github.com/hirokisakabe/pom/pull/302) [`26a913b`](https://github.com/hirokisakabe/pom/commit/26a913b7af177d65d427c2323c99c9aae565a718) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: スライド縦幅はみ出し時の自動調整機能を追加

  コンテンツがスライドの縦幅を超えた場合、段階的に調整してスライド内に収める機能を追加。
  調整はテーブル行高さ → フォントサイズ → gap/padding → 全体スケーリングの順で適用される。
  `autoFit: false` オプションで無効化可能。

- [#303](https://github.com/hirokisakabe/pom/pull/303) [`e3b6190`](https://github.com/hirokisakabe/pom/commit/e3b619072529cf6e068baf1337bcf466e2b466c2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - HStack/VStack の子要素に flexShrink=1 をデフォルト設定（CSS Flexbox と同じ挙動）。%サイズと gap を併用した場合に子要素がはみ出す問題を修正。

- [#301](https://github.com/hirokisakabe/pom/pull/301) [`dc70a07`](https://github.com/hirokisakabe/pom/commit/dc70a07d5ae20ca49fcdba5feefd2410a4d7c0c0) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - VStack / HStack で shadow 属性をサポート

### Patch Changes

- [#299](https://github.com/hirokisakabe/pom/pull/299) [`fb0b039`](https://github.com/hirokisakabe/pom/commit/fb0b039dca09c88bf7159939723c99efcd65db8c) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: endArrow/beginArrow のブーリアン簡易形式とドット記法の同時指定を許容

## 5.0.1

### Patch Changes

- [#293](https://github.com/hirokisakabe/pom/pull/293) [`103ce6e`](https://github.com/hirokisakabe/pom/commit/103ce6e43ebc1d455001a740a0e895822f06355d) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Icon の color 属性で `#` なし hex カラーを受け付けるように変更（`#` 付きに自動正規化）

## 5.0.0

### Major Changes

- [#289](https://github.com/hirokisakabe/pom/pull/289) [`6f55755`](https://github.com/hirokisakabe/pom/commit/6f55755aea3076d593a0096302127c4ed21085ba) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - プロパティ名をCSS-in-JS準拠にリネーム: fontPx→fontSize, alignText→textAlign, lineSpacingMultiple→lineHeight

### Minor Changes

- [#290](https://github.com/hirokisakabe/pom/pull/290) [`b2fc4ee`](https://github.com/hirokisakabe/pom/commit/b2fc4eeed3bc3a83fdd871ba5a63528fde335170) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - ネスト属性のドット記法サポートを追加（例: fill.color="1D4ED8"）。fill, border, shadow, line, backgroundImage, connectorStyle, arrow, endArrow, underline, padding が対象。

- [#284](https://github.com/hirokisakabe/pom/pull/284) [`5fed8a0`](https://github.com/hirokisakabe/pom/commit/5fed8a0e3e2cecda959cc91fe8cee4d37443fec4) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - アイコンプリセットライブラリ機能を追加。`<Icon name="cpu" size="32" color="#1D4ED8" />` のようにLucideアイコンを名前指定で挿入可能に。47個のビジネス向けアイコンをプリセット。

## 4.1.1

### Patch Changes

- [#275](https://github.com/hirokisakabe/pom/pull/275) [`4e863b0`](https://github.com/hirokisakabe/pom/commit/4e863b051f96601a4a9500f8c0723d00d8282de6) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Text ノードのスペースのみテキストコンテンツが消える問題を修正

## 4.1.0

### Minor Changes

- [#266](https://github.com/hirokisakabe/pom/pull/266) [`a5a2089`](https://github.com/hirokisakabe/pom/commit/a5a208914f9ff6366614b4c4ab63ba4767df0235) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - ProcessArrow のデザインを改善: custGeom によるカスタムジオメトリで矢印をより鋭利に、デフォルト高さを 60px → 80px に変更

## 4.0.0

### Major Changes

- [#261](https://github.com/hirokisakabe/pom/pull/261) [`e1e73ab`](https://github.com/hirokisakabe/pom/commit/e1e73ab75578776dda18bafbce256ae2aaf1a298) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - 複合ノードの子要素XMLタグ名をプレフィックス方式に統一

  **破壊的変更**: 以下のXMLタグ名が変更されました。既存のXMLを更新する必要があります。
  - `Step` → `ProcessArrowStep`
  - `Level` → `PyramidLevel`
  - `Axes` → `MatrixAxes`
  - `Quadrants` → `MatrixQuadrants`
  - `Connection` → `FlowConnection`
  - `Series` → `ChartSeries`
  - `DataPoint` → `ChartDataPoint`
  - `Column` → `TableColumn`
  - `Row` → `TableRow`
  - `Cell` → `TableCell`

  変更なし: `TimelineItem`, `TreeItem`, `MatrixItem`, `FlowNode`, `Li`

### Minor Changes

- [#252](https://github.com/hirokisakabe/pom/pull/252) [`9987b3c`](https://github.com/hirokisakabe/pom/commit/9987b3c0f5680c1cf377a2a4ebc85beecd2e20a3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: ピラミッド図を作成する PyramidNode を追加

- [#250](https://github.com/hirokisakabe/pom/pull/250) [`29a715f`](https://github.com/hirokisakabe/pom/commit/29a715fe0745bbb25d48172990e4440b8f1748b8) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - TableCellにcolspan/rowspanプロパティを追加し、セル結合を可能にした

### Patch Changes

- [#262](https://github.com/hirokisakabe/pom/pull/262) [`6de8e08`](https://github.com/hirokisakabe/pom/commit/6de8e08fa931eea206e66716838fd32f28dac283) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Ul/Ol の高さ計算をフォントメトリクスベースに修正し、バレットインデント分の幅を考慮するように改善

## 3.0.0

### Major Changes

- [#247](https://github.com/hirokisakabe/pom/pull/247) [`805fc92`](https://github.com/hirokisakabe/pom/commit/805fc92ea74bf048193c54af5242158e7be841cc) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Ul/Ol/Li ノードを追加し、Text.bullet を廃止
  - `<Ul>` + `<Li>` で箇条書きリスト、`<Ol>` + `<Li>` で番号付きリストを記述可能に
  - Li ごとに個別のテキストスタイル（bold, italic, color, fontPx 等）を指定可能
  - Ol は numberType（alphaLcPeriod 等）と numberStartAt をサポート
  - Text ノードの bullet 属性を削除（破壊的変更）

### Minor Changes

- [#239](https://github.com/hirokisakabe/pom/pull/239) [`db614e5`](https://github.com/hirokisakabe/pom/commit/db614e5da89df38d047d6964f0e60311baec166e) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - ShapeNodeのテキストスタイルプロパティを拡張（fontFamily, lineSpacingMultiple を追加）

- [#245](https://github.com/hirokisakabe/pom/pull/245) [`36adf73`](https://github.com/hirokisakabe/pom/commit/36adf732d762cc5ae3b66c589263ea42544b9fb1) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - コンポジットノード（Tree, ProcessArrow, Timeline, Matrix, Flow）の Scale to Fit 対応。親コンテナより大きい場合に等比縮小して描画されるようになった。

## 2.0.0

### Major Changes

- [#215](https://github.com/hirokisakabe/pom/pull/215) [`3e14f52`](https://github.com/hirokisakabe/pom/commit/3e14f52dad4930ee83db6774d9b78d3b60ff8974) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - コンポーネント機能を削除: defineComponent, expandComponents, expandComponentSlides, Theme, mergeTheme, ComponentRegistry を削除。parseXml で未知タグはエラーをスローするよう変更。

- [#218](https://github.com/hirokisakabe/pom/pull/218) [`3ea9400`](https://github.com/hirokisakabe/pom/commit/3ea94002e33f38df6b0a1fc54cf7e93b1862dd52) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - buildPptx APIの入力をPOMNode[]からXML文字列に変更。parseXml、inputPomNodeSchema、POMNode型を公開APIから削除し内部に降格。./schemaエクスポートパスを削除。

### Minor Changes

- [#225](https://github.com/hirokisakabe/pom/pull/225) [`d2953f8`](https://github.com/hirokisakabe/pom/commit/d2953f840e783f1858d4f94ef0a05d8ca48b7d2b) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - parseXmlのバリデーション・エラーメッセージを改善。未知の属性名検出（Did you mean?提案付き）、Zodスキーマによるセマンティックバリデーション（enum値、数値範囲、必須属性）、リーフノードへの不正な子要素検出、複数エラーの一括報告に対応。ParseXmlErrorクラスを新規exportし、プログラム的なエラーハンドリングが可能に。

- [#212](https://github.com/hirokisakabe/pom/pull/212) [`eb345fd`](https://github.com/hirokisakabe/pom/commit/eb345fd6888a8c630600b4f63535468078aea095) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: XML子要素記法のサポートを追加（Chart, Table, Flow, Tree, Timeline, Matrix, ProcessArrow）

### Patch Changes

- [#224](https://github.com/hirokisakabe/pom/pull/224) [`b5ab195`](https://github.com/hirokisakabe/pom/commit/b5ab195f7837f6529e44f41a203fd1fd6abe7ea3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - LLM 向けコンパクト XML リファレンス（docs/llm-xml-reference.md）を追加

- [#226](https://github.com/hirokisakabe/pom/pull/226) [`17d7810`](https://github.com/hirokisakabe/pom/commit/17d781003ee0f0026d121aa078e7aa7585f737cc) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - ドキュメント・サンプルを XML ベースに書き直し、llm-integration.md を XML リファレンスに一本化

## 1.4.0

### Minor Changes

- [#198](https://github.com/hirokisakabe/pom/pull/198) [`21e8464`](https://github.com/hirokisakabe/pom/commit/21e8464971ca61380f4925aec8d8a68b0651d822) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - XML形式での入力サポートを追加。`parseXml()` 関数でXML文字列をPOMNode配列に変換可能に。

## 1.3.0

### Minor Changes

- [#194](https://github.com/hirokisakabe/pom/pull/194) [`8d42f09`](https://github.com/hirokisakabe/pom/commit/8d42f09e4d8a80b485f1b1b70ae92ffd743063cb) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: スライドマスターおよび全ノードに背景画像（backgroundImage）をサポート

- [#192](https://github.com/hirokisakabe/pom/pull/192) [`16b4055`](https://github.com/hirokisakabe/pom/commit/16b4055d71b89760aa462415ad4eed652803e758) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Box, Image ノードに shadow（ドロップシャドウ）プロパティを追加

- [#191](https://github.com/hirokisakabe/pom/pull/191) [`5e321eb`](https://github.com/hirokisakabe/pom/commit/5e321eb00326752d56eecf4344c513ce34484be2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: 透過（opacity）をサポート

## 1.2.0

### Minor Changes

- [#183](https://github.com/hirokisakabe/pom/pull/183) [`55a2950`](https://github.com/hirokisakabe/pom/commit/55a295092e9519b501cc26ab3b81b817eb08d93a) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: 画像に sizing 機能（contain/cover/crop）を追加

- [#181](https://github.com/hirokisakabe/pom/pull/181) [`c6f4b37`](https://github.com/hirokisakabe/pom/commit/c6f4b3747d28bf955736d61a12f1e8c0fe9c2c71) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: テキストに italic、underline、strike、highlight プロパティを追加

  TextNode、TableCell、ShapeNode、ProcessArrowNode、MasterTextObject でテキストスタイルの装飾が可能に。

- [#185](https://github.com/hirokisakabe/pom/pull/185) [`75eb6a0`](https://github.com/hirokisakabe/pom/commit/75eb6a0356eb78f33bd9acfd505f48ff4cc66e97) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - feat: コンポーネント/テンプレート機構を追加（defineComponent, Theme, mergeTheme）

### Patch Changes

- [#184](https://github.com/hirokisakabe/pom/pull/184) [`dd1e0cd`](https://github.com/hirokisakabe/pom/commit/dd1e0cda340abf8ebfc1a76f67c0a4ce0824bfd5) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - fix: HStack内のテーブルで幅が正しく計算されない問題を修正

  HStackの子要素に対する均等分割（flexGrow: 1, flexBasis: 0）がテーブルノードにも適用されていた問題を修正。テーブルはsetMeasureFuncでカラム幅合計を返すため、均等分割の対象から除外。

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
