# pom (PowerPoint Object Model)

**pom** は、PowerPoint プレゼンテーション（pptx）を TypeScript で宣言的に記述するためのライブラリです。

## 特徴

- **型安全**: TypeScript による厳密な型定義
- **宣言的**: JSON ライクなオブジェクトでスライドを記述
- **柔軟なレイアウト**: VStack/HStack/Box による自動レイアウト
- **ピクセル単位**: 直感的なピクセル単位での指定（内部でインチに変換）
- **AI フレンドリー**: LLM がコード生成しやすいシンプルな構造

## インストール

```bash
npm install pptxgenjs
```

## 基本的な使い方

```typescript
import { layout } from "./src/layout";
import { renderPptx } from "./src/renderPptx";
import { Node } from "./src/types";

const doc: Node = {
  type: "vstack",
  padding: 40,
  gap: 24,
  alignItems: "center",
  children: [
    {
      type: "text",
      text: "スライドタイトル",
      fontPx: 48,
      alignText: "center",
      w: "max",
    },
    {
      type: "text",
      text: "本文テキスト",
      fontPx: 28,
      alignText: "center",
      w: "max",
    },
  ],
};

async function main() {
  const slideSize = { w: 1280, h: 720 }; // px単位で16:9
  const positioned = layout(doc, slideSize);
  const pptx = renderPptx(positioned, slideSize);
  await pptx.writeFile({ fileName: "output.pptx" });
}

main();
```

## サンプルの実行

```bash
# サンプルデータから pptx を生成
npx tsx main.ts
```

`main.ts` には VStack/HStack を使った基本的なレイアウトの実例が含まれています。

## 座標システム

### ピクセル単位

すべての座標とサイズは**ピクセル単位**です（内部でインチに変換されます）。

- 標準スライドサイズ: `1280 x 720` ピクセル（16:9）
- 典型的な値: 幅は `200` 〜 `1200` 程度、フォントサイズは `18` 〜 `48` 程度

### レイアウトシステム

VStack/HStack/Box による自動レイアウトを採用しています。

- **VStack**: 子要素を縦方向に自動配置
- **HStack**: 子要素を横方向に自動配置
- **Box**: 単一の子要素をラップするコンテナ

```typescript
{
  type: "vstack",
  padding: 40,
  gap: 24,
  children: [
    { type: "text", text: "テキスト1", fontPx: 24 },
    { type: "text", text: "テキスト2", fontPx: 18 },
    { type: "image", src: "image.png", w: 600, aspectRatio: 16/9 },
  ]
}
```

## ノードタイプ

### text（テキストボックス）

```typescript
{
  type: "text",
  text: "テキスト内容\n改行も可能",
  fontPx: 24,           // フォントサイズ（ピクセル）
  alignText: "center",  // "left" | "center" | "right"
  w: "max",             // 幅（ピクセル、"max"で親幅いっぱい、"50%"でパーセント指定も可）
  h: 100,               // 高さ（ピクセル、省略可）
}
```

### image（画像）

```typescript
{
  type: "image",
  src: "https://example.com/image.png", // URL、ローカルパス、data URL
  w: 600,           // 幅（ピクセル）
  aspectRatio: 4/3, // アスペクト比（w/h）、省略可
}
```

### box（コンテナ）

```typescript
{
  type: "box",
  padding: 20,    // 余白（ピクセル）
  w: 600,         // 幅（ピクセル、省略可）
  children: [
    { type: "text", text: "コンテンツ", fontPx: 18 },
  ]
}
```

**padding の詳細指定**:

```typescript
{
  type: "box",
  padding: { top: 20, right: 30, bottom: 20, left: 30 },
  children: [...]
}
```

### vstack（縦積みレイアウト）

```typescript
{
  type: "vstack",
  gap: 24,          // 子要素間の縦方向の間隔（ピクセル）
  w: "max",         // 幅（ピクセル、"max"、パーセント指定可）
  alignItems: "center",  // 交差軸の配置: "start" | "center" | "end" | "stretch"
  justify: "center",     // 主軸の配置: "start" | "center" | "end" | "spaceBetween"
  padding: 40,      // 余白（ピクセル）
  children: [
    { type: "text", text: "テキスト1", fontPx: 18 },
    { type: "text", text: "テキスト2", fontPx: 18 },
    { type: "image", src: "image.png", w: 600, aspectRatio: 16/9 },
  ]
}
```

**VStack の特徴**:
- 子要素を縦方向に自動配置
- `gap` で要素間の間隔を制御
- `alignItems` で子要素の水平方向の配置を制御
- `justify` で子要素の垂直方向の配置を制御

### hstack（横並びレイアウト）

```typescript
{
  type: "hstack",
  gap: 16,          // 子要素間の横方向の間隔（ピクセル）
  w: "max",         // 全体の幅（ピクセル、"max"、パーセント指定可）
  alignItems: "center",  // 交差軸の配置: "start" | "center" | "end" | "stretch"
  justify: "center",     // 主軸の配置: "start" | "center" | "end" | "spaceBetween"
  children: [
    {
      type: "vstack",
      children: [
        { type: "text", text: "左カラム", fontPx: 18 },
      ],
    },
    {
      type: "vstack",
      children: [
        { type: "text", text: "右カラム", fontPx: 18 },
      ],
    },
  ]
}
```

**HStack の特徴**:
- 子要素を横方向に自動配置
- 利用可能な幅を子要素数で均等分割（デフォルト）
- `gap` で要素間の間隔を制御
- `alignItems` で子要素の垂直方向の配置を制御
- `justify` で子要素の水平方向の配置を制御（`spaceBetween` で両端揃えも可能）

## レイアウトパターン

### 2カラムレイアウト

HStack + VStack を使った2カラムレイアウトの例:

```typescript
{
  type: "vstack",
  padding: 40,
  gap: 24,
  children: [
    {
      type: "hstack",
      gap: 16,
      children: [
        {
          type: "vstack",
          children: [
            { type: "text", text: "左カラムのタイトル", fontPx: 24 },
            { type: "text", text: "左側の内容", fontPx: 18 },
          ]
        },
        {
          type: "vstack",
          children: [
            { type: "text", text: "右カラムのタイトル", fontPx: 24 },
            { type: "text", text: "右側の内容", fontPx: 18 },
          ]
        }
      ]
    }
  ]
}
```

### タイトル + 画像のレイアウト

```typescript
{
  type: "vstack",
  padding: 40,
  gap: 24,
  alignItems: "center",
  children: [
    {
      type: "text",
      text: "タイトル",
      fontPx: 48,
      alignText: "center",
      w: "max",
    },
    {
      type: "hstack",
      gap: 16,
      justify: "center",
      children: [
        {
          type: "image",
          src: "image1.png",
          w: 400,
          aspectRatio: 4/3,
        },
        {
          type: "image",
          src: "image2.png",
          w: 400,
          aspectRatio: 4/3,
        },
      ],
    },
  ]
}
```

## ライセンス

MIT
