# pom

**pom (PowerPoint Object Model)** は、PowerPoint プレゼンテーション（pptx）を TypeScript で宣言的に記述するためのライブラリです。

## 特徴

- **型安全**: TypeScript による厳密な型定義
- **宣言的**: JSON ライクなオブジェクトでスライドを記述
- **柔軟なレイアウト**: VStack/HStack/Box による自動レイアウト
- **ピクセル単位**: 直感的なピクセル単位での指定（内部でインチに変換）
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

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

- `color` で文字色を 16 進カラーコード（例: `"FF0000"`）として指定できます。

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

#### 4. Box

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

#### 5. VStack

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

#### 6. HStack

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

#### 7. Shape

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
  fontColor?: string;
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
