# pom

**pom (PowerPoint Object Model)** は、PowerPoint プレゼンテーション（pptx）を TypeScript で宣言的に記述するためのライブラリです。生成 AI に出力させた POM 形式の JSON を、PowerPoint ファイルに変換するユースケースを想定しています。

## 動作環境

- Node.js 18 以上

> [!NOTE]
> pom は Node.js 環境でのみ動作します。ブラウザ環境では動作しません。

## 目次

- [動作環境](#動作環境)
- [インストール](#インストール)
- [クイックスタート](#クイックスタート)
- [特徴](#特徴)
- [ノード](#ノード)
- [マスタースライド](#マスタースライド)
- [LLM 連携](#llm-連携)
- [ライセンス](#ライセンス)

## インストール

```bash
npm install @hirokisakabe/pom
```

## クイックスタート

```typescript
import { buildPptx, POMNode } from "@hirokisakabe/pom";

const slide: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "start",
  children: [
    {
      type: "text",
      text: "プレゼンテーションタイトル",
      fontPx: 48,
      bold: true,
    },
    {
      type: "text",
      text: "サブタイトル",
      fontPx: 24,
      color: "666666",
    },
  ],
};

const pptx = await buildPptx([slide], { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "presentation.pptx" });
```

## 特徴

- **型安全**: TypeScript による厳密な型定義
- **宣言的**: JSON ライクなオブジェクトでスライドを記述
- **PowerPoint ファースト**: Shape 機能をネイティブサポート
- **柔軟なレイアウト**: VStack/HStack/Box による自動レイアウト
- **ピクセル単位**: 直感的なピクセル単位での指定（内部でインチに変換）
- **マスタースライド**: 全ページ共通のヘッダー・フッター・ページ番号を自動挿入
- **AI フレンドリー**: LLM がコード生成しやすいシンプルな構造

## ノード

### 共通プロパティ

すべてのノードが共通して持てるレイアウト属性。

```typescript
{
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  padding?: number;
  backgroundColor?: string;
  border?: {
    color?: string;
    width?: number;
    dashType?: "solid" | "dash" | "dashDot" | "lgDash" | "lgDashDot" | "lgDashDotDot" | "sysDash" | "sysDot";
  };
}
```

- `backgroundColor` はノード全体に塗りつぶしを適用します（例: `"F8F9FA"`）。
- `border.width` は px 単位で指定し、色や `dashType` と組み合わせて枠線を制御できます。

### ノード一覧

#### 1. Text

テキストを表示するノード。

```typescript
{
  type: "text";
  text: string;
  fontPx?: number;
  color?: string;
  alignText?: "left" | "center" | "right";
  bold?: boolean;
  fontFamily?: string;
  lineSpacingMultiple?: number;

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

- `color` で文字色を 16 進カラーコード（例: `"FF0000"`）として指定できます。
- `bold` で太字を指定できます。
- `fontFamily` でフォントファミリーを指定できます（デフォルト: `"Noto Sans JP"`）。
- `lineSpacingMultiple` で行間倍率を指定できます（デフォルト: `1.3`）。

#### 2. Image

画像を表示するノード。

- `w` と `h` を指定しない場合、画像の実際のサイズが自動的に取得されます
- サイズを指定した場合、そのサイズで表示されます（アスペクト比は保持されません）

```typescript
{
  type: "image";
  src: string;  // 画像のパス（ローカルパス、URL、base64データ）

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

#### 3. Table

表を描画するノード。列幅・行高を px 単位で宣言し、セル単位で装飾を細かく制御できます。

```typescript
{
  type: "table";
  columns: { width: number }[];
  rows: {
    height?: number;
    cells: {
      text: string;
      fontPx?: number;
      color?: string;
      bold?: boolean;
      alignText?: "left" | "center" | "right";
      backgroundColor?: string;
    }[];
  }[];
  defaultRowHeight?: number;

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

- `columns` の合計がテーブルの自然幅になります（必要であれば `w` で上書きできます）。
- `rows` の `height` を省略すると `defaultRowHeight`（未指定なら32px）が適用されます。
- セル背景やフォント装飾を `cells` の各要素で個別に指定できます。

#### 4. Shape

図形を描画するノード。テキスト付き/なしで異なる表現が可能で、複雑なビジュアル効果をサポートしています。

```typescript
{
  type: "shape";
  shapeType: PptxGenJS.SHAPE_NAME;  // 例: "roundRect", "ellipse", "cloud", "star5" など
  text?: string;                     // 図形内に表示するテキスト（オプション）
  fill?: {
    color?: string;
    transparency?: number;
  };
  line?: {
    color?: string;
    width?: number;
    dashType?: "solid" | "dash" | "dashDot" | "lgDash" | "lgDashDot" | "lgDashDotDot" | "sysDash" | "sysDot";
  };
  shadow?: {
    type: "outer" | "inner";
    opacity?: number;
    blur?: number;
    angle?: number;
    offset?: number;
    color?: string;
  };
  fontPx?: number;
  color?: string;
  alignText?: "left" | "center" | "right";

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

**主な図形タイプの例:**

- `roundRect`: 角丸長方形（タイトルボックス、カテゴリ表示）
- `ellipse`: 楕円/円（ステップ番号、バッジ）
- `cloud`: 雲型（コメント、重要ポイント）
- `wedgeRectCallout`: 矢印付き吹き出し（注記）
- `cloudCallout`: 雲吹き出し（コメント）
- `star5`: 5つ星（強調、デコレーション）
- `downArrow`: 下矢印（フロー図）

#### 5. Box

単一の子要素をラップする汎用コンテナ。

- 子要素は **1つ**
- padding や固定サイズを与えてグルーピングに使う

```typescript
{
  type: "box";
  children: POMNode;

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

#### 6. VStack

子要素を **縦方向** に並べる。

```typescript
{
  type: "vstack";
  children: POMNode[];
  alignItems: "start" | "center" | "end" | "stretch";
  justifyContent: "start" | "center" | "end" | "spaceBetween";
  gap?: number;

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

#### 7. HStack

子要素を **横方向** に並べる。

```typescript
{
  type: "hstack";
  children: POMNode[];
  alignItems: "start" | "center" | "end" | "stretch";
  justifyContent: "start" | "center" | "end" | "spaceBetween";
  gap?: number;

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

#### 8. Chart

グラフを描画するノード。棒グラフ、折れ線グラフ、円グラフをサポート。

```typescript
{
  type: "chart";
  chartType: "bar" | "line" | "pie";
  data: {
    name?: string;           // 系列名
    labels: string[];        // カテゴリラベル
    values: number[];        // 値
  }[];
  showLegend?: boolean;      // 凡例表示（デフォルト: false）
  showTitle?: boolean;       // タイトル表示（デフォルト: false）
  title?: string;            // タイトル文字列
  chartColors?: string[];    // データカラー配列（16進カラーコード）

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

**使用例:**

```typescript
// 棒グラフ
{
  type: "chart",
  chartType: "bar",
  w: 600,
  h: 400,
  data: [
    {
      name: "売上",
      labels: ["1月", "2月", "3月", "4月"],
      values: [100, 200, 150, 300],
    },
    {
      name: "利益",
      labels: ["1月", "2月", "3月", "4月"],
      values: [30, 60, 45, 90],
    },
  ],
  showLegend: true,
  showTitle: true,
  title: "月別売上・利益",
  chartColors: ["0088CC", "00AA00"],
}

// 円グラフ
{
  type: "chart",
  chartType: "pie",
  w: 400,
  h: 300,
  data: [
    {
      name: "市場シェア",
      labels: ["製品A", "製品B", "製品C", "その他"],
      values: [40, 30, 20, 10],
    },
  ],
  showLegend: true,
  chartColors: ["0088CC", "00AA00", "FF6600", "888888"],
}
```

## マスタースライド

全ページに共通のヘッダー・フッター・ページ番号を自動挿入できます。

### 基本的な使い方

```typescript
import { buildPptx } from "@hirokisakabe/pom";

const pptx = await buildPptx(
  [page1, page2, page3],
  { w: 1280, h: 720 },
  {
    master: {
      header: {
        type: "hstack",
        h: 40,
        padding: { left: 48, right: 48, top: 12, bottom: 0 },
        justifyContent: "spaceBetween",
        alignItems: "center",
        backgroundColor: "0F172A",
        children: [
          {
            type: "text",
            text: "会社名",
            fontPx: 14,
            color: "FFFFFF",
          },
          {
            type: "text",
            text: "{{date}}",
            fontPx: 12,
            color: "E2E8F0",
          },
        ],
      },
      footer: {
        type: "hstack",
        h: 30,
        padding: { left: 48, right: 48, top: 0, bottom: 8 },
        justifyContent: "spaceBetween",
        alignItems: "center",
        children: [
          {
            type: "text",
            text: "Confidential",
            fontPx: 10,
            color: "1E293B",
          },
          {
            type: "text",
            text: "Page {{page}} / {{totalPages}}",
            fontPx: 10,
            color: "1E293B",
            alignText: "right",
          },
        ],
      },
      date: {
        format: "YYYY/MM/DD", // または "locale"
      },
    },
  },
);
```

### マスタースライドのオプション

```typescript
type MasterSlideOptions = {
  header?: POMNode; // ヘッダー（任意の POMNode を指定可能）
  footer?: POMNode; // フッター（任意の POMNode を指定可能）
  pageNumber?: {
    position: "left" | "center" | "right"; // ページ番号の位置
  };
  date?: {
    format: "YYYY/MM/DD" | "locale"; // 日付のフォーマット
  };
};
```

### プレースホルダー

ヘッダー・フッター内のテキストで以下のプレースホルダーが使用できます：

- `{{page}}`: 現在のページ番号
- `{{totalPages}}`: 総ページ数
- `{{date}}`: 日付（`date.format` で指定した形式）

### 特徴

- **柔軟性**: ヘッダー・フッターには任意の POMNode（VStack、HStack、Box など）を使用可能
- **自動合成**: 各ページのコンテンツに自動的にヘッダー・フッターが追加されます
- **動的置換**: プレースホルダーはページごとに自動的に置換されます
- **後方互換性**: master オプションは省略可能で、既存コードへの影響はありません

## LLM 連携

pom は LLM（GPT-4o、Claude など）で生成した JSON からスライドを作成するユースケースに対応しています。

### LLM 向け仕様ガイド

[`llm-guide.md`](./llm-guide.md) は、LLM に pom 形式の JSON を生成させるためのコンパクトな仕様書です。システムプロンプトに含めて使用してください。

**含まれる内容:**

- ノード一覧と主要プロパティ
- 標準設定（スライドサイズ、padding、gap、フォントサイズ目安）
- パターン例（基本構造、2 カラム、テーブル、図形、グラフなど）
- よくある間違いと正しい書き方

### 入力用スキーマ

`inputPomNodeSchema` を使って、LLM が生成した JSON を検証できます。

```typescript
import { inputPomNodeSchema, buildPptx, InputPOMNode } from "@hirokisakabe/pom";

// LLMからのJSON出力を検証
const jsonFromLLM = `{
  "type": "vstack",
  "padding": 48,
  "gap": 24,
  "children": [
    { "type": "text", "text": "タイトル", "fontPx": 32, "bold": true },
    { "type": "text", "text": "本文テキスト", "fontPx": 16 }
  ]
}`;

const parsed = JSON.parse(jsonFromLLM);
const result = inputPomNodeSchema.safeParse(parsed);

if (result.success) {
  // 検証成功 - PPTXを生成
  const pptx = await buildPptx([result.data], { w: 1280, h: 720 });
  await pptx.writeFile({ fileName: "output.pptx" });
} else {
  // 検証失敗 - エラー内容を確認
  console.error("Validation failed:", result.error.format());
}
```

### OpenAI Structured Outputs との連携

OpenAI SDK の `zodResponseFormat` を使用して、LLM に直接スキーマ準拠の JSON を生成させることができます。

```typescript
import { inputPomNodeSchema, buildPptx } from "@hirokisakabe/pom";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content:
        "あなたはプレゼンテーション作成アシスタントです。指定されたスキーマに従ってスライドのJSONを生成してください。",
    },
    {
      role: "user",
      content:
        "売上報告のスライドを作成して。タイトルと3つの箇条書きを含めて。",
    },
  ],
  response_format: zodResponseFormat(inputPomNodeSchema, "slide"),
});

const slideData = JSON.parse(response.choices[0].message.content!);
const pptx = await buildPptx([slideData], { w: 1280, h: 720 });
await pptx.writeFile({ fileName: "sales-report.pptx" });
```

### 利用可能な入力用スキーマ

| スキーマ                        | 説明                                           |
| ------------------------------- | ---------------------------------------------- |
| `inputPomNodeSchema`            | メインのノードスキーマ（全ノードタイプを含む） |
| `inputTextNodeSchema`           | テキストノード用                               |
| `inputImageNodeSchema`          | 画像ノード用                                   |
| `inputTableNodeSchema`          | テーブルノード用                               |
| `inputShapeNodeSchema`          | 図形ノード用                                   |
| `inputChartNodeSchema`          | チャートノード用                               |
| `inputBoxNodeSchema`            | Boxノード用                                    |
| `inputVStackNodeSchema`         | VStackノード用                                 |
| `inputHStackNodeSchema`         | HStackノード用                                 |
| `inputMasterSlideOptionsSchema` | マスタースライド設定用                         |

## ライセンス

MIT
