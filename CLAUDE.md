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

- `POMNode` - 入力ノード型（Text, Image, Table, Shape, Chart, Box, VStack, HStack）
- `PositionedNode` - 位置情報付きノード（x, y, w, h を持つ）
- `MasterSlideOptions` - マスタースライド設定（header, footer, pageNumber, date）
- `ChartNode` - グラフノード（bar, line, pie をサポート）
- `BulletOptions` - 箇条書き設定（type, indent, numberType, numberStartAt）

### 入力スキーマ（LLM連携用）

`inputSchema.ts` に Zod スキーマを定義。LLM が生成した JSON を検証するために使用。

- `inputPomNodeSchema` - メインの入力スキーマ
- `inputMasterSlideOptionsSchema` - マスタースライド設定用

### 単位変換

- ユーザー入力: ピクセル（px）
- 内部レイアウト: ピクセル（yoga-layout）
- PPTX 出力: インチ（`pxToIn` で変換、96 DPI 基準）

## 機能追加時のチェックリスト

新しいプロパティや機能を追加する際は、以下のファイルを更新すること：

1. **型定義**: `src/types.ts` - 新しい型やプロパティを追加
2. **入力スキーマ**: `src/inputSchema.ts` - Zod スキーマを追加（LLM 連携用）
3. **描画処理**: `src/renderPptx/` 配下 - pptxgenjs への変換処理を実装
4. **VRT テストデータ**: `vrt/lib/generatePptx.ts` - 新機能のテストケースを追加
5. **VRT ベースライン更新**: `npm run vrt:docker:update` を実行
6. **ドキュメント更新**:
   - `README.md` - ユーザー向けドキュメント
   - `CLAUDE.md` - 主要な型セクションに追加
   - `llm-guide.md` - LLM 向けガイド
