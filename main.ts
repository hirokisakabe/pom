import { POMNode, buildPptx } from "./src";

const page: POMNode = {
  type: "vstack",
  w: 1280,
  h: 720,
  padding: { top: 16, bottom: 16, left: 24, right: 24 },
  gap: 12,
  children: [
    // ヘッダー部分
    {
      type: "hstack",
      justifyContent: "spaceBetween",
      alignItems: "center",
      children: [
        {
          type: "text",
          text: "【2024年度 上期統括】エグゼクティブサマリー",
          fontPx: 28,
          bold: true,
        },
        {
          type: "vstack",
          alignItems: "end",
          gap: 2,
          w: 160,
          children: [
            {
              type: "text",
              text: "株式会社サンプル",
              fontPx: 14,
            },
            {
              type: "text",
              text: "2024年10月1日",
              fontPx: 12,
              color: "64748B",
            },
          ],
        },
      ],
    },
    // 全体総括メッセージ
    {
      type: "box",
      backgroundColor: "E8F1FB",
      padding: 12,
      border: { color: "1E3A5F", width: 2 },
      children: {
        type: "vstack",
        gap: 6,
        children: [
          {
            type: "text",
            text: "▼ 全体総括メッセージ（最重要結論）",
            fontPx: 18,
            bold: true,
            color: "1D4ED8",
          },
          {
            type: "text",
            text: "上期は主力事業の伸長により、売上・利益ともに計画を達成（増収増益）。下期は円安基調を追い風に、海外市場への投資を加速し、通期目標の上方修正を目指す。",
            fontPx: 16,
            bold: true,
            lineSpacingMultiple: 1.3,
          },
        ],
      },
    },
    // メインコンテンツ（左右2カラム）
    {
      type: "hstack",
      gap: 20,
      children: [
        // 左カラム：業績ハイライト
        {
          type: "vstack",
          gap: 8,
          w: 620,
          children: [
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 6,
              children: {
                type: "text",
                text: "1. 上期 業績ハイライト（連結）",
                fontPx: 16,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "table",
              columns: [
                { width: 90 },
                { width: 90 },
                { width: 90 },
                { width: 120 },
                { width: 100 },
              ],
              rows: [
                {
                  height: 28,
                  cells: [
                    {
                      text: "項目",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "上期予算",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "上期実績",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "計画比",
                      bold: true,
                      backgroundColor: "166534",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "前年同期比",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    {
                      text: "売上高",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    {
                      text: "500.0億円",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    {
                      text: "525.3億円",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    {
                      text: "+5.1%（105%）",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    {
                      text: "+8.3% ↗",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    { text: "営業利益", fontPx: 12 },
                    { text: "50.0億円", fontPx: 12 },
                    { text: "58.0億円", fontPx: 12 },
                    {
                      text: "+16.0%（116%）",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    { text: "+12.5% ↗", fontPx: 12 },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    {
                      text: "営業利益率",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    { text: "10.0%", backgroundColor: "F1F5F9", fontPx: 12 },
                    { text: "11.0%", backgroundColor: "F1F5F9", fontPx: 12 },
                    {
                      text: "+1.0pt",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    {
                      text: "+0.4pt ↗",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    { text: "当期純利益", fontPx: 12 },
                    { text: "35.0億円", fontPx: 12 },
                    { text: "39.2億円", fontPx: 12 },
                    {
                      text: "+12.0%（112%）",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    { text: "+9.0% ↗", fontPx: 12 },
                  ],
                },
              ],
            },
            {
              type: "text",
              text: "● 国内事業：新製品「モデルX」が計画比+20%と牽引し、シェア拡大\n● 海外事業：北米市場が堅調。為替影響（円安）もプラスに寄与（+15億円）",
              fontPx: 13,
              lineSpacingMultiple: 1.4,
            },
          ],
        },
        // 右カラム：重要施策 + アクションプラン
        {
          type: "vstack",
          gap: 8,
          w: 590,
          children: [
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 6,
              children: {
                type: "text",
                text: "2. 重要施策の進捗状況（KPI）",
                fontPx: 16,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "table",
              columns: [{ width: 200 }, { width: 80 }, { width: 200 }],
              rows: [
                {
                  height: 26,
                  cells: [
                    {
                      text: "施策名",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "状況",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                    {
                      text: "進捗・課題コメント",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                      fontPx: 12,
                    },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    {
                      text: "① DXによる販管費削減",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    {
                      text: "順調",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    {
                      text: "電子契約導入完了",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    { text: "② 新工場の稼働安定化", fontPx: 12 },
                    {
                      text: "やや遅延",
                      backgroundColor: "FEE2E2",
                      color: "DC2626",
                      bold: true,
                      fontPx: 12,
                    },
                    { text: "設備調整に時間要す", fontPx: 12 },
                  ],
                },
                {
                  height: 26,
                  cells: [
                    {
                      text: "③ サステナビリティ推進",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                    {
                      text: "順調",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                      fontPx: 12,
                    },
                    {
                      text: "CO2排出量削減スコア向上",
                      backgroundColor: "F1F5F9",
                      fontPx: 12,
                    },
                  ],
                },
              ],
            },
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 6,
              children: {
                type: "text",
                text: "3. 下期のアクションプランと経営課題",
                fontPx: 16,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "hstack",
              gap: 16,
              children: [
                {
                  type: "vstack",
                  gap: 4,
                  w: 280,
                  children: [
                    {
                      type: "text",
                      text: "▼ 成長戦略（攻め）",
                      fontPx: 14,
                      bold: true,
                      color: "1D4ED8",
                    },
                    {
                      type: "text",
                      text: "・国内販管費の削減継続\n・海外北米市場への投資拡大\n・新製品ラインナップ強化",
                      fontPx: 12,
                      lineSpacingMultiple: 1.3,
                    },
                  ],
                },
                {
                  type: "vstack",
                  gap: 4,
                  w: 280,
                  children: [
                    {
                      type: "text",
                      text: "▼ リスク管理（守り）",
                      fontPx: 14,
                      bold: true,
                      color: "DC2626",
                    },
                    {
                      type: "text",
                      text: "・為替変動リスクのヘッジ強化\n・サプライチェーン多元化\n・コンプライアンス体制強化",
                      fontPx: 12,
                      lineSpacingMultiple: 1.3,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

async function main() {
  const pptx = await buildPptx([page], {
    w: 1280,
    h: 720,
  });

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
