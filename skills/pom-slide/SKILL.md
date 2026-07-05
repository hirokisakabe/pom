---
name: pom-slide
description: Generate pom presentation slides from natural language. Applies design principles (color palette, typography scale, spacing), honors a pom-theme.json brand theme when present, creates a pom XML file, performs a rendered self-review loop, and optionally launches a live preview with pom-cli.
license: MIT
allowed-tools: Write,Edit,Read,Bash
metadata:
  version: "1.3.1"
---

自然言語の指示から pom XML スライドを生成し、ファイルに保存する。デザイン原則（配色・タイポグラフィ・余白・アーキタイプ）に基づいて初版の質を高め、`/pom-theme` skill が生成したテーマファイル（`pom-theme.json`）があればブランド配色・フォントを適用する。レンダリング結果を自分で見て修正するセルフレビューを行ったうえで、pom-cli がインストール済みの場合はプレビューサーバーを起動する。

## 手順

### 1. 入力の解釈

ユーザーの指示からスライドの内容・枚数・テーマを把握する。

明示されていない場合のデフォルト:

- 枚数: 指示の内容量に適した枚数（3〜8 枚程度）
- ファイル名: `slides.pom.xml`

### 2. デザイン方針の決定

XML を書き始める前に、デッキ全体のデザイントークン（配色・タイポグラフィ・余白）を決める。場当たり的に色やサイズを選ばず、ここで決めた値だけを使ってデッキ全体を組む。

#### テーマファイルの確認

最初にカレントディレクトリ（またはユーザーが指定したディレクトリ）に `pom-theme.json` があるか確認する。あれば `Read` ツールで読み込み、以下のとおりデザイントークンとして採用する。`pom-theme.json` は `/pom-theme` skill が生成するテーマファイルで、ブランドに合わせた配色・フォントが定義されている。

- **トーン**: `tone` フィールドの値を採用する（下記「トーン」の選択をスキップ）
- **配色パレット**: `colors` の `base` / `surface` / `ink` / `muted` / `accent` を 5 ロールにそのまま使う（下記プリセットからの選択をスキップ）。`Chart` の `chartColors` には `colors.charts` を使う
- **フォント**: `typography.fontFamily` を本文の `fontFamily` に、`typography.headingFontFamily`（あれば）を見出しに使う
- **背景**: `slideMaster.background.color` があればスライド背景色として使う（通常は `colors.base` と同じ）

テーマで決まるのは配色・フォント・トーンのみ。タイポグラフィスケール・余白システム・アーキタイプは下記のとおり通常どおり適用する。ユーザーが指示で明示的に色やトーンを指定した場合は、その指定をテーマより優先する。`pom-theme.json` が無い場合は、以下のとおり自分でトーンと配色を決める。

#### トーン

内容と聞き手に合わせてトーンを 1 つ選び、配色とレイアウトの選択に一貫して反映する（例: 堅実なコーポレート / モダンなテック / ミニマル / ウォームなエディトリアル / エネルギッシュ）。生成のたびに同じ見た目へ収束させないこと。「白背景 + 既定の青 + 純黒テキスト」という、いかにも自動生成な見た目をそのまま使わない。

#### 配色パレット

デッキごとに以下の 6 ロールの色を決める。アクセントは accent と accent2 の 2 トーン併走で、使用面積はスライドの 1 割以下に抑える（見出し脇のバー、強調数字、アイコン、装飾アークなど）。`accent2` は `accent` と同じ色相をずらした、または明度を下げた近傍色を選ぶ。`linear-gradient(accent → accent2)` でグラデーション装飾に使うので、極端な反対色は避ける。

| ロール  | 役割                                                                                       |
| ------- | ------------------------------------------------------------------------------------------ |
| base    | スライド背景。真っ白 `FFFFFF` 固定にしない（オフホワイトやダークも検討する）               |
| surface | カード・パネルの背景                                                                       |
| ink     | 本文テキスト。純黒 `000000` は避ける                                                       |
| muted   | 補助テキスト・キャプション                                                                 |
| accent  | 強調 1 色。多用しない。アクセントバー / 強調数字 / アイコン                                |
| accent2 | accent と組み合わせる近傍色。`linear-gradient(accent → accent2)` で装飾バー / カード縁取り |

プリセット例（そのまま使ってよいが、テーマに合わせて調整する）:

| トーン                   | base     | surface  | ink      | muted    | accent   | accent2  |
| ------------------------ | -------- | -------- | -------- | -------- | -------- | -------- |
| コーポレート             | `F8F9FB` | `FFFFFF` | `1F2937` | `6B7280` | `1E3A8A` | `3B82F6` |
| ウォーム・エディトリアル | `FAF6F0` | `FFFFFF` | `292524` | `78716C` | `C2410C` | `F59E0B` |
| ダーク・テック           | `0F172A` | `1E293B` | `F1F5F9` | `94A3B8` | `38BDF8` | `A78BFA` |
| フレッシュ               | `F6FBF9` | `FFFFFF` | `1A2E2A` | `5F7470` | `0D9488` | `84CC16` |

`pom-theme.json` には `accent2` フィールドは無いので、デッキで accent2 を使うときは `<Theme>` で独自トークンとして宣言する。`<Theme>` の属性値は 6 桁 hex のみ（`$tokenName` は色属性での **参照側** でのみ展開されるので、`<Theme>` の宣言側には書けない）。`pom-theme.json` がある場合は `colors.accent` の実 hex を読み取り、accent2 はそれに近い色相 / 明度違いを **手動で 1 色選んで** `<Theme accent="0052CC" accent2="3B82F6" ... />` のように hex を直接書く。`colors.charts[1]` は反対色や任意の調和色のこともあり、そのまま accent2 に流用すると `linear-gradient` が暴れる（blue → green 等）ため自動転記しない。

**`linear-gradient(accent → accent2)` の代表的な使い所**:

- **表紙アクセントバー** — タイトル直下の細い帯を `Shape backgroundGradient="linear-gradient(90deg, $accent, $accent2)"` で塗る
- **セクション分割線** — `Shape shapeType="rect" h="3"` を横いっぱいに置き、同じグラデーションで塗る
- **カードボーダー** — カードの上端や左端だけ細 `Shape` を `Layer` で重ね、グラデーションで縁取る
- **装飾アーク** — `Layer` 内の `Shape shapeType="ellipse"` をスライド外にはみ出させ、グラデーションで塗って柔らかい背景装飾にする

#### タイポグラフィスケール

デッキ全体で以下の 5 段階だけを使う。中間サイズを場当たりで増やさず、1 枚のスライドに使うのは最大 3 段階まで。

| 段階    | fontSize         | 用途                     |
| ------- | ---------------- | ------------------------ |
| display | 44〜60, bold     | 表紙タイトル、KPI の数字 |
| title   | 28〜32, bold     | スライドタイトル         |
| heading | 18〜20, bold     | カード見出し・小見出し   |
| body    | 14〜16           | 本文・箇条書き           |
| caption | 11〜12, muted 色 | 補足・出典・ページ番号   |

- タイトルと本文のジャンプ率（サイズ差）をはっきりつける。中途半端な差（例: 24 と 20 の併用）は階層を曖昧にする
- bold は display / title / heading と強調語のみ。本文全体を bold にしない
- 本文の `lineHeight` は 1.4〜1.5

#### 余白システム

スペーシングは 8 の倍数だけを使う: `8 / 16 / 24 / 32 / 48 / 64`。

- スライド外周の padding は 48〜64 とし、全スライドで統一する
- 関係が近い要素ほど小さい gap、遠いほど大きい gap（例: 見出しと本文は 8〜16、セクション間は 32〜48）
- 余白は「余り」ではなく設計対象。埋めるために要素を足さない
- 1 スライド 1 メッセージ。箇条書きは 5 項目以内・1 項目 2 行以内とし、超えるなら 2 枚に分割する

#### スライドアーキタイプ

デッキは以下のアーキタイプの組み合わせで構成する。全スライドを同じレイアウトにせず、アーキタイプを切り替えてリズムを作る。

| アーキタイプ            | 構成                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------ |
| 表紙                    | display タイトル + サブタイトル + アクセントの細いバー。要素を絞り、余白を大胆に取る |
| アジェンダ              | accent 色の番号 + 項目名の縦リスト                                                   |
| セクション扉            | 章番号と章タイトルのみ。表紙と同系の構成にして本編スライドと区別する                 |
| キーメッセージ          | title + 本文 or 箇条書き。最も基本の 1 カラム                                        |
| 比較                    | 見出し付きカード 2〜3 枚を HStack で均等幅に並べる                                   |
| タイムライン / プロセス | `Timeline` / `ProcessArrow` ノードを使う                                             |
| データ                  | `Chart` / `Table` + そこから言えるインサイト 1 行（heading）                         |
| KPI                     | display サイズの数字 2〜4 個 + caption のラベル                                      |
| まとめ / CTA            | キーメッセージの再掲 + 次のアクション                                                |

**縦方向の揃え**: アクセントバー・番号・アイコンなど高さの異なる要素をテキストと HStack で並べるときは `alignItems="center"` を基本にする。`Text` のレイアウトボックスは `fontSize × lineHeight` の高さを持つが、グリフは行ボックス内で上下中央に描画されるため、`center` で揃えると隣接要素も視覚的にテキストの中央に揃う。文字の baseline と合わせたいときは `end` を使う。

代表例（パレット: コーポレート）。デッキの先頭に必ず `<Theme>` を置き、`$accent` / `$accent2` / `$base` ... をデッキ全体から参照する。色 hex を各ノードに散らさない:

```xml
<Theme base="F8F9FB" surface="FFFFFF" ink="1F2937" muted="6B7280" accent="1E3A8A" accent2="3B82F6" />

<!-- 表紙 -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" justifyContent="center" gap="24">
    <Shape shapeType="rect" w="56" h="6" backgroundGradient="linear-gradient(90deg, $accent, $accent2)" />
    <Text fontSize="52" bold="true" color="$ink">プレゼンタイトル</Text>
    <Text fontSize="16" color="$muted">サブタイトル — 2026-06-10 / 発表者名</Text>
  </VStack>
</Slide>

<!-- アジェンダ -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="32">
    <Text fontSize="32" bold="true" color="$ink">アジェンダ</Text>
    <VStack gap="16">
      <HStack gap="16" alignItems="center">
        <Text fontSize="20" bold="true" color="$accent">01.</Text>
        <Text fontSize="16" color="$ink">背景と課題</Text>
      </HStack>
      <HStack gap="16" alignItems="center">
        <Text fontSize="20" bold="true" color="$accent">02.</Text>
        <Text fontSize="16" color="$ink">提案内容</Text>
      </HStack>
    </VStack>
  </VStack>
</Slide>

<!-- 比較 -->
<Slide>
  <VStack w="100%" h="max" padding="48" backgroundColor="$base" gap="24" alignItems="stretch">
    <Text fontSize="28" bold="true" color="$ink">プラン比較</Text>
    <HStack gap="24" alignItems="stretch">
      <VStack w="50%" padding="24" backgroundColor="$surface" borderRadius="8" gap="16">
        <Text fontSize="18" bold="true" color="$accent">プラン A</Text>
        <Ul fontSize="14" color="$ink">
          <Li>特徴 1</Li>
          <Li>特徴 2</Li>
        </Ul>
      </VStack>
      <VStack w="50%" padding="24" backgroundColor="$surface" borderRadius="8" gap="16">
        <Text fontSize="18" bold="true" color="$accent">プラン B</Text>
        <Ul fontSize="14" color="$ink">
          <Li>特徴 1</Li>
          <Li>特徴 2</Li>
        </Ul>
      </VStack>
    </HStack>
  </VStack>
</Slide>

<!-- 本編スライド共通の見出し（アクセントバー + タイトル）。glyph は行ボックス内中央配置なので center が自然に揃う -->
<HStack gap="16" alignItems="center">
  <Shape shapeType="rect" w="6" h="32" fill.color="$accent" />
  <Text fontSize="32" bold="true" color="$ink">スライドタイトル</Text>
</HStack>
```

**`<Theme>` ヘッダから始めるメリット**: hex 値の散らばりを 1 箇所にまとめられるため、トーン変更がヘッダ書き換えだけで全スライドに波及する。AI 自身もデッキ後半で同じ色を再現する負担が消える。代表例のとおり、`backgroundColor` / `color` / `fill.color` / `backgroundGradient` 内の hex はすべて `$tokenName` 参照に置き換える。

#### 装飾要素の置き方（`Layer` を背景レイヤとして使う）

スライドの密度を上げず装飾度だけ上げたいときは、`Layer` を「コンテンツの背後に置く装飾だけのレイヤ」として使う。Slide 直下を `Layer` にし、その中で

1. **装飾要素を絶対座標で先に配置**（薄い色 / グラデーション / `Shape ellipse` のアーク / 細 `Shape rect` のバー）
2. **その上に通常の `VStack` をフルサイズで重ね、本文を組む**

…の 2 段構成にする。装飾はスライド外にはみ出してよく、四隅を「半分だけ」覗かせるのが視覚的に効く。

```xml
<Slide>
  <Layer w="1280" h="720">
    <!-- 装飾レイヤ: グラデーション円アーク + 細バー + コーナー装飾 -->
    <Shape shapeType="ellipse" x="-200" y="-200" w="520" h="520"
           backgroundGradient="linear-gradient(135deg, $accent, $accent2)" opacity="0.18" line.width="0" />
    <Shape shapeType="rect" x="980" y="540" w="320" h="200"
           backgroundGradient="linear-gradient(45deg, $accent2, $accent)" opacity="0.10" line.width="0" />
    <Shape shapeType="rect" x="64" y="56" w="56" h="4"
           backgroundGradient="linear-gradient(90deg, $accent, $accent2)" line.width="0" />

    <!-- コンテンツレイヤ: スライド全面に VStack を置く -->
    <VStack x="0" y="0" w="1280" h="720" padding="64" justifyContent="center" gap="24">
      <Text fontSize="11" bold="true" color="$accent" letterSpacing="2">SECTION 01 · OVERVIEW</Text>
      <Text fontSize="52" bold="true" color="$ink">プレゼンタイトル</Text>
      <Text fontSize="16" color="$muted">サブタイトル — 2026-06-10 / 発表者名</Text>
    </VStack>
  </Layer>
</Slide>
```

使い分けのコツ:

- **装飾アーク**: `Shape shapeType="ellipse"` をスライド外にはみ出させ `opacity="0.10〜0.25"` で塗る。`accent` のソフトな滲み代わりになる
- **グラデーションバー**: 細い `Shape rect` を `backgroundGradient="linear-gradient(90deg, $accent, $accent2)"` で塗る。表紙のアクセント帯 / セクション分割 / カード上端の縁取りに使える
- **コーナー装飾**: 右下や右上に小さい `Shape rect` / `Layer` 内の三角形を仕込むと、画面全体に「設計された感じ」が出る
- 装飾レイヤは `opacity` を低めに（`0.08〜0.20`）。文字に被っても可読性が落ちないことを優先する
- 装飾と本文の重なりは `Layer` の中なので NODE_OVERLAP は出ない。安心して被せてよい

#### ヘッダブロックを 5 スライド以上で再利用する

デッキ全体で視覚言語を揃えるには、本編スライドの上部に同じ構造の **共通ヘッダブロック**（`eyebrow` + `h1`）を置く。eyebrow は `SECTION 0X · TOPIC` のような letterSpacing 付きの小文字アクセント、h1 は title サイズの ink 色。eyebrow の番号と章タイトルだけスライドごとに差し替え、構造・サイズ・色・余白は同一にする。

```xml
<!-- 02 / 課題 -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="32" alignItems="stretch">
    <VStack gap="8">
      <Text fontSize="11" bold="true" color="$accent" letterSpacing="2">SECTION 02 · CHALLENGE</Text>
      <Text fontSize="32" bold="true" color="$ink">現状の 3 つの課題</Text>
    </VStack>
    <Ul fontSize="16" color="$ink" lineHeight="1.6">
      <Li>属人化したオペレーション</Li>
      <Li>データの分断</Li>
      <Li>意思決定の遅延</Li>
    </Ul>
  </VStack>
</Slide>

<!-- 03 / 提案 -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="32" alignItems="stretch">
    <VStack gap="8">
      <Text fontSize="11" bold="true" color="$accent" letterSpacing="2">SECTION 03 · PROPOSAL</Text>
      <Text fontSize="32" bold="true" color="$ink">統合プラットフォームの導入</Text>
    </VStack>
    <Text fontSize="16" color="$ink" lineHeight="1.6">3 つの課題に一括で対処する単一基盤を提案する。</Text>
  </VStack>
</Slide>

<!-- 04 / 体制、05 / 効果、06 / リスク — 同じヘッダ構造を使い回す -->
```

ヘッダ再利用のチェックポイント:

- eyebrow の `fontSize` / `letterSpacing` / `color` は 5 スライドで完全同一にする
- h1 の `fontSize` / `color` も同一。スライドごとに 28 / 32 を揺らさない
- VStack の `gap` (eyebrow と h1 の縦距離) と外周 `padding` も統一する
- eyebrow の文言は `SECTION 0X · {大文字 1 語}` か `0X · {章タイトル}` のどちらかに固定し、書き分けない
- 章番号（`01` `02` ...）は **A9 回避策** として常に `01.` や `#01` のように非数字を 1 文字混ぜる。LibreOffice 経由の fallback / legacy PNG 化では純数字の leading 0 が消える（"01" -> "1"）ことがあるため

#### 制約と回避（PPTX 原理限界）

CSS / HTML で出来ても PPTX 仕様にない表現がいくつかある。次のいずれも **代替表現で十分実用に耐える**ので、無理に再現しようとせず以下のレシピに置き換える:

| HTML / CSS でやりがちな表現                   | 不可な理由                                             | 代替レシピ                                                                                                                                                                                                                                   |
| --------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `backdrop-filter: blur(10px)` (ガラス調)      | PPTX に blur フィルタは無い                            | **半透明 surface + drop shadow** で擬似ガラスを作る。`VStack backgroundColor="$surface" opacity="0.7" border.color="FFFFFF" border.width="1" borderRadius="16" shadow.type="outer" shadow.blur="16" shadow.offset="4" shadow.color="0F172A"` |
| `box-shadow: 0 0 60px ...`（外側拡散グロー）  | pptxgenjs の shadow は内側 / 外側オフセット系          | **`shadow.type="outer"` + 大きい `blur`** で近似。`shadow.type="outer" shadow.blur="40" shadow.offset="0" shadow.color="$accent"`。HTML の柔らかい滲みとは違うが、装飾としては成立する                                                       |
| 任意 TTF をウェブから読み込む                 | PPTX は同梱フォントしか確実にレンダリングできない      | `pom-theme.json` の `typography.fontFamily` で **環境にあるシステムフォント**（`"Carlito"` / `"Noto Sans CJK JP"` / `"Noto Sans JP"` など）を指定する。デッキ単位で `<Theme>` を切り替えるのではなく `pom-theme.json` で固定する             |
| `background-clip: text`（文字グラデーション） | OOXML の text fill にグラデは取れるが pptxgenjs 未対応 | 文字自体は単色のまま、**直後に細グラデーションバー**を置く / **`glow` を `$accent` で軽くかける** ことで装飾感を出す                                                                                                                         |
| `radial-gradient` 背景                        | 現状 `backgroundGradient` は `linear-` のみ            | `Layer` 内に大きな `Shape shapeType="ellipse"` を `opacity="0.10〜0.25"` で重ねる（上述「装飾要素の置き方」参照）                                                                                                                            |
| `mask-image` / 任意 SVG マスク                | PPTX は shape geometry でのみ近似可能                  | 装飾を弱める方向で再設計するか、複雑なマスクは `Image` ノードで PNG 書き出しを使う                                                                                                                                                           |

これらは `pom-slide` で「無理に再現しようとして崩れる」より「最初から代替レシピで組む」方が結果が綺麗になる。

### 3. pom XML の生成

Step 2 で決めたデザイントークンとアーキタイプを全スライドに適用しつつ、以下のリファレンスに従って有効な pom XML を生成する。

---

<!-- BEGIN llm.txt -->
# pom XML Reference

A compact reference for the pom XML format, designed to be pasted into LLM prompts.

## Basics

- Slide size: `{ w: 1280, h: 720 }` (px)
- Colors: 6-digit hex (no `#` prefix) e.g. `FF0000`
- Attribute values are written as strings. Numbers and booleans are auto-converted
- Nested object attributes use dot notation (e.g. `fill.color="1D4ED8"`)
- For shorthand + dot-notation attributes (e.g. `padding` + `padding.top`), both can be mixed on the same node. Shorthand sets defaults; dot-notation keys override per side/property.

## Top-Level Structure

The top level of every pom XML document is one or more `<Slide>` elements, optionally preceded by a single `<Theme>` element (see "Theme (Design Tokens)"). Each `<Slide>` wraps the content of a single slide.

```xml
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24">
    <Text fontSize="32" bold="true">Slide 1</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24">
    <Text fontSize="32" bold="true">Slide 2</Text>
  </VStack>
</Slide>
```

- Top-level elements other than `<Slide>` and `<Theme>` are an error.
- A `<Slide>` must contain at least one child element.
- `<Slide>` does not currently take attributes; per-slide properties (background, notes, etc.) are tracked separately.

## Theme (Design Tokens)

Declare a color palette once at the top level and reference each token from any color attribute as `$tokenName`. This keeps the palette in one place instead of repeating hex values on every node.

```xml
<Theme surface="0F172A" accent="38BDF8" textMain="F8FAFC" textMuted="94A3B8" />
<Slide>
  <VStack w="100%" h="max" padding="48" gap="16" backgroundColor="$surface">
    <Text fontSize="28" color="$textMain" bold="true">Title</Text>
    <Timeline dateColor="$textMuted" titleColor="$textMain" w="1000" h="120">
      <TimelineItem date="Q1" title="Phase 1" color="$accent" />
    </Timeline>
  </VStack>
</Slide>
```

- Each `<Theme>` attribute declares a token: the attribute name is the token name (letters, digits, `_`, `-`; must start with a letter), the value is a 6-digit hex color (`#` prefix optional).
- At most one `<Theme>` per document; it applies to all slides regardless of position. Child elements are not allowed.
- `$tokenName` references are resolved in color attributes (attributes ending in `Color`/`Colors`, `color` keys in object/JSON attributes, `highlight`) and inside `backgroundGradient` / `textGradient` strings. Other attributes and text content are never substituted.
- Referencing an unknown token (or using `$token` without a `<Theme>`) is a validation error with a "did you mean" suggestion.

## Common Attributes (All Nodes)

| Attribute         | Type                                                       | Description                                |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `id`              | string                                                     | Unique identifier within the slide (used by `Arrow` connectors) |
| `w`               | number / `"max"` / `"50%"`                                 | Width                                      |
| `h`               | number / `"max"` / `"50%"`                                 | Height                                     |
| `grow`            | positive number                                            | Flex grow ratio among siblings (CSS `flex-grow`). `grow="2"` and `grow="1"` produce a 2:1 split. Along the parent's main axis `w="max"` / `h="max"` behave as `grow="1"`; when both are specified, `grow` takes precedence |
| `minW` `maxW`     | number                                                     | Min / max width                            |
| `minH` `maxH`     | number                                                     | Min / max height                           |
| `padding`         | number / `padding.top="8" padding.bottom="8"`              | Padding (shorthand + dot notation can be mixed) |
| `backgroundColor` | hex                                                        | Background color                           |
| `backgroundGradient` | `linear-gradient(135deg, #667EEA 0%, #764BA2 100%)` or `radial-gradient(circle at center, #1D4ED8 0%, #38BDF8 100%)` | Gradient background. **linear**: angle (`<n>deg` or `to right` etc., default `180deg`) + 2 or more stops. **radial**: optional `<shape>` (`circle` / `ellipse`, default `ellipse`) + optional `<size>` (`closest-side` / `closest-corner` / `farthest-side` / `farthest-corner`, default `farthest-corner`) + optional `at <position>` (`at center` / `at top right` / `at 25% 75%`, default `center`) + 2 or more stops. PowerPoint's radial fill does not visually distinguish `circle` / `ellipse` or the size keyword (only the center position affects output). Takes precedence over `backgroundColor`. On the slide root node it becomes the slide background |
| `backgroundImage` | `backgroundImage.src="url" backgroundImage.sizing="cover"` | Background image                           |
| `border`          | `border.color="333" border.width="1"`                      | Border (shorthand + dot notation can be mixed) |
| `borderTop` `borderRight` `borderBottom` `borderLeft` | `borderLeft.color="1D4ED8" borderLeft.width="6"` | Per-side border with the same fields as `border`. Overrides `border` for that side (field-by-field). Useful for accent bars / underlined headings. Cannot be combined with `borderRadius` (per-side values are ignored with a warning) |
| `borderRadius`    | number                                                     | Border radius (px)                         |
| `opacity`         | 0-1                                                        | Background opacity                         |
| `margin`          | number / `margin.top="8" margin.bottom="8"`                | Margin (shorthand + dot notation can be mixed) |
| `zIndex`          | number                                                     | Stacking order (higher = on top)           |
| `position`        | `relative` / `absolute`                                    | Positioning mode                           |
| `top`             | number                                                     | Top offset (when using position)           |
| `right`           | number                                                     | Right offset (when using position)         |
| `bottom`          | number                                                     | Bottom offset (when using position)        |
| `left`            | number                                                     | Left offset (when using position)          |
| `alignSelf`       | `auto` / `start` / `center` / `end` / `stretch`            | Override parent's alignItems for this node |
| `shadow`          | `shadow.type="outer" shadow.blur="4" shadow.offset="2" shadow.color="000"` | Drop shadow (shorthand + dot notation can be mixed; not supported on Line) |

## Leaf Rotation

`Text`, `Shape`, `Image`, and `Icon` support `rotate="<number>"` in degrees clockwise. Rotation is applied only during PowerPoint rendering; yoga layout still uses the unrotated bounding box, so sibling placement and parent size are unchanged.

## Layout Nodes

### VStack / HStack

Arranges children vertically (VStack) / horizontally (HStack).

```xml
<VStack gap="16" alignItems="stretch" justifyContent="start">
  <Text>A</Text>
  <Text>B</Text>
</VStack>
```

| Attribute        | Values                                                                      |
| ---------------- | --------------------------------------------------------------------------- |
| `gap`            | number (spacing between children)                                           |
| `alignItems`     | `start` / `center` / `end` / `stretch`                                      |
| `justifyContent` | `start` / `center` / `end` / `spaceBetween` / `spaceAround` / `spaceEvenly` |
| `flexWrap`       | `nowrap` / `wrap` / `wrapReverse`                                           |

> **Note:** Children of VStack / HStack default to `flexShrink=1` (same behavior as CSS Flexbox). Even when combining `%` widths with `gap`, children automatically shrink to fit within the parent.

> **Tip — empty container as transparent spacer:** An empty `<VStack />` / `<HStack />` renders nothing. Combined with `grow="1"`, it works like CSS `<div style="flex:1"></div>` to push siblings apart without a visible rectangle.
>
> ```xml
> <VStack h="300">
>   <Text>Top</Text>
>   <VStack grow="1" />
>   <Text>Bottom</Text>
> </VStack>
> ```

### Layer

Positions children using absolute coordinates. Children require `x` and `y`. Source order determines stacking.

```xml
<Layer w="600" h="400">
  <Shape shapeType="roundRect" x="50" y="50" w="120" h="80" fill.color="1D4ED8" text="A" color="FFFFFF" />
  <Line x1="170" y1="90" x2="300" y2="90" endArrow="true" />
</Layer>
```

## Content Nodes

### Text

```xml
<Text fontSize="24" bold="true" color="333333" textAlign="center">Title</Text>
```

| Attribute                                  | Type / Values                                              |
| ------------------------------------------ | ---------------------------------------------------------- |
| `fontSize`                                 | number (default: 24)                                       |
| `color`                                    | hex (text color)                                           |
| `textGradient`                             | `linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)` (native PPTX gradient text fill; overrides `color`; applies to all runs) |
| `textAlign`                                | `left` / `center` / `right`                                |
| `bold` `italic` `strike`                   | `true` / `false`                                           |
| `subscript` `superscript`                  | `true` / `false`                                           |
| `underline`                                | `true` / `underline.style="wavy" underline.color="FF0000"` |
| `highlight`                                | hex (highlight color)                                      |
| `fontFamily`                               | string (default: `Noto Sans JP`)                           |
| `lineHeight`                               | number (default: 1.3)                                      |
| `letterSpacing`                            | number in px (letter spacing, converted to pt on output)   |
| `glow`                                     | `glow.size="8" glow.opacity="0.5" glow.color="FF3399"`     |
| `outline`                                  | `outline.size="2" outline.color="0088CC"`                  |
| `rotate`                                   | number (degrees clockwise, render-only)                    |

Font size guide: Title 28-40 / Heading 18-24 / Body 13-16 / Caption 10-12

`textGradient` accepts the same syntax as `backgroundGradient` (angle in `<n>deg` or `to <direction>`, 2+ hex stops with optional `%` positions). Useful for cover-page titles, KPI numerals, and pull quotes. Exported as a native PowerPoint gradient text fill (editable, not rasterized).

```xml
<Text fontSize="64" bold="true" textGradient="linear-gradient(90deg, #38BDF8 0%, #A78BFA 100%)">Gradient title</Text>
```

**Text effects (glow / outline):** `glow` adds a glow around the characters (`size` in px, `opacity` 0-1, `color` hex; defaults: 8 / 0.75 / FFFFFF). `outline` draws a border along the character edges (`size` in px, `color` hex; defaults: 1 / FFFFFF). Both export as native PowerPoint text effects (editable, not rasterized) and are useful for keeping titles legible on top of background images. They apply per text node; with inline formatting the node-level effect applies to all runs.

Beyond titles, the same effects work well as **decorative accents**:

- **Oversized quotation marks** — make a large `"` or `「` glow in the accent color and place it behind a quote block (use `Layer` + absolute coordinates).
- **Headline numerals** — give big KPI digits a subtle accent glow so they pop above the rest of the slide without changing color.
- **Outlined display titles on photos** — pair `outline` with a low-opacity `glow` of the same dark color to keep light-on-photo titles legible.

```xml
<!-- Generic title effects -->
<Text fontSize="40" bold="true" color="FFFFFF" glow.size="8" glow.opacity="0.5" glow.color="1D4ED8">Glowing title</Text>
<Text fontSize="40" bold="true" color="FFFFFF" outline.size="2" outline.color="0F172A">Outlined title</Text>

<!-- Decorative oversized quotation mark behind a pull-quote -->
<Layer w="600" h="240">
  <Text x="0" y="-30" fontSize="180" bold="true" color="38BDF8" glow.size="16" glow.opacity="0.4" glow.color="38BDF8">"</Text>
  <Text x="80" y="80" w="500" fontSize="22" color="0F172A">真の差別化は機能ではなく、誰がどう使うかだ。</Text>
</Layer>

<!-- Highlighted KPI numeral -->
<Text fontSize="56" bold="true" color="1D4ED8" glow.size="6" glow.opacity="0.35" glow.color="1D4ED8">84.2</Text>
```

**Inline formatting:** Use `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Sub>`, `<Sup>`, `<Mark>`, and `<Span>` child elements for partial bold/italic/underline/strikethrough/subscript/superscript/highlight/color and hyperlinks:

```xml
<Text fontSize="16">Normal <B>bold</B> and <I>italic</I> text</Text>
<Text fontSize="16">Visit <A href="https://example.com">our site</A></Text>
<Text fontSize="16">Normal <U>underline</U> and <S>strikethrough</S> text</Text>
<Text fontSize="16">H<Sub>2</Sub>O and x<Sup>2</Sup> + y<Sup>2</Sup></Text>
<Text fontSize="16"><Mark color="FFFF00">highlighted</Mark> text</Text>
<Text fontSize="16">Normal <Span color="FF0000">red text</Span> normal</Text>
<Text fontSize="16" fontFamily="Noto Sans JP">Default <Span fontFamily="Arial">Arial part</Span> default</Text>
<Text fontSize="16">Normal <Span letterSpacing="6">spaced out</Span> normal</Text>
<Text fontSize="52" bold="true" color="1D4ED8">¥84.2<Span fontSize="20">M</Span></Text>
```

`<Span>` supports `color`, `fontFamily` (overrides the parent's `fontFamily` for that run), `fontSize` (overrides the font size for that run, e.g. KPI "big number + small unit" composition), and `letterSpacing` (adjusts letter spacing for that run; effective inside `<Text>` only).

`<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Sub>`, `<Sup>`, `<Mark>`, and `<Span>` also work inside `<Li>` and `<Td>`.

**Number + small unit (KPI numerals):** Use `<Span fontSize>` inside a single `<Text>` so the digit and unit share one baseline automatically. The parent's `bold` / `color` are inherited unless overridden on the Span.

```xml
<Text fontSize="56" bold="true" color="1D4ED8">¥84.2<Span fontSize="24">M</Span></Text>
<Text fontSize="56" bold="true" color="16A34A">118<Span fontSize="24">%</Span></Text>
<Text fontSize="56" bold="true" color="0F172A"><Span fontSize="24">$</Span>2,480</Text>
```

- Layout measurement uses the largest run `fontSize`, so the Text container is sized for the biggest glyph (no clipping).
- For leading symbols (`¥`, `$`), put the `<Span>` at the start.
- The previous HStack-based workaround (`alignItems="end"` + per-leaf `margin.bottom`) is no longer needed for this case.

### Ul (Bullet List)

```xml
<Ul fontSize="14" color="333333">
  <Li>Item A</Li>
  <Li>Item B</Li>
  <Li bold="true">Item C (individual style)</Li>
</Ul>
```

| Attribute                  | Type / Values                    |
| -------------------------- | -------------------------------- |
| `fontSize`                 | number (default: 24)             |
| `color`                    | hex (text color)                 |
| `textAlign`                | `left` / `center` / `right`      |
| `bold` `italic` `strike`   | `true` / `false`                 |
| `subscript` `superscript`  | `true` / `false`                 |
| `fontFamily`               | string (default: `Noto Sans JP`) |
| `lineHeight`               | number (default: 1.3)            |

Li attributes (override parent styles): `bold`, `italic`, `strike`, `subscript`, `superscript`, `underline`, `highlight`, `color`, `fontSize`, `fontFamily`

### Ol (Numbered List)

All Ul attributes plus:

```xml
<Ol fontSize="14" numberType="alphaLcPeriod" numberStartAt="3">
  <Li>Item A</Li>
  <Li>Item B</Li>
</Ol>
```

| Attribute       | Type / Values                                           |
| --------------- | ------------------------------------------------------- |
| `numberType`    | `alphaLcPeriod` / `alphaUcPeriod` / `arabicParenR` etc. |
| `numberStartAt` | number (start number, default: 1)                       |

### Image

```xml
<Image src="https://example.com/img.png" w="200" h="150" />
```

| Attribute | Type / Values                                                                                                            |
| --------- | ------------------------------------------------------------------------------------------------------------------------ |
| `src`     | string (URL / path / base64)                                                                                             |
| `sizing`  | `'{"type":"contain"}' ` / `'{"type":"cover"}'` / `'{"type":"crop","x":0,"y":0,"w":100,"h":100}'`                         |
| `rotate`  | number (degrees clockwise, render-only)                                                                                  |

### Icon

Displays an icon from the Lucide icon library (1,900+ icons available).

```xml
<Icon name="cpu" size="32" color="1D4ED8" />
<Icon name="cpu" variant="circle-filled" bgColor="E8F0FE" color="1D4ED8" />
```

| Attribute | Type / Values                                                            |
| --------- | ------------------------------------------------------------------------ |
| `name`    | Lucide icon name (required). See examples below                          |
| `size`    | number (default: 24, in px)                                              |
| `color`   | hex color (`#` prefix optional, default: `#000000`)                      |
| `rotate`  | number (degrees clockwise, render-only)                                |
| `variant` | `circle-filled`, `circle-outlined`, `square-filled`, `square-outlined`   |
| `bgColor` | hex color for background shape (`#` prefix optional, default: `#E0E0E0`) |
| `glow`    | `glow.size="8" glow.opacity="0.5" glow.color="FF3399"` — applied to the variant background shape (no-op without `variant`) |
| `outline` | `outline.size="2" outline.color="0088CC"` — applied to the variant background shape; overrides the variant default line |

**Icon effects (glow / outline):** Both apply only to the background shape produced by `variant`; they cannot adorn the PNG icon glyph itself (it is rasterized). Use the same defaults as Text glow / outline. Typical use is glowing badge dots and outlined chips paired with an icon glyph (`Icon name="star" size="16" variant="circle-filled" bgColor="3B82F6" glow.size="10" glow.color="3B82F6"`).

### Svg

Renders an inline SVG as a rasterized PNG image. Use this node for custom SVG graphics.

```xml
<Svg w="32" h="32" color="1D4ED8">
  <svg viewBox="0 0 24 24">
    <path d="M12 2L2 22h20z" fill="none" stroke-width="2"/>
  </svg>
</Svg>
```

| Attribute | Type / Values                                          |
| --------- | ------------------------------------------------------ |
| `w`       | number (default: 24, width in px)                      |
| `h`       | number (default: 24, height in px)                     |
| `color`   | hex color (`#` prefix optional)                        |

A `<svg>` child element is required. When `color` is specified, it sets `stroke` and `fill="none"` on the root `<svg>` element; explicit `stroke`/`fill` on child elements take precedence.

All Lucide v0.577.0 icons are available. Icon names use kebab-case. Common examples by category:

- **Technology**: `cpu`, `database`, `cloud`, `server`, `code`, `terminal`, `wifi`, `globe`, `monitor`, `smartphone`, `laptop`, `hard-drive`, `circuit-board`, `microchip`, `binary`, `braces`, `git-branch`, `github`, `container`
- **Business**: `briefcase`, `building`, `building-2`, `factory`, `landmark`, `wallet`, `credit-card`, `receipt`, `banknote`, `coins`, `piggy-bank`, `hand-coins`, `calculator`, `stamp`
- **Charts & Data**: `bar-chart`, `bar-chart-2`, `bar-chart-3`, `line-chart`, `pie-chart`, `trending-up`, `trending-down`, `activity`, `gauge`, `presentation`
- **Communication**: `mail`, `message-square`, `message-circle`, `phone`, `video`, `at-sign`, `send`, `inbox`, `megaphone`, `bell`, `rss`
- **People**: `user`, `users`, `contact`, `user-plus`, `user-check`, `user-x`, `person-standing`, `baby`, `accessibility`
- **Arrows & Navigation**: `arrow-right`, `arrow-left`, `arrow-up`, `arrow-down`, `chevron-right`, `chevron-left`, `chevron-up`, `chevron-down`, `move`, `corner-down-right`, `external-link`, `redo`, `undo`
- **Actions**: `search`, `settings`, `filter`, `download`, `upload`, `share`, `copy`, `scissors`, `trash`, `edit`, `plus`, `minus`, `refresh-cw`, `rotate-cw`, `save`, `log-in`, `log-out`, `power`
- **Status & Alerts**: `check`, `check-circle`, `x`, `x-circle`, `alert-triangle`, `alert-circle`, `info`, `help-circle`, `ban`, `thumbs-up`, `thumbs-down`
- **Security**: `shield`, `shield-check`, `lock`, `unlock`, `key`, `fingerprint`, `scan`, `eye`, `eye-off`
- **Files & Folders**: `file`, `file-text`, `file-code`, `file-spreadsheet`, `folder`, `folder-open`, `archive`, `paperclip`, `clipboard`
- **Media**: `image`, `camera`, `film`, `music`, `volume-2`, `mic`, `play`, `pause`, `skip-forward`, `skip-back`
- **Time**: `calendar`, `clock`, `timer`, `hourglass`, `alarm-clock`, `calendar-check`, `calendar-plus`
- **Shapes & Symbols**: `star`, `heart`, `zap`, `target`, `lightbulb`, `flag`, `bookmark`, `award`, `crown`, `gem`, `flame`, `snowflake`, `sun`, `moon`, `cloud-rain`
- **Layout & UI**: `layout`, `grid`, `list`, `table`, `columns`, `rows`, `sidebar`, `panel-left`, `panel-right`, `maximize`, `minimize`, `menu`
- **Maps & Travel**: `map`, `map-pin`, `compass`, `navigation`, `plane`, `car`, `truck`, `train`, `ship`, `bike`, `bus`
- **Health & Science**: `heart-pulse`, `thermometer`, `pill`, `syringe`, `microscope`, `dna`, `atom`, `flask-conical`, `beaker`
- **Food & Nature**: `apple`, `cherry`, `grape`, `leaf`, `trees`, `flower`, `sprout`, `mountain`, `waves`

For the full icon list, see https://lucide.dev/icons/ (use the icon name in kebab-case as the `name` attribute).

### Shape

```xml
<Shape shapeType="roundRect" w="200" h="60" text="Button" fontSize="16" fill.color="1D4ED8" color="FFFFFF" />
```

| Attribute       | Type / Values                                                                                             |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| `shapeType`     | Shape type (178 types total — see below)                                                                  |
| `text`          | string (text inside shape)                                                                                |
| `fill`          | `fill.color="hex" fill.transparency="0.5"`                                                                |
| `line`          | `line.color="hex" line.width="2" line.dashType="dash"`                                                    |
| `outline`       | `outline.size="2" outline.color="0088CC"` — Text-style alias for `line`; overrides `line.color`/`line.width` when both are set, `line.dashType` is preserved |
| `glow`          | `glow.size="8" glow.opacity="0.5" glow.color="FF3399"` — native shape glow (editable in PowerPoint, not rasterized) |
| `rotate`        | number (degrees clockwise, render-only)                                                                   |
| Text attributes | `fontSize` `color` `textAlign` `bold` `italic` `underline` `strike` `subscript` `superscript` `highlight` `fontFamily` `lineHeight` |

`fill`, `line`, and other style objects also allow mixing shorthand + dot notation on the same node (dot notation overrides specific keys).

**Shape effects (glow / outline):** `glow` adds a glow around the shape edge (`size` in px → converted to EMU, `opacity` 0-1, `color` hex; defaults: 8 / 0.75 / FFFFFF). `outline` is a Text-style alias for `line`; both produce native PowerPoint effects that stay editable. Typical use is glowing badge dots (`Shape shapeType="ellipse" w="20" h="20" fill.color="3B82F6" glow.size="12" glow.color="3B82F6"`), accent-glow KPI plates, and timeline markers. Do **not** wrap the shape with `Layer` purely to overlay a soft glow — `glow` on the shape itself is more compact and editable.

**Full shapeType list:**

Basic shapes:
`arc`, `bevel`, `blockArc`, `can`, `chord`, `corner`, `cube`, `decagon`, `diagStripe`, `diamond`, `dodecagon`, `donut`, `ellipse`, `folderCorner`, `frame`, `funnel`, `halfFrame`, `heptagon`, `hexagon`, `homePlate`, `nonIsoscelesTrapezoid`, `octagon`, `parallelogram`, `pentagon`, `pie`, `pieWedge`, `plaque`, `plus`, `rect`, `roundRect`, `rtTriangle`, `trapezoid`, `triangle`

Rounded / snipped rectangles:
`round1Rect`, `round2DiagRect`, `round2SameRect`, `snip1Rect`, `snip2DiagRect`, `snip2SameRect`, `snipRoundRect`

Arrows:
`bentArrow`, `bentUpArrow`, `chevron`, `circularArrow`, `curvedDownArrow`, `curvedLeftArrow`, `curvedRightArrow`, `curvedUpArrow`, `downArrow`, `leftArrow`, `leftCircularArrow`, `leftRightArrow`, `leftRightCircularArrow`, `leftRightUpArrow`, `leftUpArrow`, `notchedRightArrow`, `quadArrow`, `rightArrow`, `stripedRightArrow`, `swooshArrow`, `upArrow`, `upDownArrow`, `uturnArrow`

Arrow callouts:
`downArrowCallout`, `leftArrowCallout`, `leftRightArrowCallout`, `quadArrowCallout`, `rightArrowCallout`, `upArrowCallout`, `upDownArrowCallout`

Callouts:
`accentBorderCallout1`, `accentBorderCallout2`, `accentBorderCallout3`, `accentCallout1`, `accentCallout2`, `accentCallout3`, `borderCallout1`, `borderCallout2`, `borderCallout3`, `callout1`, `callout2`, `callout3`, `cloudCallout`, `wedgeEllipseCallout`, `wedgeRectCallout`, `wedgeRoundRectCallout`

Stars & banners:
`doubleWave`, `ellipseRibbon`, `ellipseRibbon2`, `horizontalScroll`, `irregularSeal1`, `irregularSeal2`, `leftRightRibbon`, `ribbon`, `ribbon2`, `star4`, `star5`, `star6`, `star7`, `star8`, `star10`, `star12`, `star16`, `star24`, `star32`, `verticalScroll`, `wave`

Flowchart:
`flowChartAlternateProcess`, `flowChartCollate`, `flowChartConnector`, `flowChartDecision`, `flowChartDelay`, `flowChartDisplay`, `flowChartDocument`, `flowChartExtract`, `flowChartInputOutput`, `flowChartInternalStorage`, `flowChartMagneticDisk`, `flowChartMagneticDrum`, `flowChartMagneticTape`, `flowChartManualInput`, `flowChartManualOperation`, `flowChartMerge`, `flowChartMultidocument`, `flowChartOfflineStorage`, `flowChartOffpageConnector`, `flowChartOnlineStorage`, `flowChartOr`, `flowChartPredefinedProcess`, `flowChartPreparation`, `flowChartProcess`, `flowChartPunchedCard`, `flowChartPunchedTape`, `flowChartSort`, `flowChartSummingJunction`, `flowChartTerminator`

Action buttons:
`actionButtonBackPrevious`, `actionButtonBeginning`, `actionButtonBlank`, `actionButtonDocument`, `actionButtonEnd`, `actionButtonForwardNext`, `actionButtonHelp`, `actionButtonHome`, `actionButtonInformation`, `actionButtonMovie`, `actionButtonReturn`, `actionButtonSound`

Brackets & braces:
`bracePair`, `bracketPair`, `leftBrace`, `leftBracket`, `rightBrace`, `rightBracket`

Math symbols:
`mathDivide`, `mathEqual`, `mathMinus`, `mathMultiply`, `mathNotEqual`, `mathPlus`

Others:
`chartPlus`, `chartStar`, `chartX`, `cloud`, `cornerTabs`, `gear6`, `gear9`, `heart`, `lightningBolt`, `line`, `lineInv`, `moon`, `noSmoking`, `plaqueTabs`, `smileyFace`, `squareTabs`, `sun`, `teardrop`

### Line

```xml
<Line x1="100" y1="100" x2="300" y2="100" color="333333" lineWidth="2" endArrow="true" />
```

| Attribute                 | Type / Values                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `x1` `y1` `x2` `y2`       | number (absolute coordinates, required)                                               |
| `color`                   | hex (default: `000000`)                                                               |
| `lineWidth`               | number (default: 1)                                                                   |
| `dashType`                | `solid` / `dash` / `dashDot` / `lgDash` / `sysDash` etc.                              |
| `beginArrow` / `endArrow` | `true` / `endArrow.type="triangle"` (types: none/arrow/triangle/diamond/oval/stealth) |

### Arrow

Connector between two nodes referenced by `id`. Draws a straight line between the center points of the referenced nodes. If a referenced ID is not found, a `ARROW_REF_NOT_FOUND` diagnostic is emitted.

```xml
<Layer w="1280" h="720">
  <Shape id="a" x="100" y="100" w="120" h="40" shapeType="rect">A</Shape>
  <Shape id="b" x="100" y="200" w="120" h="40" shapeType="rect">B</Shape>
  <Arrow x="0" y="0" from="a" to="b" endArrow="true" />
</Layer>
```

| Attribute                 | Type / Values                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `from`                    | string (id of source node, required)                                                  |
| `to`                      | string (id of destination node, required)                                             |
| `color`                   | hex (default: `000000`)                                                               |
| `lineWidth`               | number (default: 1)                                                                   |
| `dashType`                | `solid` / `dash` / `dashDot` / `lgDash` / `sysDash` etc.                              |
| `beginArrow` / `endArrow` | `true` / `endArrow.type="triangle"` (types: none/arrow/triangle/diamond/oval/stealth) |

## Data Visualization Nodes

### Table

```xml
<Table>
  <Col width="200" />
  <Col width="100" />
  <Tr>
    <Td bold="true" backgroundColor="DBEAFE">Name</Td>
    <Td bold="true" backgroundColor="DBEAFE">Score</Td>
  </Tr>
  <Tr>
    <Td>Alice</Td>
    <Td>95</Td>
  </Tr>
</Table>
```

- `<Table>`: `defaultRowHeight` (default 32), `cellBorder` (`{color, width, dashType}` — cell border style)
- `<Col>`: `width` (omit for equal distribution)
- `<Tr>`: `height` (omit to use `defaultRowHeight`, default 32)
- `<Td>`: text content + `fontSize` `color` `bold` `italic` `underline` `strike` `subscript` `superscript` `highlight` `fontFamily` `textAlign` `backgroundColor` `colspan` `rowspan`

### Chart

```xml
<Chart chartType="bar" w="500" h="300" showLegend="true" chartColors='["0088CC","00AA00"]'>
  <ChartSeries name="Sales">
    <ChartDataPoint label="Jan" value="100" />
    <ChartDataPoint label="Feb" value="150" />
  </ChartSeries>
</Chart>
```

| Attribute     | Type / Values                                                                                                |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `chartType`   | `bar` / `line` / `pie` / `area` / `doughnut` / `radar`                                                       |
| `showLegend`  | boolean                                                                                                      |
| `showTitle`   | boolean                                                                                                      |
| `title`       | string                                                                                                       |
| `chartColors` | JSON array `'["hex1","hex2"]'`                                                                               |
| `radarStyle`  | `standard` / `marker` / `filled` (radar only)                                                                |
| `sparkline`   | boolean — hides legend / axes / gridlines / margins for compact display (`bar` / `line` / `area`, e.g. h=40) |

**Sparkline example** (KPI tile に inline 表示する用途):

```xml
<Chart chartType="bar" w="200" h="40" sparkline="true" chartColors='["0088CC"]'>
  <ChartSeries name="Sales">
    <ChartDataPoint label="Q1" value="100" />
    <ChartDataPoint label="Q2" value="200" />
    <ChartDataPoint label="Q3" value="150" />
    <ChartDataPoint label="Q4" value="300" />
  </ChartSeries>
</Chart>
```

### Timeline

```xml
<Timeline direction="horizontal" w="1000" h="120">
  <TimelineItem date="Q1" title="Phase 1" description="Foundation" color="4CAF50" />
  <TimelineItem date="Q2" title="Phase 2" description="Development" color="2196F3" />
</Timeline>
```

| Attribute           | Values                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `direction`         | `horizontal` / `vertical`                                                                             |
| `dateColor`         | hex (date text color, default: `64748B`)                                                              |
| `titleColor`        | hex (title text color, default: `1E293B`)                                                             |
| `descriptionColor`  | hex (description text color, default: `64748B`)                                                       |
| `connectorColor`    | hex (axis line color, default: `E2E8F0`)                                                              |
| `connectorGradient` | `linear-gradient(<angle>deg, <color> <pos>%, ...)` — applies a linear gradient to the connector line  |
| `useColorForDate`   | `true` / `false` — when `true`, each item's `date` text uses that item's `color` (default: `false`)   |
| `fontFamily`        | font family name applied to all text (date / title / description). default: `Noto Sans JP`            |

`<TimelineItem>`: `date` (required) `title` (required) `description` `color` `dateColor`

- `dateColor` (per-item) overrides both `Timeline.dateColor` and `useColorForDate`.
- `fontFamily` changes the rendered font face only. Internal layout measurement still assumes the default label sizes (the bundled Noto Sans JP metrics), so very wide / very tall fonts may overflow within the same `w` / `h`. Pick a larger `w` / `h` if labels clip.

### Matrix

```xml
<Matrix w="600" h="500">
  <MatrixAxes x="Cost" y="Impact" />
  <MatrixQuadrants topLeft="Quick Wins" topRight="Strategic" bottomLeft="Low Priority" bottomRight="Avoid" />
  <MatrixItem label="Initiative A" x="0.2" y="0.8" color="4CAF50" />
  <MatrixItem label="Initiative B" x="0.7" y="0.6" />
</Matrix>
```

- Coordinates: (0,0) = bottom-left, (1,1) = top-right (mathematical coordinate system)
- `<Matrix>`: `axisLabelColor` (default `64748B`) `quadrantLabelColor` (default `94A3B8`) `itemLabelColor` (default `1E293B`) — text colors
- `<MatrixAxes>`: `x` `y` (axis labels, required)
- `<MatrixQuadrants>`: `topLeft` `topRight` `bottomLeft` `bottomRight`
- `<MatrixItem>`: `label` `x` `y` (required) `color` `textColor` (overrides `itemLabelColor`)

### Tree

```xml
<Tree layout="vertical" nodeShape="roundRect" w="600" h="400">
  <TreeItem label="CEO" color="1D4ED8">
    <TreeItem label="CTO" color="0EA5E9">
      <TreeItem label="Engineer A" />
    </TreeItem>
    <TreeItem label="CFO" color="16A34A" />
  </TreeItem>
</Tree>
```

| Attribute        | Type / Values                                         |
| ---------------- | ----------------------------------------------------- |
| `layout`         | `vertical` / `horizontal`                             |
| `nodeShape`      | `rect` / `roundRect` / `ellipse`                      |
| `textColor`      | hex (node label text color, default: `FFFFFF`)       |
| `nodeWidth`      | number (default: 120)                                 |
| `nodeHeight`     | number (default: 40)                                  |
| `levelGap`       | number (default: 60)                                  |
| `siblingGap`     | number (default: 20)                                  |
| `connectorStyle` | `connectorStyle.color="333" connectorStyle.width="2"` |

`<TreeItem>` can be recursively nested. Only one root allowed. Attributes: `label` (required) `color` `textColor` (overrides the Tree-level `textColor`)

### Flow

```xml
<Flow direction="horizontal" w="500" h="300">
  <FlowNode id="start" shape="flowChartTerminator" text="Start" color="4CAF50" />
  <FlowNode id="process" shape="flowChartProcess" text="Process" />
  <FlowNode id="decision" shape="flowChartDecision" text="OK?" color="FF9800" />
  <FlowNode id="end" shape="flowChartTerminator" text="End" color="E91E63" />
  <FlowConnection from="start" to="process" />
  <FlowConnection from="process" to="decision" />
  <FlowConnection from="decision" to="end" label="Yes" />
</Flow>
```

| Attribute        | Type / Values                                                                          |
| ---------------- | -------------------------------------------------------------------------------------- |
| `direction`      | `horizontal` / `vertical`                                                              |
| `nodeWidth`      | number (default: 120)                                                                  |
| `nodeHeight`     | number (default: 60)                                                                   |
| `nodeGap`        | number (default: 80)                                                                   |
| `connectorStyle` | `connectorStyle.color="hex" connectorStyle.width="2" connectorStyle.arrowType="arrow" connectorStyle.labelColor="hex"` |

`<FlowNode>` attributes:

| Attribute   | Type / Values                                                                                                                                                                                                                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`        | string (required) — Unique node identifier                                                                                                                                                                                                                                                        |
| `shape`     | `flowChartTerminator` / `flowChartProcess` / `flowChartDecision` / `flowChartInputOutput` / `flowChartDocument` / `flowChartPredefinedProcess` / `flowChartConnector` / `flowChartPreparation` / `flowChartManualInput` / `flowChartManualOperation` / `flowChartDelay` / `flowChartMagneticDisk` |
| `text`      | string (required) — Display text                                                                                                                                                                                                                                                                  |
| `color`     | hex color (e.g. `"4CAF50"`) — Node fill color                                                                                                                                                                                                                                                     |
| `textColor` | hex color (e.g. `"FFFFFF"`) — Text color                                                                                                                                                                                                                                                          |
| `width`     | number — Individual node width (overrides `nodeWidth`)                                                                                                                                                                                                                                            |
| `height`    | number — Individual node height (overrides `nodeHeight`)                                                                                                                                                                                                                                          |

`<FlowConnection>`: `from` `to` (required) `label` `color` `labelColor` (label text color; overrides `connectorStyle.labelColor`, default: `64748B`)

### ProcessArrow

```xml
<ProcessArrow direction="horizontal" w="1000" h="80">
  <ProcessArrowStep label="Plan" color="4472C4" />
  <ProcessArrowStep label="Design" color="5B9BD5" />
  <ProcessArrowStep label="Develop" color="70AD47" />
  <ProcessArrowStep label="Release" color="ED7D31" />
</ProcessArrow>
```

| Attribute                | Type / Values                                              |
| ------------------------ | ---------------------------------------------------------- |
| `direction`              | `horizontal` / `vertical`                                  |
| `itemWidth`              | number (default: 150)                                      |
| `itemHeight`             | number (default: 80)                                       |
| `gap`                    | number (default: -(itemHeight×0.35), negative for overlap) |
| `fontSize`               | number (default: 14)                                       |
| `bold` `italic` `strike` | boolean                                                    |
| `underline`              | `true` / `underline.style="wavy" underline.color="FF0000"` |
| `highlight`              | hex (highlight color)                                      |
| `fontFamily`             | string (default: `Noto Sans JP`)                           |

`<ProcessArrowStep>`: `label` (required) `color` (default: `4472C4`) `textColor` (default: `FFFFFF`)

### Pyramid

```xml
<Pyramid direction="up" w="600" h="300">
  <PyramidLevel label="Strategy" color="E91E63" />
  <PyramidLevel label="Tactics" color="9C27B0" />
  <PyramidLevel label="Execution" color="673AB7" />
</Pyramid>
```

| Attribute    | Type / Values                    |
| ------------ | -------------------------------- |
| `direction`  | `up` (default) / `down`          |
| `fontSize`   | number (default: 14)             |
| `bold`       | boolean                          |
| `fontFamily` | string (default: `Noto Sans JP`) |

`<PyramidLevel>`: `label` (required) `color` (default: `4472C4`) `textColor` (default: `FFFFFF`)

- `direction="up"`: First PyramidLevel is the apex (narrowest), last is the base (widest)
- `direction="down"`: First PyramidLevel is the top (widest), last is the bottom (narrowest)

## Child Element Tag Reference

| Parent Node      | Child Tags                                          | Mapped Property              |
| ---------------- | --------------------------------------------------- | ---------------------------- |
| `<Chart>`        | `<ChartSeries>` > `<ChartDataPoint>`                | `data`                       |
| `<Table>`        | `<Col>`, `<Tr>` > `<Td>`       | `columns`, `rows`            |
| `<Text>`         | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Sub>`, `<Sup>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
| `<Li>`           | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Sub>`, `<Sup>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
| `<Td>`    | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Sub>`, `<Sup>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
| `<Timeline>`     | `<TimelineItem>`                                    | `items`                      |
| `<Matrix>`       | `<MatrixAxes>`, `<MatrixQuadrants>`, `<MatrixItem>` | `axes`, `quadrants`, `items` |
| `<Tree>`         | `<TreeItem>` (recursive)                            | `data`                       |
| `<Flow>`         | `<FlowNode>`, `<FlowConnection>`                    | `nodes`, `connections`       |
| `<ProcessArrow>` | `<ProcessArrowStep>`                                | `steps`                      |
| `<Pyramid>`      | `<PyramidLevel>`                                    | `levels`                     |

When the same property is specified via both attributes (JSON string) and child elements, child elements take precedence.

## Slide Patterns

### Basic Structure

```xml
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" alignItems="stretch">
    <Text fontSize="32" bold="true">Title</Text>
    <Text fontSize="14">Body text</Text>
  </VStack>
</Slide>
```

### Two-Column Layout

```xml
<Slide>
  <VStack w="100%" h="max" padding="48" gap="24" alignItems="stretch">
    <Text fontSize="28" bold="true">Title</Text>
    <HStack gap="24" alignItems="start">
      <Text w="50%" padding="20" backgroundColor="FFFFFF" borderRadius="8" fontSize="14">Left column</Text>
      <Text w="50%" padding="20" backgroundColor="FFFFFF" borderRadius="8" fontSize="14">Right column</Text>
    </HStack>
  </VStack>
</Slide>
```

### KPI Tile with Dot Indicator (color-coded category)

A per-side border (`borderTop` etc.) cannot be combined with `borderRadius`. To color-code a rounded KPI tile by category, replace the top-edge accent bar with a small filled circle (`Shape shapeType="ellipse"`) placed next to a short uppercase label. The result is just as recognizable and works with `borderRadius`.

```xml
<HStack gap="20" alignItems="stretch">
  <VStack grow="1" padding="20" backgroundColor="FFFFFF" borderRadius="16" border.color="E2E8F0" border.width="1" gap="12">
    <HStack gap="8" alignItems="center">
      <Shape shapeType="ellipse" w="8" h="8" fill.color="1D4ED8" line.width="0" />
      <Text fontSize="11" bold="true" color="1D4ED8" letterSpacing="1">MRR</Text>
    </HStack>
    <HStack alignItems="end" gap="4">
      <Text fontSize="44" bold="true" color="0F172A" lineHeight="1">84.2</Text>
      <Text fontSize="18" bold="true" color="0F172A" lineHeight="1" margin.bottom="4">M</Text>
    </HStack>
    <Text fontSize="11" color="64748B">QoQ +4.1%</Text>
  </VStack>
  <VStack grow="1" padding="20" backgroundColor="FFFFFF" borderRadius="16" border.color="E2E8F0" border.width="1" gap="12">
    <HStack gap="8" alignItems="center">
      <Shape shapeType="ellipse" w="8" h="8" fill.color="16A34A" line.width="0" />
      <Text fontSize="11" bold="true" color="16A34A" letterSpacing="1">NRR</Text>
    </HStack>
    <HStack alignItems="end" gap="4">
      <Text fontSize="44" bold="true" color="0F172A" lineHeight="1">118</Text>
      <Text fontSize="18" bold="true" color="0F172A" lineHeight="1" margin.bottom="4">%</Text>
    </HStack>
    <Text fontSize="11" color="64748B">QoQ +2.0pt</Text>
  </VStack>
</HStack>
```

- The colored dot + matching uppercase label carries the category color without needing a top-edge stripe.
- Keep the dot small (6–10 px) so it reads as a category indicator, not a bullet.
- For a more prominent variant, thicken the dot to a short horizontal bar (`Shape shapeType="roundRect" w="24" h="3"` filled with the category color). To make the dot pop on dark backgrounds, attach a small `glow` to the `Shape` itself (`glow.size="10" glow.opacity="0.7" glow.color="<category color>"`) — it stays editable in PowerPoint as a native shape effect.

## Notes

- Colors do not need `#` prefix (`FF0000`)
- `alignItems` / `justifyContent` use `start` / `end` (not `left` / `right`)
- Property names are `w` / `h` (not `width` / `height`)
- Children of `Layer` require `x` and `y`
- `Tree` must have exactly one root `<TreeItem>`
- For decorative agenda / section numbering, prefer `01.` or `#01` instead of pure numeric `01`.
  LibreOffice-based fallback PNG conversion can drop leading zeros from pure numeric text, while the PPTX itself remains correct in PowerPoint.

## Build Diagnostics

Building emits warnings (`diagnostics`) for layout problems that can be detected from the computed coordinates — fix the XML when these appear:

- `NODE_OUT_OF_BOUNDS` — a node's rectangle extends beyond the slide bounds. The message identifies the slide, the node (tag / `id` / path), and the overflowing edges. Shrink or move the node, reduce content, or split the slide. Nodes with `rotate` and `Line` / `Arrow` are not checked (their final bounds cannot be derived statically), so verify those visually.
- `NODE_OVERLAP` — siblings inside `VStack` / `HStack` overlap unintentionally (e.g. via `top` / `left` offsets). Intentional overlaps are NOT reported: children of `Layer`, `position="absolute"` nodes, negative `margin` / `gap` (e.g. `ProcessArrow`'s default negative gap), and nodes with an explicit `zIndex`. To keep a deliberate overlap, express it with one of those mechanisms.
<!-- END llm.txt -->

---

### 4. ファイルへの保存

`Write` ツールを使い、生成した XML をファイルに書き出す。

- デフォルトのファイル名: `slides.pom.xml`
- ユーザーが別のファイル名を指定した場合はそれに従う

### 5. セルフレビュー（レンダリング → 自己批評 → 修正）

保存した XML をレンダリングして画像として確認し、デザイン上の問題を修正するループ。スライド外へのはみ出しと要素同士の重なりは build 時の警告（`NODE_OUT_OF_BOUNDS` / `NODE_OVERLAP`）として機械的に検出されるため、画像批評は警告では拾えない項目（階層・余白バランス・密度など）に集中する。

#### レンダリング手段の確認

`pom`（pom-cli）があれば `pom render` で各スライドを直接 PNG 化できる（LibreOffice 等の外部ツールは不要）。`pom` が無い場合はこのステップをスキップし、完了報告で「レンダリング確認は未実施」と伝える。

#### ループ手順

1. **レンダリング**: `pom render <保存したファイル名> -o /tmp/pom-review` で全スライドの PNG（`slide-01.png` 形式）を出力する。2 周目以降は `--slides 2,5` のように修正したスライドだけを再レンダリングしてよい
2. **ビルド警告の対応**: `pom render` / `pom build` は、はみ出し・重なりがあると `[NODE_OUT_OF_BOUNDS]` / `[NODE_OVERLAP]` の警告メッセージとともに失敗する。メッセージにはスライド番号・ノード（タグ / id / ルートからのパス）・はみ出し方向が含まれるので、該当ノードを修正して 1 に戻る。意図的な重なりは `Layer` / `zIndex` / 負 margin のいずれかで表現すれば警告されない
3. **批評**: 各 PNG を `Read` ツールで読み、下のチェックリストで全スライドを評価する
4. **修正**: 問題があれば XML を修正して 1 に戻る

#### fallback: soffice チェーン（render 未対応の古い pom-cli 用）

`pom render` がエラーになる場合（render サブコマンド導入前の pom-cli）のみ、以下で代替する。LibreOffice（`soffice`）と、`pdftoppm`（poppler）または ImageMagick が必要。どちらも無い場合はセルフレビューをスキップし、完了報告でその旨を伝える。

1. **ビルド**: `pom build <保存したファイル名> -o /tmp/pom-review/slides.pptx`
2. **PDF 化**: `soffice --headless --convert-to pdf --outdir /tmp/pom-review /tmp/pom-review/slides.pptx`
3. **PNG 化**: `pdftoppm -png -r 96 /tmp/pom-review/slides.pdf /tmp/pom-review/slide`（ImageMagick の場合は `magick -density 96 /tmp/pom-review/slides.pdf /tmp/pom-review/slide-%02d.png`）

#### 批評チェックリスト

- **はみ出し・重なり**: スライド外へのはみ出しと要素同士の重なりは build 時の警告で検出済みの前提。画像では警告に出ない残り（テキストの見切れ、`rotate` したノードや `Layer` 内の意図しない衝突）だけを確認する（見つけたら最優先で修正する）
- **余白**: 外周 padding が確保されているか。要素が窮屈になっていないか、一部だけ不自然に空いていないか
- **整列**: 揃うべき左端・上端が揃っているか。並べたカードの幅が均等か。アクセントバー・番号・アイコンと隣のテキストの揃え（`alignItems="center"` が基本。視覚的に浮く場合は `end` を試す）
- **階層**: タイトルが一目で本文と区別できるか。視線の流れ（左上 → 右下）が自然か
- **配色**: Step 2 で決めたパレットから逸脱した色が混入していないか。テキストと背景のコントラストが十分か
- **密度**: 詰め込みすぎのスライドがないか（あれば 2 枚に分割する）
- **一貫性**: スライド間で外周 padding・タイトル位置・配色が統一されているか

#### 終了条件

以下のいずれかを満たしたらループを終了する:

- チェックリスト上の重大な問題（はみ出し・重なり・可読性不足）が全スライドで無くなった
- 修正ループを 3 周した（3 周しても残る問題は、完了報告で残課題として明記する）
- 同じ問題への修正を 2 回試みても改善しなかった（その項目は残課題として報告し、他の問題の修正は続ける）

### 6. プレビューの起動（オプション）

`Bash` ツールで pom-cli の有無を確認し、インストール済みであれば Step 4 で決定したファイル名を使ってプレビューサーバーをバックグラウンドで起動する。`pom preview` は常駐プロセスであるため、`run_in_background: true`（Claude Code）または `&` サフィックスを必ず使う。

```bash
if command -v pom >/dev/null 2>&1; then
  pom preview <Step 4 で決定したファイル名> &
fi
```

pom-cli がない場合はスキップしてその旨を伝える。

### 7. 完了報告

以下を報告する:

- 保存したファイル名
- 生成したスライドの枚数と各スライドのタイトル
- セルフレビューの結果: 実施した修正の概要と残課題（スキップした場合はその理由）
- pom-cli が見つかった場合: プレビューサーバーが http://localhost:3000 で起動中であること
- pom-cli がない場合: `npm install -g @hirokisakabe/pom-cli` でインストールできることを案内する
