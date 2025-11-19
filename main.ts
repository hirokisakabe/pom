import { POMNode, buildPptx } from "./src";

// ページ1: タイトルページ
const page1: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 40,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: "EFF6FF",
  border: { color: "93C5FD", width: 4 },
  children: [
    // タイトルセクション
    {
      type: "vstack",
      gap: 16,
      alignItems: "center",
      padding: 32,
      backgroundColor: "FFFFFF",
      border: { color: "3B82F6", width: 2 },
      children: [
        {
          type: "text",
          text: "TypeScriptプロジェクト",
          fontPx: 40,
        },
        {
          type: "text",
          text: "ベストプラクティス",
          fontPx: 48,
        },
        {
          type: "text",
          text: "品質と生産性を高める開発手法",
          fontPx: 24,
        },
      ],
    },
    // メインコンテンツ
    {
      type: "hstack",
      gap: 24,
      alignItems: "start",
      children: [
        // 左: イメージとテキスト
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          alignItems: "center",
          children: [
            {
              type: "shape",
              shapeType: "roundRect",
              w: 200,
              h: 200,
              text: "TypeScript",
              fontPx: 32,
              fontColor: "FFFFFF",
              fill: { color: "3178C6" },
              line: { color: "235A97", width: 3 },
              shadow: {
                type: "outer",
                opacity: 0.3,
                blur: 10,
                angle: 45,
                offset: 8,
                color: "000000",
              },
            },
            {
              type: "text",
              text: "型安全性と開発体験の向上",
              fontPx: 18,
            },
          ],
        },
        // 右: 概要
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "BFDBFE", width: 2 },
              children: {
                type: "vstack",
                gap: 12,
                children: [
                  {
                    type: "text",
                    text: "このプレゼンテーションでは、TypeScriptプロジェクトにおける開発のベストプラクティスを紹介します。適切なツール選定、コーディング規約、実装パターンを学ぶことで、チーム全体の生産性と品質を向上させることができます。",
                    fontPx: 16,
                  },
                ],
              },
            },
            {
              type: "hstack",
              gap: 16,
              children: [
                {
                  type: "shape",
                  shapeType: "ellipse",
                  w: 100,
                  h: 100,
                  text: "品質",
                  fontPx: 18,
                  fill: { color: "DBEAFE" },
                  line: { color: "3B82F6", width: 2 },
                },
                {
                  type: "shape",
                  shapeType: "ellipse",
                  w: 100,
                  h: 100,
                  text: "速度",
                  fontPx: 18,
                  fill: { color: "D1FAE5" },
                  line: { color: "10B981", width: 2 },
                },
                {
                  type: "shape",
                  shapeType: "ellipse",
                  w: 100,
                  h: 100,
                  text: "保守性",
                  fontPx: 18,
                  fill: { color: "FEF3C7" },
                  line: { color: "F59E0B", width: 2 },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// ページ2: 開発環境とツール
const page2: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 32,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: "F0FDF4",
  border: { color: "86EFAC", width: 4 },
  children: [
    {
      type: "box",
      padding: 12,
      backgroundColor: "FFFFFF",
      border: { color: "10B981", width: 2 },
      children: {
        type: "text",
        text: "開発環境とツール",
        fontPx: 32,
      },
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        // 左カラム: ツールカテゴリ
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          children: [
            {
              type: "vstack",
              gap: 12,
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "6EE7B7", width: 2 },
              children: [
                {
                  type: "shape",
                  shapeType: "roundRect",
                  w: 280,
                  h: 60,
                  text: "型チェック・Linter",
                  fontPx: 20,
                  fill: { color: "DBEAFE" },
                  line: { color: "3B82F6", width: 2 },
                  shadow: {
                    type: "outer",
                    opacity: 0.3,
                    blur: 6,
                    angle: 45,
                    offset: 4,
                    color: "000000",
                  },
                },
                {
                  type: "text",
                  text: "• TypeScript Compiler (tsc)\n• ESLint (typescript-eslint)\n• Prettier\n• ts-node / tsx",
                  fontPx: 16,
                },
              ],
            },
            {
              type: "vstack",
              gap: 12,
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "6EE7B7", width: 2 },
              children: [
                {
                  type: "shape",
                  shapeType: "roundRect",
                  w: 280,
                  h: 60,
                  text: "ビルド・バンドラ",
                  fontPx: 20,
                  fill: { color: "FEF3C7" },
                  line: { color: "F59E0B", width: 2 },
                  shadow: {
                    type: "outer",
                    opacity: 0.3,
                    blur: 6,
                    angle: 45,
                    offset: 4,
                    color: "000000",
                  },
                },
                {
                  type: "text",
                  text: "• Vite\n• esbuild\n• Webpack\n• Rollup",
                  fontPx: 16,
                },
              ],
            },
          ],
        },
        // 右カラム: ツールカテゴリ
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          children: [
            {
              type: "vstack",
              gap: 12,
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "6EE7B7", width: 2 },
              children: [
                {
                  type: "shape",
                  shapeType: "roundRect",
                  w: 280,
                  h: 60,
                  text: "テスティング",
                  fontPx: 20,
                  fill: { color: "D1FAE5" },
                  line: { color: "10B981", width: 2 },
                  shadow: {
                    type: "outer",
                    opacity: 0.3,
                    blur: 6,
                    angle: 45,
                    offset: 4,
                    color: "000000",
                  },
                },
                {
                  type: "text",
                  text: "• Vitest\n• Jest\n• Testing Library\n• Playwright / Cypress",
                  fontPx: 16,
                },
              ],
            },
            {
              type: "vstack",
              gap: 12,
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "6EE7B7", width: 2 },
              children: [
                {
                  type: "shape",
                  shapeType: "roundRect",
                  w: 280,
                  h: 60,
                  text: "開発体験向上",
                  fontPx: 20,
                  fill: { color: "FCE7F3" },
                  line: { color: "EC4899", width: 2 },
                  shadow: {
                    type: "outer",
                    opacity: 0.3,
                    blur: 6,
                    angle: 45,
                    offset: 4,
                    color: "000000",
                  },
                },
                {
                  type: "text",
                  text: "• Biome\n• Zod (Runtime Validation)\n• tRPC\n• Husky (Git Hooks)",
                  fontPx: 16,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: "6EE7B7", width: 2 },
      children: {
        type: "hstack",
        gap: 16,
        alignItems: "center",
        children: [
          {
            type: "shape",
            shapeType: "cloud",
            w: 180,
            h: 80,
            text: "ツール選定のコツ",
            fontPx: 16,
            fill: { color: "EFF6FF" },
            line: { color: "3B82F6", width: 2 },
          },
          {
            type: "text",
            text: "プロジェクトの規模や要件に応じて最適なツールを選択し、チーム全体で統一した開発環境を構築することが重要です。",
            fontPx: 16,
          },
          {
            type: "image",
            src: "https://placehold.co/100x100/3B82F6/FFFFFF?text=Tools",
            w: 100,
            h: 100,
          },
        ],
      },
    },
  ],
};

// ページ3: コーディング規約とパターン
const page3: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 32,
  gap: 18,
  alignItems: "stretch",
  backgroundColor: "FEF3C7",
  border: { color: "FCD34D", width: 4 },
  children: [
    {
      type: "box",
      padding: 12,
      backgroundColor: "FFFFFF",
      border: { color: "F59E0B", width: 2 },
      children: {
        type: "text",
        text: "コーディング規約とパターン",
        fontPx: 32,
      },
    },
    {
      type: "vstack",
      gap: 16,
      children: [
        // テーブル: ベストプラクティス
        {
          type: "box",
          padding: 16,
          backgroundColor: "FFFFFF",
          border: { color: "FCD34D", width: 2 },
          children: {
            type: "table",
            defaultRowHeight: 45,
            columns: [{ width: 200 }, { width: 300 }, { width: 320 }],
            rows: [
              {
                height: 50,
                cells: [
                  {
                    text: "カテゴリ",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "FEF3C7",
                  },
                  {
                    text: "推奨",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "D1FAE5",
                  },
                  {
                    text: "非推奨",
                    fontPx: 20,
                    bold: true,
                    alignText: "center",
                    backgroundColor: "FEE2E2",
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "型定義",
                    fontPx: 18,
                    bold: true,
                  },
                  {
                    text: "interface / type を適切に使い分ける",
                    fontPx: 16,
                  },
                  {
                    text: "any 型の多用",
                    fontPx: 16,
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "関数定義",
                    fontPx: 18,
                    bold: true,
                  },
                  {
                    text: "アロー関数で明示的な戻り値型",
                    fontPx: 16,
                  },
                  {
                    text: "暗黙的な戻り値と副作用の混在",
                    fontPx: 16,
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "非同期処理",
                    fontPx: 18,
                    bold: true,
                  },
                  {
                    text: "async/await を活用",
                    fontPx: 16,
                  },
                  {
                    text: "Promise のネストしたコールバック",
                    fontPx: 16,
                  },
                ],
              },
              {
                cells: [
                  {
                    text: "エラーハンドリング",
                    fontPx: 18,
                    bold: true,
                  },
                  {
                    text: "型安全なエラークラスを定義",
                    fontPx: 16,
                  },
                  {
                    text: "string 型のエラーを throw",
                    fontPx: 16,
                  },
                ],
              },
            ],
          },
        },
        // 吹き出しで重要ポイント
        {
          type: "hstack",
          gap: 16,
          children: [
            {
              type: "shape",
              shapeType: "wedgeRectCallout",
              w: 260,
              h: 90,
              text: "strictモードを\n有効にしよう！",
              fontPx: 18,
              fill: { color: "DBEAFE" },
              line: { color: "3B82F6", width: 2 },
            },
            {
              type: "shape",
              shapeType: "cloudCallout",
              w: 260,
              h: 90,
              text: "型推論を\n活用しよう！",
              fontPx: 18,
              fill: { color: "D1FAE5" },
              line: { color: "10B981", width: 2 },
            },
            {
              type: "shape",
              shapeType: "wedgeRectCallout",
              w: 260,
              h: 90,
              text: "一貫性のある\nコードスタイル",
              fontPx: 18,
              fill: { color: "FEF3C7" },
              line: { color: "F59E0B", width: 2 },
            },
          ],
        },
      ],
    },
  ],
};

// ページ4: 実装例とまとめ
const page4: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 32,
  gap: 20,
  alignItems: "stretch",
  backgroundColor: "FCE7F3",
  border: { color: "F9A8D4", width: 4 },
  children: [
    {
      type: "box",
      padding: 12,
      backgroundColor: "FFFFFF",
      border: { color: "EC4899", width: 2 },
      children: {
        type: "text",
        text: "実装のポイントとまとめ",
        fontPx: 32,
      },
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        // 左: 実装フロー
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: "F9A8D4", width: 2 },
              children: {
                type: "vstack",
                gap: 14,
                children: [
                  {
                    type: "text",
                    text: "【開発フロー】",
                    fontPx: 22,
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 40,
                        h: 40,
                        text: "1",
                        fontPx: 18,
                        fill: { color: "DBEAFE" },
                        line: { color: "3B82F6", width: 2 },
                      },
                      {
                        type: "text",
                        text: "型定義を先に設計",
                        fontPx: 16,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "downArrow",
                        w: 40,
                        h: 30,
                        fill: { color: "D1D5DB" },
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 40,
                        h: 40,
                        text: "2",
                        fontPx: 18,
                        fill: { color: "D1FAE5" },
                        line: { color: "10B981", width: 2 },
                      },
                      {
                        type: "text",
                        text: "テストを記述",
                        fontPx: 16,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "downArrow",
                        w: 40,
                        h: 30,
                        fill: { color: "D1D5DB" },
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 40,
                        h: 40,
                        text: "3",
                        fontPx: 18,
                        fill: { color: "FEF3C7" },
                        line: { color: "F59E0B", width: 2 },
                      },
                      {
                        type: "text",
                        text: "実装とリファクタリング",
                        fontPx: 16,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "downArrow",
                        w: 40,
                        h: 30,
                        fill: { color: "D1D5DB" },
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 40,
                        h: 40,
                        text: "4",
                        fontPx: 18,
                        fill: { color: "FCE7F3" },
                        line: { color: "EC4899", width: 2 },
                      },
                      {
                        type: "text",
                        text: "Lint・型チェック・レビュー",
                        fontPx: 16,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
        // 右: コード例画像とまとめ
        {
          type: "vstack",
          w: "50%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "1E293B",
              border: { color: "475569", width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "// 型安全な実装例",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "interface User {",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "  id: string;",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "  name: string;",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "}",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "async function getUser(",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "  id: string",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "): Promise<User> {",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "  return await api.get(id);",
                    fontPx: 14,
                  },
                  {
                    type: "text",
                    text: "}",
                    fontPx: 14,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 16,
              backgroundColor: "FFFFFF",
              border: { color: "F9A8D4", width: 2 },
              children: {
                type: "vstack",
                gap: 12,
                children: [
                  {
                    type: "text",
                    text: "【まとめ】",
                    fontPx: 22,
                  },
                  {
                    type: "text",
                    text: "TypeScriptのベストプラクティスを実践することで、バグの早期発見、コードの可読性向上、チーム開発の効率化を実現できます。適切なツール選定と規約の遵守が成功の鍵です。",
                    fontPx: 16,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: "F9A8D4", width: 2 },
      children: {
        type: "hstack",
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
        children: [
          {
            type: "shape",
            shapeType: "star5",
            w: 60,
            h: 60,
            fill: { color: "FCD34D" },
            line: { color: "F59E0B", width: 2 },
          },
          {
            type: "text",
            text: "型安全性 × 生産性 = より良いソフトウェア開発",
            fontPx: 22,
          },
          {
            type: "shape",
            shapeType: "star5",
            w: 60,
            h: 60,
            fill: { color: "FCD34D" },
            line: { color: "F59E0B", width: 2 },
          },
        ],
      },
    },
  ],
};

async function main() {
  await buildPptx(
    [page1, page2, page3, page4],
    { w: 1280, h: 720 },
    "sample.pptx",
  );
}

main();
