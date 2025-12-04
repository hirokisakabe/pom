import { POMNode, buildPptx } from "./src";

const palette = {
  background: "ECF0F6",
  navy: "0E0D6A",
  blue: "0E0D6A",
  lightBlue: "DBEAFE",
  accent: "0EA5E9",
  border: "E2E8F0",
  charcoal: "1E293B",
};

// ページ1: タイトル・コンセプト
const page1: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 22,
  gap: 10,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "box",
      padding: { top: 16, bottom: 16, left: 20, right: 20 },
      backgroundColor: palette.navy,
      border: { color: palette.navy, width: 2 },
      children: {
        type: "hstack",
        justifyContent: "spaceBetween",
        alignItems: "center",
        children: [
          {
            type: "vstack",
            gap: 4,
            children: [
              {
                type: "text",
                text: "ほげほげ株式会社",
                fontPx: 26,
                color: "FFFFFF",
              },
              {
                type: "text",
                text: "ふがふが事業本部",
                fontPx: 14,
                color: "E2E8F0",
              },
            ],
          },
          {
            type: "text",
            text: "Confidential",
            fontPx: 20,
            color: "FDE68A",
          },
        ],
      },
    },
    {
      type: "vstack",
      gap: 12,
      padding: 24,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: [
        {
          type: "text",
          text: "2024年度 技術投資計画",
          fontPx: 40,
          color: palette.charcoal,
          bold: true,
        },
        {
          type: "text",
          text: "企業DXを支える安定した開発体制と統制",
          fontPx: 20,
          color: palette.blue,
        },
        {
          type: "hstack",
          gap: 18,
          alignItems: "center",
          children: [
            {
              type: "shape",
              shapeType: "rect",
              w: 60,
              h: 4,
              fill: { color: palette.blue },
            },
            {
              type: "text",
              text: "取締役会 2024.04.12",
              fontPx: 14,
              color: palette.charcoal,
            },
          ],
        },
      ],
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "center",
      justifyContent: "spaceBetween",
      w: "100%",
      children: [
        {
          type: "hstack",
          gap: 20,
          children: [
            {
              type: "box",

              padding: { top: 12, bottom: 12, left: 20, right: 20 },
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 12,
                children: [
                  {
                    type: "text",
                    text: "背景",
                    fontPx: 18,
                    color: palette.charcoal,
                    bold: true,
                    fontFamily: "Noto Sans JP",
                  },
                  {
                    type: "text",
                    text: "・国内主要拠点の業務標準化とシステム統合が急務\n・品質ガバナンス強化を前提とした投資判断",
                    fontPx: 14,
                    color: palette.charcoal,
                    lineSpacingMultiple: 1.5,
                  },
                  {
                    type: "vstack",
                    padding: { top: 4, bottom: 4 },
                    children: [
                      {
                        type: "shape",
                        shapeType: "rect",
                        w: "100%",
                        h: 1,
                        fill: { color: palette.border },
                      },
                    ],
                  },
                  {
                    type: "text",
                    text: "目的",
                    bold: true,
                    fontPx: 18,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "・3拠点共通のエンジニアリング基盤を年度内に整備\n・外部委託費 15%削減 / 品質KPI 95%以上の維持",
                    fontPx: 14,
                  },
                ],
              },
            },
            {
              type: "vstack",
              gap: 12,
              children: [
                {
                  type: "box",
                  padding: { top: 12, bottom: 12, left: 18, right: 18 },
                  backgroundColor: palette.lightBlue,
                  border: { color: palette.blue, width: 2 },
                  children: {
                    type: "vstack",
                    gap: 3,
                    children: [
                      {
                        type: "text",
                        text: "投資総額",
                        fontPx: 14,
                        color: palette.blue,
                      },
                      {
                        type: "text",
                        text: "¥420M",
                        fontPx: 28,
                        color: palette.navy,
                      },
                      {
                        type: "text",
                        text: "前年度比 +8%",
                        fontPx: 12,
                        color: palette.charcoal,
                      },
                    ],
                  },
                },

                {
                  type: "box",
                  padding: 18,
                  backgroundColor: "FFFFFF",
                  border: { color: palette.border, width: 2 },
                  children: {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "lightningBolt",
                        w: 60,
                        h: 60,

                        fontPx: 16,
                        fill: { color: palette.lightBlue },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "社会的信頼・説明責任に資するIT投資",
                        fontPx: 13,
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },

        {
          type: "vstack",
          padding: { left: 20, right: 20 },
          children: [
            {
              type: "hstack",
              padding: { top: 4, bottom: 4 },
              gap: 10,
              children: [
                {
                  type: "box",
                  children: {
                    type: "image",
                    src: "./japan.png",
                    w: 150,
                    h: 150,
                  },
                },
                {
                  type: "vstack",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: { left: 4, right: 4 },
                  children: [
                    {
                      type: "shape",
                      shapeType: "rightArrow",
                      fill: { color: palette.blue },
                      w: 40,
                      h: 40,
                    },
                  ],
                },
                {
                  type: "box",
                  children: {
                    type: "image",
                    src: "./earth.png",
                    w: 150,
                    h: 150,
                  },
                },
              ],
            },
            {
              type: "text",
              text: "海外拠点展開を視野に入れた基盤整備",
              fontPx: 12,
              color: palette.charcoal,
              w: "100%",
              alignText: "center",
            },
          ],
        },
      ],
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "vstack",
        gap: 10,
        children: [
          {
            type: "text",
            text: "エグゼクティブサマリー",
            fontPx: 18,
            color: palette.charcoal,
          },
          {
            type: "text",
            text: "・IT投資ROIは営業利益への直接貢献を評価指標とし、既存システム更新と成長投資を両輪で推進する。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "・3拠点での業務標準化に向け、ワークフロー/権限設計を統一し、アプリラインごとに責任者を配置する。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "・年度後半での海外拠点展開を見据え、セキュリティ審査手続きとクラウド運用統制を事前に整備する。",
            fontPx: 13,
          },
        ],
      },
    },
    {
      type: "text",
      text: "Prepared by HogeHoge Div. / 更新日: 2024-04-05",
      fontPx: 12,
      color: palette.charcoal,
    },
  ],
};

async function main() {
  const pptx = await buildPptx([page1], {
    w: 1280,
    h: 720,
  });

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
