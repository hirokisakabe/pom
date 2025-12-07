import { POMNode, buildPptx } from "./src";

const page: POMNode = {
  type: "vstack",
  w: 1280,
  h: 720,
  padding: { top: 4, bottom: 4, left: 12, right: 12 },
  gap: 12,
  children: [
    {
      type: "hstack",
      justifyContent: "spaceBetween",
      alignItems: "start",
      children: [
        {
          type: "text",
          text: "【2024年度 上期統括】エグゼクティブサマリー",
          fontPx: 32,
          bold: true,
        },
        {
          type: "vstack",
          alignItems: "end",
          gap: 4,
          children: [
            {
              type: "text",
              text: "株式会社サンプル",
              fontPx: 16,
            },
            {
              type: "text",
              text: "2024年10月1日",
              fontPx: 14,
              color: "64748B",
            },
          ],
        },
      ],
    },
    {
      type: "box",
      backgroundColor: "E8F1FB",
      padding: 12,
      border: { color: "1E3A5F", width: 2 },
      children: {
        type: "vstack",
        gap: 8,
        children: [
          {
            type: "text",
            text: "▼ 全体総括メッセージ（最重要結論）",
            fontPx: 30,
            bold: true,
            color: "1D4ED8",
          },
          {
            type: "text",
            text: "上期は主力事業の伸長により、売上・利益ともに計画を達成（増収増益）。\n下期は円安基調を追い風に、海外市場への投資を加速し、通期目標の上方修正を目指す。",
            fontPx: 30,
            bold: true,
            lineSpacingMultiple: 1,
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 24,
      children: [
        {
          type: "vstack",
          gap: 16,
          children: [
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 4,
              children: {
                type: "text",
                text: "1. 上期 業績ハイライト（連結）",
                fontPx: 26,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "table",
              columns: [
                { width: 120 },
                { width: 160 },
                { width: 100 },
                { width: 160 },
                { width: 100 },
              ],
              rows: [
                {
                  height: 36,
                  cells: [
                    {
                      text: "項目",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                    {
                      text: "上期予算（計画）",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                    {
                      text: "上期実績",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                    {
                      text: "計画比（達成率）",
                      bold: true,
                      backgroundColor: "166534",
                      color: "FFFFFF",
                    },
                    {
                      text: "前年同期比",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                  ],
                },
                {
                  height: 36,
                  cells: [
                    { text: "売上高", backgroundColor: "F1F5F9" },
                    { text: "500.0", backgroundColor: "F1F5F9" },
                    { text: "525.3", backgroundColor: "F1F5F9" },
                    {
                      text: "+5.1%（105%）",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    { text: "+8.3% ↗", backgroundColor: "F1F5F9" },
                  ],
                },
                {
                  height: 36,
                  cells: [
                    { text: "営業利益" },
                    { text: "50.0" },
                    { text: "58.0" },
                    {
                      text: "+16.0%（116%）",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    { text: "+12.5% ↗" },
                  ],
                },
                {
                  height: 36,
                  cells: [
                    { text: "営業利益率", backgroundColor: "F1F5F9" },
                    { text: "10.0%", backgroundColor: "F1F5F9" },
                    { text: "11.0%", backgroundColor: "F1F5F9" },
                    {
                      text: "+1.0pt",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    { text: "+0.4pt ↗", backgroundColor: "F1F5F9" },
                  ],
                },
                {
                  height: 36,
                  cells: [
                    { text: "当期純利益" },
                    { text: "35.0" },
                    { text: "39.2" },
                    {
                      text: "+12.0%",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    { text: "+9.0% ↗" },
                  ],
                },
              ],
            },
            {
              type: "text",
              text: "● 国内事業：新製品「モデルX」が計画比+20%と牽引し、シェア拡大。\n● 海外事業：北米市場が堅調。為替影響（円安）もプラスに寄与（+15億円）。",
              fontPx: 18,
              bold: true,
              lineSpacingMultiple: 1.4,
            },
          ],
        },
        {
          type: "vstack",
          gap: 16,
          w: "max",
          children: [
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 4,
              children: {
                type: "text",
                text: "2. 重要施策の進捗状況（KPI）",
                fontPx: 26,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "table",
              columns: [{ width: 220 }, { width: 80 }, { width: 220 }],
              rows: [
                {
                  cells: [
                    {
                      text: "施策名",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                    {
                      text: "状況",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                    {
                      text: "進捗・課題コメント",
                      bold: true,
                      backgroundColor: "1E3A5F",
                      color: "FFFFFF",
                    },
                  ],
                },
                {
                  cells: [
                    { text: "① DXによる販管費削減", backgroundColor: "F1F5F9" },
                    {
                      text: "順調",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    { text: "電子契約導入完了", backgroundColor: "F1F5F9" },
                  ],
                },
                {
                  cells: [
                    { text: "② 新工場の稼働安定化" },
                    {
                      text: "やや遅延",
                      backgroundColor: "FEE2E2",
                      color: "DC2626",
                      bold: true,
                    },
                    { text: "設備調整に時間要す" },
                  ],
                },
                {
                  cells: [
                    {
                      text: "③ サステナビリティ推進",
                      backgroundColor: "F1F5F9",
                    },
                    {
                      text: "順調",
                      backgroundColor: "DCFCE7",
                      color: "166534",
                      bold: true,
                    },
                    {
                      text: "CO2排出量削減スコア向上",
                      backgroundColor: "F1F5F9",
                    },
                  ],
                },
              ],
            },
            {
              type: "box",
              backgroundColor: "1E3A5F",
              padding: 4,
              children: {
                type: "text",
                text: "3. 下期のアクションプランと経営課題",
                fontPx: 26,
                bold: true,
                color: "FFFFFF",
              },
            },
            {
              type: "vstack",
              gap: 4,
              children: [
                {
                  type: "text",
                  text: "▼ 成長戦略（攻めのアクション）",
                  fontPx: 18,
                  bold: true,
                  color: "1D4ED8",
                },
                {
                  type: "text",
                  text: "・国内事業販管費の削減、売上・利益も計画を達成\n・海外事業は北米市場が堅調。為替市場投資施策を拡大",
                  fontPx: 18,
                  lineSpacingMultiple: 1.4,
                },
              ],
            },
            {
              type: "vstack",
              gap: 4,
              children: [
                {
                  type: "text",
                  text: "▼ リスク管理と課題（守りのアクション）",
                  fontPx: 18,
                  bold: true,
                  color: "DC2626",
                },
                {
                  type: "text",
                  text: "・海外市場施策費用増を軽減し、堅実への課題を目指す\n・海外市場投資施策における為替管理の課題\n・海外市場のリテラシー高め海外市場を攻略",
                  fontPx: 18,
                  lineSpacingMultiple: 1.4,
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
