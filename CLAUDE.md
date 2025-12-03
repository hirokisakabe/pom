# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

pom (PowerPoint Object Model) は、TypeScript で PowerPoint プレゼンテーションを宣言的に記述するためのライブラリ。Flexbox スタイルのレイアウトを yoga-layout で計算し、pptxgenjs で PPTX を生成する。

## コマンド

```bash
npm run build        # TypeScriptコンパイル
npm run lint         # ESLint
npm run fmt          # Prettierフォーマット
npm run fmt:check    # フォーマットチェック
npm run typecheck    # 型チェック
npm run test:run     # テスト実行
npm run test         # テスト（watchモード）
npx tsx main.ts      # サンプル実行（sample.pptx生成）
```

## アーキテクチャ

PPTX 生成は3段階のパイプライン:

1. **calcYogaLayout** (`src/calcYogaLayout/`) - POMNode ツリーを走査し、yoga-layout でレイアウト計算。各ノードに `yogaNode` をセット
2. **toPositioned** (`src/toPositioned/`) - 計算済みレイアウトから絶対座標を持つ PositionedNode ツリーを生成
3. **renderPptx** (`src/renderPptx/`) - PositionedNode を pptxgenjs API に変換してスライド描画

### 主要な型

- `POMNode` - 入力ノード型（Text, Image, Table, Box, VStack, HStack, Shape）
- `PositionedNode` - 位置情報付きノード（x, y, w, h を持つ）

### 単位変換

- ユーザー入力: ピクセル（px）
- 内部レイアウト: ピクセル（yoga-layout）
- PPTX 出力: インチ（`pxToIn` で変換、96 DPI 基準）
