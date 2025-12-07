# pom 仕様

pom は PowerPoint を JSON で宣言的に記述する形式。以下の仕様に従って JSON を生成すること。

## 標準設定

```
スライドサイズ: { w: 1280, h: 720 }
標準padding: 48px（スライド全体）、18-24px（内部ボックス）
標準gap: 12-24px
```

## ノード一覧

| type   | 用途     | 主要プロパティ                                     |
| ------ | -------- | -------------------------------------------------- |
| text   | テキスト | text, fontPx, color, bold, alignText               |
| vstack | 縦並び   | children[], gap, alignItems, justifyContent        |
| hstack | 横並び   | children[], gap, alignItems, justifyContent        |
| box    | ラッパー | children（単一ノード）                             |
| table  | 表       | columns[], rows[], defaultRowHeight                |
| shape  | 図形     | shapeType, fill, line, text, fontPx                |
| chart  | グラフ   | chartType(bar/line/pie), data[], showLegend, title |
| image  | 画像     | src                                                |

### 共通プロパティ

すべてのノードで使用可能：

- `w`, `h`: サイズ（数値px / `"max"` / `"50%"`）
- `padding`: 余白（数値 or `{ top, right, bottom, left }`）
- `backgroundColor`: 背景色（6桁hex、例: `"F8FAFC"`）
- `border`: 枠線（`{ color, width, dashType }`）

### alignItems / justifyContent

- alignItems: `"start"` | `"center"` | `"end"` | `"stretch"`
- justifyContent: `"start"` | `"center"` | `"end"` | `"spaceBetween"`

## フォントサイズ目安

| 用途     | fontPx |
| -------- | ------ |
| タイトル | 28-40  |
| 見出し   | 18-24  |
| 本文     | 13-16  |
| 注釈     | 10-12  |

## パターン例

### 1. 基本スライド構造

```json
{
  "type": "vstack",
  "w": "100%",
  "h": "max",
  "padding": 48,
  "gap": 24,
  "alignItems": "stretch",
  "children": [
    { "type": "text", "text": "タイトル", "fontPx": 32, "bold": true },
    { "type": "text", "text": "本文テキスト", "fontPx": 14 }
  ]
}
```

### 2. 2カラムレイアウト

```json
{
  "type": "hstack",
  "gap": 24,
  "alignItems": "start",
  "children": [
    {
      "type": "box",
      "w": "50%",
      "padding": 20,
      "backgroundColor": "FFFFFF",
      "children": { "type": "text", "text": "左カラム", "fontPx": 14 }
    },
    {
      "type": "box",
      "w": "50%",
      "padding": 20,
      "backgroundColor": "FFFFFF",
      "children": { "type": "text", "text": "右カラム", "fontPx": 14 }
    }
  ]
}
```

### 3. 箇条書き

```json
{
  "type": "text",
  "text": "・項目1\n・項目2\n・項目3",
  "fontPx": 14,
  "lineSpacingMultiple": 1.5
}
```

### 4. テーブル

```json
{
  "type": "table",
  "defaultRowHeight": 36,
  "columns": [{ "width": 150 }, { "width": 200 }],
  "rows": [
    {
      "cells": [
        {
          "text": "項目",
          "fontPx": 14,
          "bold": true,
          "backgroundColor": "DBEAFE"
        },
        {
          "text": "値",
          "fontPx": 14,
          "bold": true,
          "backgroundColor": "DBEAFE"
        }
      ]
    },
    {
      "cells": [
        { "text": "売上", "fontPx": 13 },
        { "text": "100万円", "fontPx": 13 }
      ]
    }
  ]
}
```

### 5. 図形（テキスト付き）

```json
{
  "type": "shape",
  "shapeType": "roundRect",
  "w": 200,
  "h": 60,
  "text": "ボタン風",
  "fontPx": 16,
  "fill": { "color": "1D4ED8" },
  "color": "FFFFFF"
}
```

主な shapeType: `rect`, `roundRect`, `ellipse`, `triangle`, `star5`, `cloud`, `downArrow`

### 6. グラフ

```json
{
  "type": "chart",
  "chartType": "bar",
  "w": 500,
  "h": 300,
  "data": [
    {
      "name": "売上",
      "labels": ["1月", "2月", "3月"],
      "values": [100, 150, 200]
    }
  ],
  "showLegend": true,
  "chartColors": ["0088CC"]
}
```

## 注意点

| NG                       | OK                | 説明                                 |
| ------------------------ | ----------------- | ------------------------------------ |
| `"#FF0000"`              | `"FF0000"`        | colorに#は不要                       |
| `"left"`                 | `"start"`         | alignItems/justifyContentはstart/end |
| `children: [...]` in box | `children: {...}` | boxのchildrenは単一ノード            |
| `width: "100%"`          | `w: "100%"`       | プロパティ名はw/h                    |
