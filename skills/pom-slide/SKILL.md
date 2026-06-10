---
name: pom-slide
description: Generate pom presentation slides from natural language. Applies design principles (color palette, typography scale, spacing), honors a pom-theme.json brand theme when present, creates a pom XML file, performs a rendered self-review loop, and optionally launches a live preview with pom-cli.
license: MIT
allowed-tools: Write,Edit,Read,Bash
metadata:
  version: "1.2.0"
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

デッキごとに以下の 5 ロールの色を決める。アクセントは 1 色に絞り、使用面積はスライドの 1 割以下に抑える（見出し脇のバー、強調数字、アイコンなど）。

| ロール | 役割 |
| --- | --- |
| base | スライド背景。真っ白 `FFFFFF` 固定にしない（オフホワイトやダークも検討する） |
| surface | カード・パネルの背景 |
| ink | 本文テキスト。純黒 `000000` は避ける |
| muted | 補助テキスト・キャプション |
| accent | 強調 1 色。多用しない |

プリセット例（そのまま使ってよいが、テーマに合わせて調整する）:

| トーン | base | surface | ink | muted | accent |
| --- | --- | --- | --- | --- | --- |
| コーポレート | `F8F9FB` | `FFFFFF` | `1F2937` | `6B7280` | `1E3A8A` |
| ウォーム・エディトリアル | `FAF6F0` | `FFFFFF` | `292524` | `78716C` | `C2410C` |
| ダーク・テック | `0F172A` | `1E293B` | `F1F5F9` | `94A3B8` | `38BDF8` |
| フレッシュ | `F6FBF9` | `FFFFFF` | `1A2E2A` | `5F7470` | `0D9488` |

#### タイポグラフィスケール

デッキ全体で以下の 5 段階だけを使う。中間サイズを場当たりで増やさず、1 枚のスライドに使うのは最大 3 段階まで。

| 段階 | fontSize | 用途 |
| --- | --- | --- |
| display | 44〜60, bold | 表紙タイトル、KPI の数字 |
| title | 28〜32, bold | スライドタイトル |
| heading | 18〜20, bold | カード見出し・小見出し |
| body | 14〜16 | 本文・箇条書き |
| caption | 11〜12, muted 色 | 補足・出典・ページ番号 |

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

| アーキタイプ | 構成 |
| --- | --- |
| 表紙 | display タイトル + サブタイトル + アクセントの細いバー。要素を絞り、余白を大胆に取る |
| アジェンダ | accent 色の番号 + 項目名の縦リスト |
| セクション扉 | 章番号と章タイトルのみ。表紙と同系の構成にして本編スライドと区別する |
| キーメッセージ | title + 本文 or 箇条書き。最も基本の 1 カラム |
| 比較 | 見出し付きカード 2〜3 枚を HStack で均等幅に並べる |
| タイムライン / プロセス | `Timeline` / `ProcessArrow` ノードを使う |
| データ | `Chart` / `Table` + そこから言えるインサイト 1 行（heading） |
| KPI | display サイズの数字 2〜4 個 + caption のラベル |
| まとめ / CTA | キーメッセージの再掲 + 次のアクション |

代表例（パレット: コーポレート）:

```xml
<!-- 表紙 -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="F8F9FB" justifyContent="center" gap="24">
    <Shape shapeType="rect" w="56" h="6" fill.color="1E3A8A" />
    <Text fontSize="52" bold="true" color="1F2937">プレゼンタイトル</Text>
    <Text fontSize="16" color="6B7280">サブタイトル — 2026-06-10 / 発表者名</Text>
  </VStack>
</Slide>

<!-- アジェンダ -->
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="F8F9FB" gap="32">
    <Text fontSize="32" bold="true" color="1F2937">アジェンダ</Text>
    <VStack gap="16">
      <HStack gap="16" alignItems="center">
        <Text fontSize="20" bold="true" color="1E3A8A">01</Text>
        <Text fontSize="16" color="1F2937">背景と課題</Text>
      </HStack>
      <HStack gap="16" alignItems="center">
        <Text fontSize="20" bold="true" color="1E3A8A">02</Text>
        <Text fontSize="16" color="1F2937">提案内容</Text>
      </HStack>
    </VStack>
  </VStack>
</Slide>

<!-- 比較 -->
<Slide>
  <VStack w="100%" h="max" padding="48" backgroundColor="F8F9FB" gap="24" alignItems="stretch">
    <Text fontSize="28" bold="true" color="1F2937">プラン比較</Text>
    <HStack gap="24" alignItems="stretch">
      <VStack w="50%" padding="24" backgroundColor="FFFFFF" borderRadius="8" gap="16">
        <Text fontSize="18" bold="true" color="1E3A8A">プラン A</Text>
        <Ul fontSize="14" color="1F2937">
          <Li>特徴 1</Li>
          <Li>特徴 2</Li>
        </Ul>
      </VStack>
      <VStack w="50%" padding="24" backgroundColor="FFFFFF" borderRadius="8" gap="16">
        <Text fontSize="18" bold="true" color="1E3A8A">プラン B</Text>
        <Ul fontSize="14" color="1F2937">
          <Li>特徴 1</Li>
          <Li>特徴 2</Li>
        </Ul>
      </VStack>
    </HStack>
  </VStack>
</Slide>
```

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

The top level of every pom XML document is one or more `<Slide>` elements. Each `<Slide>` wraps the content of a single slide.

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

- Top-level elements other than `<Slide>` are an error.
- A `<Slide>` must contain at least one child element.
- `<Slide>` does not currently take attributes; per-slide properties (background, notes, etc.) are tracked separately.

## Common Attributes (All Nodes)

| Attribute         | Type                                                       | Description                                |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `id`              | string                                                     | Unique identifier within the slide (used by `Arrow` connectors) |
| `w`               | number / `"max"` / `"50%"`                                 | Width                                      |
| `h`               | number / `"max"` / `"50%"`                                 | Height                                     |
| `minW` `maxW`     | number                                                     | Min / max width                            |
| `minH` `maxH`     | number                                                     | Min / max height                           |
| `padding`         | number / `padding.top="8" padding.bottom="8"`              | Padding (shorthand + dot notation can be mixed) |
| `backgroundColor` | hex                                                        | Background color                           |
| `backgroundGradient` | `linear-gradient(135deg, #667EEA 0%, #764BA2 100%)`     | Linear gradient background. Angle (`<n>deg` or `to right` etc., default `180deg`) + 2 or more hex color stops with optional `%` positions. Takes precedence over `backgroundColor`. On the slide root node it becomes the slide background |
| `backgroundImage` | `backgroundImage.src="url" backgroundImage.sizing="cover"` | Background image                           |
| `border`          | `border.color="333" border.width="1"`                      | Border (shorthand + dot notation can be mixed) |
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

| Attribute                | Type / Values                                              |
| ------------------------ | ---------------------------------------------------------- |
| `fontSize`               | number (default: 24)                                       |
| `color`                  | hex (text color)                                           |
| `textAlign`              | `left` / `center` / `right`                                |
| `bold` `italic` `strike` | `true` / `false`                                           |
| `underline`              | `true` / `underline.style="wavy" underline.color="FF0000"` |
| `highlight`              | hex (highlight color)                                      |
| `fontFamily`             | string (default: `Noto Sans JP`)                           |
| `lineHeight`             | number (default: 1.3)                                      |
| `letterSpacing`          | number in px (letter spacing, converted to pt on output)   |

Font size guide: Title 28-40 / Heading 18-24 / Body 13-16 / Caption 10-12

**Inline formatting:** Use `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Mark>`, and `<Span>` child elements for partial bold/italic/underline/strikethrough/highlight/color and hyperlinks:

```xml
<Text fontSize="16">Normal <B>bold</B> and <I>italic</I> text</Text>
<Text fontSize="16">Visit <A href="https://example.com">our site</A></Text>
<Text fontSize="16">Normal <U>underline</U> and <S>strikethrough</S> text</Text>
<Text fontSize="16"><Mark color="FFFF00">highlighted</Mark> text</Text>
<Text fontSize="16">Normal <Span color="FF0000">red text</Span> normal</Text>
<Text fontSize="16" fontFamily="Noto Sans JP">Default <Span fontFamily="Arial">Arial part</Span> default</Text>
<Text fontSize="16">Normal <Span letterSpacing="6">spaced out</Span> normal</Text>
```

`<Span>` supports `color`, `fontFamily` (overrides the parent's `fontFamily` for that run), and `letterSpacing` (adjusts letter spacing for that run; effective inside `<Text>` only).

`<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Mark>`, and `<Span>` also work inside `<Li>` and `<Td>`.

### Ul (Bullet List)

```xml
<Ul fontSize="14" color="333333">
  <Li>Item A</Li>
  <Li>Item B</Li>
  <Li bold="true">Item C (individual style)</Li>
</Ul>
```

| Attribute                | Type / Values                    |
| ------------------------ | -------------------------------- |
| `fontSize`               | number (default: 24)             |
| `color`                  | hex (text color)                 |
| `textAlign`              | `left` / `center` / `right`      |
| `bold` `italic` `strike` | `true` / `false`                 |
| `fontFamily`             | string (default: `Noto Sans JP`) |
| `lineHeight`             | number (default: 1.3)            |

Li attributes (override parent styles): `bold`, `italic`, `strike`, `underline`, `highlight`, `color`, `fontSize`, `fontFamily`

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
| `variant` | `circle-filled`, `circle-outlined`, `square-filled`, `square-outlined`   |
| `bgColor` | hex color for background shape (`#` prefix optional, default: `#E0E0E0`) |

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
| Text attributes | `fontSize` `color` `textAlign` `bold` `italic` `underline` `strike` `highlight` `fontFamily` `lineHeight` |

`fill`, `line`, and other style objects also allow mixing shorthand + dot notation on the same node (dot notation overrides specific keys).

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
- `<Td>`: text content + `fontSize` `color` `bold` `italic` `underline` `strike` `highlight` `fontFamily` `textAlign` `backgroundColor` `colspan` `rowspan`

### Chart

```xml
<Chart chartType="bar" w="500" h="300" showLegend="true" chartColors='["0088CC","00AA00"]'>
  <ChartSeries name="Sales">
    <ChartDataPoint label="Jan" value="100" />
    <ChartDataPoint label="Feb" value="150" />
  </ChartSeries>
</Chart>
```

| Attribute     | Type / Values                                          |
| ------------- | ------------------------------------------------------ |
| `chartType`   | `bar` / `line` / `pie` / `area` / `doughnut` / `radar` |
| `showLegend`  | boolean                                                |
| `showTitle`   | boolean                                                |
| `title`       | string                                                 |
| `chartColors` | JSON array `'["hex1","hex2"]'`                         |
| `radarStyle`  | `standard` / `marker` / `filled` (radar only)          |

### Timeline

```xml
<Timeline direction="horizontal" w="1000" h="120">
  <TimelineItem date="Q1" title="Phase 1" description="Foundation" color="4CAF50" />
  <TimelineItem date="Q2" title="Phase 2" description="Development" color="2196F3" />
</Timeline>
```

| Attribute   | Values                    |
| ----------- | ------------------------- |
| `direction` | `horizontal` / `vertical` |

`<TimelineItem>`: `date` (required) `title` (required) `description` `color`

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
- `<MatrixAxes>`: `x` `y` (axis labels, required)
- `<MatrixQuadrants>`: `topLeft` `topRight` `bottomLeft` `bottomRight`
- `<MatrixItem>`: `label` `x` `y` (required) `color`

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
| `nodeWidth`      | number (default: 120)                                 |
| `nodeHeight`     | number (default: 40)                                  |
| `levelGap`       | number (default: 60)                                  |
| `siblingGap`     | number (default: 20)                                  |
| `connectorStyle` | `connectorStyle.color="333" connectorStyle.width="2"` |

`<TreeItem>` can be recursively nested. Only one root allowed.

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
| `connectorStyle` | `connectorStyle.color="hex" connectorStyle.width="2" connectorStyle.arrowType="arrow"` |

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

`<FlowConnection>`: `from` `to` (required) `label` `color`

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
| `<Text>`         | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
| `<Li>`           | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
| `<Td>`    | `<B>`, `<I>`, `<A>`, `<U>`, `<S>`, `<Mark>`, `<Span>` | `runs` (inline formatting)   |
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

## Notes

- Colors do not need `#` prefix (`FF0000`)
- `alignItems` / `justifyContent` use `start` / `end` (not `left` / `right`)
- Property names are `w` / `h` (not `width` / `height`)
- Children of `Layer` require `x` and `y`
- `Tree` must have exactly one root `<TreeItem>`
<!-- END llm.txt -->

---

### 4. ファイルへの保存

`Write` ツールを使い、生成した XML をファイルに書き出す。

- デフォルトのファイル名: `slides.pom.xml`
- ユーザーが別のファイル名を指定した場合はそれに従う

### 5. セルフレビュー（レンダリング → 自己批評 → 修正）

保存した XML をレンダリングして画像として確認し、デザイン上の問題を修正するループ。レイアウト崩れやはみ出しは XML を眺めるだけでは検出できないため、必ず画像で確認する。

#### レンダリング手段の確認

`pom`（pom-cli）に加えて LibreOffice（`soffice`）が必要。PNG 化には `pdftoppm`（poppler）か ImageMagick があれば高速だが、どちらも無くても `soffice` 単体で可能。`pom` または `soffice` が無い場合はこのステップをスキップし、完了報告で「レンダリング確認は未実施」と伝える。

#### ループ手順

1. **ビルド**: `pom build <保存したファイル名> -o /tmp/pom-review/slides.pptx`
2. **PNG 化**（使える経路を上から選ぶ）:
   - `pdftoppm` がある場合: `soffice --headless --convert-to pdf --outdir /tmp/pom-review /tmp/pom-review/slides.pptx && pdftoppm -png -r 96 /tmp/pom-review/slides.pdf /tmp/pom-review/slide`
   - ImageMagick がある場合: 上記の `pdftoppm` の代わりに `magick -density 96 /tmp/pom-review/slides.pdf /tmp/pom-review/slide-%02d.png`
   - どちらも無い場合: `soffice` の PNG 直接変換は先頭スライドしか出力しないため、`<Slide>` ごとに一時 XML へ分割して個別に `pom build` し、それぞれを `soffice --headless --convert-to 'png:impress_png_Export:{"PixelWidth":{"type":"long","value":1280},"PixelHeight":{"type":"long","value":720}}' --outdir /tmp/pom-review <pptx>` で変換する
3. **批評**: 各 PNG を `Read` ツールで読み、下のチェックリストで全スライドを評価する
4. **修正**: 問題があれば XML を修正して 1 に戻る

#### 批評チェックリスト

- **はみ出し・重なり**: テキストの見切れ、要素同士の重なり、スライド外へのはみ出し（最優先で修正する）
- **余白**: 外周 padding が確保されているか。要素が窮屈になっていないか、一部だけ不自然に空いていないか
- **整列**: 揃うべき左端・上端が揃っているか。並べたカードの幅が均等か
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
