# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

pom (PowerPoint Object Model) は、TypeScript で PowerPoint プレゼンテーションを宣言的に記述するためのライブラリ。Flexbox スタイルのレイアウトを yoga-layout で計算し、pptxgenjs で PPTX を生成する。

## コマンド

```bash
npm run build             # TypeScriptコンパイル
npm run lint              # ESLint
npm run fmt               # Prettierフォーマット
npm run fmt:check         # フォーマットチェック
npm run typecheck         # 型チェック
npm run test:run          # テスト実行
npm run test              # テスト（watchモード）
npx tsx main.ts           # サンプル実行（sample.pptx生成）
npm run vrt:docker        # VRT実行（Docker環境）
npm run vrt:docker:update # VRTベースライン更新（Docker環境）
```

## ディレクトリ構造

```
src/
├── index.ts              # 公開API
├── types.ts              # 型定義
├── inputSchema.ts        # LLM用入力スキーマ（Zod）
├── buildPptx.ts          # メイン処理（3段階パイプライン）
├── calcYogaLayout/       # レイアウト計算（yoga-layout）
├── toPositioned/         # 絶対座標変換
├── renderPptx/           # PPTX描画（pptxgenjs）
└── table/                # テーブルユーティリティ

vrt/                      # Visual Regression Test
```

## アーキテクチャ

PPTX 生成は3段階のパイプライン:

1. **calcYogaLayout** (`src/calcYogaLayout/`) - POMNode ツリーを走査し、yoga-layout でレイアウト計算。各ノードに `yogaNode` をセット
2. **toPositioned** (`src/toPositioned/`) - 計算済みレイアウトから絶対座標を持つ PositionedNode ツリーを生成
3. **renderPptx** (`src/renderPptx/`) - PositionedNode を pptxgenjs API に変換してスライド描画

### 主要な型

- `POMNode` - 入力ノード型（Text, Image, Table, Shape, Box, VStack, HStack）
- `PositionedNode` - 位置情報付きノード（x, y, w, h を持つ）
- `MasterSlideOptions` - マスタースライド設定（header, footer, pageNumber, date）

### 入力スキーマ（LLM連携用）

`inputSchema.ts` に Zod スキーマを定義。LLM が生成した JSON を検証するために使用。

- `inputPomNodeSchema` - メインの入力スキーマ
- `inputMasterSlideOptionsSchema` - マスタースライド設定用

### 単位変換

- ユーザー入力: ピクセル（px）
- 内部レイアウト: ピクセル（yoga-layout）
- PPTX 出力: インチ（`pxToIn` で変換、96 DPI 基準）
