import { POMNode, buildPptx } from "./src";

// ページ1: タイトルページと概要
const page1: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: "F6F8FF",
  border: { color: "CBD5FF", width: 4 },
  children: [
    {
      type: "vstack",
      gap: 12,
      alignItems: "center",
      padding: 32,
      backgroundColor: "FFFFFF",
      border: { color: "E0E7FF", width: 2 },
      children: [
        {
          type: "text",
          text: "Webアプリケーション開発における",
          fontPx: 32,
        },
        {
          type: "text",
          text: "AI活用の最前線",
          fontPx: 44,
        },
        {
          type: "text",
          text: "～生産性を劇的に向上させる実践手法～",
          fontPx: 24,
        },
      ],
    },
    {
      type: "box",
      padding: 24,
      backgroundColor: "FFFFFF",
      border: { color: "D9E2EC", width: 2 },
      children: {
        type: "vstack",
        gap: 16,
        alignItems: "start",
        children: [
          {
            type: "text",
            text: "AI技術の進化により、Web開発の現場は大きく変わりつつあります。GitHub Copilot、ChatGPT、Claude、Cursorなどのツールは、単なるコード補完を超え、設計、実装、テスト、デバッグの全工程を支援します。本プレゼンテーションでは、実際の開発現場でAIをどう活用すべきか、具体的な手法と効果を解説します。",
            fontPx: 18,
          },
          {
            type: "hstack",
            gap: 32,
            children: [
              {
                type: "vstack",
                w: "50%",
                gap: 8,
                padding: 12,
                backgroundColor: "F9FAFB",
                border: { color: "E5E7EB", width: 1 },
                children: [
                  {
                    type: "text",
                    text: "【主なトピック】",
                    fontPx: 20,
                  },
                  {
                    type: "text",
                    text: "• AI開発ツールの種類と特徴\n• 開発フロー別の活用方法\n• 生産性向上の実例\n• 導入における注意点",
                    fontPx: 16,
                  },
                ],
              },
              {
                type: "vstack",
                w: "50%",
                gap: 8,
                padding: 12,
                backgroundColor: "F9FAFB",
                border: { color: "E5E7EB", width: 1 },
                children: [
                  {
                    type: "text",
                    text: "【対象者】",
                    fontPx: 20,
                  },
                  {
                    type: "text",
                    text: "• Web開発エンジニア\n• 技術リーダー\n• プロダクトマネージャー\n• AI活用に関心のある方",
                    fontPx: 16,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ],
};

// ページ2: 開発フロー別AI活用法
const page2: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 32,
  gap: 16,
  alignItems: "stretch",
  backgroundColor: "FFFDF6",
  border: { color: "F4E3C2", width: 4 },
  children: [
    {
      type: "box",
      padding: 12,
      backgroundColor: "FFFFFF",
      border: { color: "F2DCA8", width: 2 },
      children: {
        type: "text",
        text: "開発フロー別AI活用法",
        fontPx: 32,
      },
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        {
          type: "vstack",
          w: "50%",
          gap: 12,
          alignItems: "start",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "F2DCA8", width: 2 },
          children: [
            {
              type: "text",
              text: "【設計・要件定義フェーズ】",
              fontPx: 22,
            },
            {
              type: "text",
              text: "AIチャットツール（ChatGPT、Claude等）を活用し、システムアーキテクチャの提案や技術選定の支援を受けます。複数の実装パターンを比較検討する際、AIは各選択肢のメリット・デメリットを即座に提示できます。また、データベーススキーマ設計やAPI設計のレビューにも活用でき、見落としがちな問題点を早期発見できます。",
              fontPx: 16,
            },
            {
              type: "text",
              text: "【実装フェーズ】",
              fontPx: 22,
            },
            {
              type: "text",
              text: "GitHub CopilotやCursorなどのIDE統合型ツールが真価を発揮します。コンテキストを理解した上での高精度なコード生成、リファクタリング提案、型定義の自動生成などにより、実装速度が2〜3倍に向上します。特に定型的なCRUD処理やバリデーションロジックの実装では、ほぼ完全な自動生成が可能です。",
              fontPx: 16,
            },
          ],
        },
        {
          type: "vstack",
          w: "50%",
          gap: 12,
          alignItems: "start",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: "F2DCA8", width: 2 },
          children: [
            {
              type: "text",
              text: "【テスト・品質保証フェーズ】",
              fontPx: 22,
            },
            {
              type: "text",
              text: "AIはユニットテスト、統合テストのコード生成を支援します。既存コードを分析してテストケースを提案し、エッジケースの洗い出しも行います。また、テストデータの生成やモックオブジェクトの作成も自動化でき、テスト作成時間を大幅に削減できます。",
              fontPx: 16,
            },
            {
              type: "text",
              text: "【デバッグ・保守フェーズ】",
              fontPx: 22,
            },
            {
              type: "text",
              text: "エラーメッセージやスタックトレースをAIに共有すると、原因の特定と修正方法の提案を受けられます。レガシーコードの理解支援にも有効で、複雑なコードベースの解説やリファクタリング提案により、保守性が向上します。コードレビューの自動化により、潜在的なバグやセキュリティ脆弱性の早期発見も可能です。",
              fontPx: 16,
            },
          ],
        },
      ],
    },
  ],
};

// ページ3: 効果と課題、まとめ
const page3: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 32,
  gap: 18,
  alignItems: "stretch",
  backgroundColor: "F9F9FC",
  border: { color: "D9D6FE", width: 4 },
  children: [
    {
      type: "box",
      padding: 12,
      backgroundColor: "FFFFFF",
      border: { color: "CBC3FF", width: 2 },
      children: {
        type: "text",
        text: "AI活用の効果と今後の展望",
        fontPx: 32,
      },
    },
    {
      type: "vstack",
      gap: 14,
      alignItems: "start",
      padding: 24,
      backgroundColor: "FFFFFF",
      border: { color: "E0E7FF", width: 2 },
      children: [
        {
          type: "text",
          text: "【定量的な効果】",
          fontPx: 24,
        },
        {
          type: "text",
          text: "実際の開発プロジェクトにおいて、AI活用により以下の効果が確認されています。コード作成速度が平均2.5倍向上し、バグ検出率が40%改善しました。また、新規参画メンバーのオンボーディング期間が50%短縮され、ドキュメント作成時間も70%削減されました。これらの効果により、プロジェクト全体の生産性が大幅に向上しています。",
          fontPx: 17,
        },
        {
          type: "hstack",
          gap: 24,
          children: [
            {
              type: "vstack",
              w: "50%",
              gap: 10,
              alignItems: "start",
              padding: 16,
              backgroundColor: "F9FAFF",
              border: { color: "D1D9FF", width: 1 },
              children: [
                {
                  type: "text",
                  text: "【導入における課題と対策】",
                  fontPx: 22,
                },
                {
                  type: "text",
                  text: "AIが生成するコードの品質チェックが必須です。特にセキュリティとパフォーマンスの観点での人間によるレビューが重要です。また、機密情報の取り扱いには注意が必要で、社内ガイドラインの整備が不可欠です。過度な依存を避け、AIをアシスタントとして適切に活用するマインドセットも重要です。",
                  fontPx: 16,
                },
              ],
            },
            {
              type: "vstack",
              w: "50%",
              gap: 10,
              alignItems: "start",
              padding: 16,
              backgroundColor: "F9FAFF",
              border: { color: "D1D9FF", width: 1 },
              children: [
                {
                  type: "text",
                  text: "【今後の展望】",
                  fontPx: 22,
                },
                {
                  type: "text",
                  text: "AI技術は今後さらに進化し、より高度なコード生成や自動リファクタリングが可能になります。プロジェクト全体の最適化提案や、アーキテクチャレベルの意思決定支援も実現するでしょう。重要なのは、AIと人間が協調する開発スタイルを確立することです。AIは強力なツールですが、最終的な判断と責任は人間が持つべきです。",
                  fontPx: 16,
                },
              ],
            },
          ],
        },
        {
          type: "box",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: "D1D9FF", width: 1 },
          children: {
            type: "table",
            defaultRowHeight: 40,
            columns: [{ width: 200 }, { width: 380 }, { width: 240 }],
            rows: [
              {
                height: 48,
                cells: [
                  {
                    text: "フェーズ",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "EEF2FF",
                  },
                  {
                    text: "主なAI活用例",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "EEF2FF",
                  },
                  {
                    text: "期待される効果",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "EEF2FF",
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "要件定義",
                    fontPx: 18,
                  },
                  {
                    text: "AIチャットで要件の抜け漏れを自動チェックし、アーキテクチャ案を比較",
                    fontPx: 16,
                  },
                  {
                    text: "仕様の確からしさ向上、意思決定スピードアップ",
                    fontPx: 16,
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "実装",
                    fontPx: 18,
                  },
                  {
                    text: "CopilotなどでCRUDの自動生成、テストケース案の生成",
                    fontPx: 16,
                  },
                  {
                    text: "開発リードタイム短縮、ケアレスミスの減少",
                    fontPx: 16,
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "テスト/保守",
                    fontPx: 18,
                  },
                  {
                    text: "失敗ログを入力して根本原因候補と修正案を提示",
                    fontPx: 16,
                  },
                  {
                    text: "不具合分析の高速化、学習コストの削減",
                    fontPx: 16,
                  },
                ],
              },
            ],
          },
        },
        {
          type: "box",
          padding: 16,
          backgroundColor: "F7F9FC",
          border: { color: "CBD2E5", width: 2 },
          children: {
            type: "text",
            text: "まとめ：AI活用は開発の未来ではなく、すでに現在の必須スキルです。適切に活用することで、生産性と品質の両方を向上させ、より創造的な開発に時間を使えるようになります。",
            fontPx: 18,
          },
        },
      ],
    },
  ],
};

async function main() {
  await buildPptx([page1, page2, page3], { w: 1280, h: 720 }, "sample.pptx");
}

main();
