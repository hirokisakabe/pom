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
}
```

### ノード一覧

#### 1. Text

テキストを表示するノード。

```typescript
{
  type: "text";
  text: string;
  fontPx?: number;
  alignText?: "left" | "center" | "right";

  // 共通プロパティ
  w?: number | "max" | `${number}%`;
  h?: number | "max" | `${number}%`;
  ...
}
```

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

#### 3. Box

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

#### 4. VStack

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

#### 5. HStack

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
