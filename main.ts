import { POMNode, buildPptx } from "./src";

const palette = {
  background: "F8FAFC",
  navy: "0F172A",
  blue: "1D4ED8",
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
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "box",
      padding: 20,
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
                text: "桜テックホールディングス",
                fontPx: 26,
                color: "FFFFFF",
              },
              {
                type: "text",
                text: "Technology Strategy Briefing / FY2024",
                fontPx: 14,
                color: "E2E8F0",
              },
            ],
          },
          {
            type: "text",
            text: "Confidential",
            fontPx: 16,
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
          type: "image",
          src: "./150x150.png",
        },
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
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "60%",
          padding: 20,
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
                text: "・国内主要拠点の業務標準化とシステム統合が急務\n・社内開発リソースの再配置により俊敏性を確保\n・品質ガバナンス強化を前提とした投資判断",
                fontPx: 14,
                color: palette.charcoal,
                lineSpacingMultiple: 1.5,
              },
              {
                type: "shape",
                shapeType: "rect",
                w: "100%",
                h: 1,
                fill: { color: palette.border },
              },
              {
                type: "text",
                text: "目的",
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
          w: "40%",
          gap: 12,
          children: [
            {
              type: "box",
              padding: 18,
              backgroundColor: palette.lightBlue,
              border: { color: palette.blue, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
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
                type: "vstack",
                gap: 6,
                children: [
                  {
                    type: "text",
                    text: "重点領域",
                    fontPx: 14,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "1. 社内サービスPF刷新\n2. データ利活用高度化\n3. セキュリティオートメーション",
                    fontPx: 13,
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
                    shapeType: "ellipse",
                    w: 60,
                    h: 60,
                    text: "ESG",
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
          {
            type: "text",
            text: "・人材投資：シニアエンジニア比率を20%→28%へ。採用/育成リードタイム短縮のため内製アカデミーを拡充。",
            fontPx: 13,
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 16,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "50%",
          padding: 18,
          backgroundColor: palette.lightBlue,
          border: { color: palette.blue, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "主要リスク",
                fontPx: 16,
                color: palette.navy,
              },
              {
                type: "text",
                text: "・要件定義遅延による業務側の巻き戻し\n・共通基盤リリース後の性能チューニング不足\n・外部委託先ガバナンスの一時的低下",
                fontPx: 13,
              },
            ],
          },
        },
        {
          type: "box",
          w: "50%",
          padding: 18,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "対策・コミュニケーション",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・PMO直轄レビューを隔週で実施し、論点を役員向けメモ化\n・性能観点ではSLO測定基盤を同時導入\n・委託先は契約更新時にSLO連動の成果報酬へ",
                fontPx: 13,
              },
            ],
          },
        },
      ],
    },
    {
      type: "text",
      text: "Prepared by Corporate IT Planning Div. / 更新日: 2024-04-05",
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
