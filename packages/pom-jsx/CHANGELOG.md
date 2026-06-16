# @hirokisakabe/pom-jsx

## 0.6.0

### Minor Changes

- [#901](https://github.com/hirokisakabe/pom/pull/901) [`fea9dbb`](https://github.com/hirokisakabe/pom/commit/fea9dbb8270dc87105009bccb4febcef9f2854f2) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `<Shape>` および `<Icon>` ノードに `glow` / `outline` 属性を追加しました。Text の `glow` / `outline` ([#798](https://github.com/hirokisakabe/pom/issues/798)) と同じ書式 (`glow.size="8" glow.opacity="0.5" glow.color="..."` / `outline.size="2" outline.color="..."`) で指定でき、生成 PPTX 上では PowerPoint ネイティブの shape effect として描画されます (画像化されないため PowerPoint 上で編集可能)。Shape では新規 `outline` は既存 `line` 属性のエイリアスとして振る舞い、両方指定時は `outline` が `line.color` / `line.width` を上書きします (`line.dashType` は引き継ぎ)。Icon では `variant` 指定時の背景図形にのみ glow / outline が適用されます (PNG ベースのアイコン本体は対象外)。`pom-jsx` 側にも対応する `glow` / `outline` prop を追加しました。

- [#900](https://github.com/hirokisakabe/pom/pull/900) [`3f01b2c`](https://github.com/hirokisakabe/pom/commit/3f01b2c00528fdae98aaf644ff59259742bee5d5) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `<Text>` ノードに `textGradient` 属性を追加しました。`backgroundGradient` と同じ `linear-gradient(...)` 構文 (角度 + 2 色以上のカラーストップ) で文字自体をネイティブの PowerPoint グラデーション塗りにできます。`color` よりも優先され、`<Span>` / `<B>` などの inline run 単位の色も上書きして Text 全体に同じグラデーションが適用されます (run 単位の指定は今後の課題)。Theme トークン (`$tokenName`) 参照も `textGradient` 文字列内で解決されます。`pom-jsx` 側にも対応する `textGradient` prop を追加しました。

## 0.5.0

### Minor Changes

- [#892](https://github.com/hirokisakabe/pom/pull/892) [`196ac27`](https://github.com/hirokisakabe/pom/commit/196ac27d3c8af47535092b90f59dcca8be03cf69) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `Chart` ノードに `sparkline="true"` モードを追加。指定すると凡例 / 軸タイトル / 軸ラベル / 軸線 / グリッド線 / マージンをすべて非表示にし、プロット領域をチャート領域いっぱいに広げる。KPI タイルに inline 表示する小寸法 (例: `h=40`) の `bar` / `line` / `area` チャートでバーや線がつぶれずに見える sparkline 風表示が可能になる。pom-jsx の `ChartProps` にも `sparkline?: boolean` を追加。

- [#894](https://github.com/hirokisakabe/pom/pull/894) [`cd56388`](https://github.com/hirokisakabe/pom/commit/cd563889dfc83d1d05b7ae1d4ae0a7a933261be3) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - `<Span>` に `fontSize` 属性を追加。`<Text>` / `<Li>` / `<Td>` 内で 1 つの run だけ大きい / 小さいフォントサイズを混ぜられるようになる。KPI ダッシュボードで頻出する「大きい数字 + 小さい単位」(例: `¥84.2`+`M`、`118`+`%`) を、`HStack` + 2 Text の回避策なしで単一 Text 内で表現できる。親 Text の `bold` / `color` / `fontFamily` は継承され、Span 側で明示的に上書きしない限り維持される。レイアウト計測は最大 `fontSize` を採用するため、Text 枠は最大グリフに合わせて確保されクリッピングが起きない。`@hirokisakabe/pom-jsx` の `SpanProps` にも `fontSize?: number` を追加。

## 0.4.0

### Minor Changes

- [#869](https://github.com/hirokisakabe/pom/pull/869) [`64edc50`](https://github.com/hirokisakabe/pom/commit/64edc508fe323b603af34b5b663602ccc1468709) Thanks [@hirokisakabe](https://github.com/hirokisakabe)! - Text / Ul・Ol の Li / Shape / Table cell に `subscript` / `superscript` 属性を追加しました。インラインタグ `<Sub>` / `<Sup>` も追加し、`<Text>H<Sub>2</Sub>O</Text>` のように runs 単位で部分指定できます。`pom-jsx` でも対応する `subscript` / `superscript` props と `<Sub>` / `<Sup>` コンポーネントを追加しました。

## 0.3.0

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

## 0.2.0

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
