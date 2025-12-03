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
          type: "text",
          text: "2024年度 技術投資計画",
          fontPx: 40,
          color: palette.charcoal,
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
              },
              {
                type: "text",
                text: "・国内主要拠点の業務標準化とシステム統合が急務\n・社内開発リソースの再配置により俊敏性を確保\n・品質ガバナンス強化を前提とした投資判断",
                fontPx: 14,
                color: palette.charcoal,
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

// ページ2: アジェンダとメッセージ
const page2: POMNode = {
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
      padding: 18,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "hstack",
        gap: 16,
        alignItems: "center",
        children: [
          {
            type: "shape",
            shapeType: "rect",
            w: 8,
            h: 60,
            fill: { color: palette.blue },
          },
          {
            type: "text",
            text: "本日の進行",
            fontPx: 28,
            color: palette.charcoal,
          },
        ],
      },
    },
    {
      type: "hstack",
      gap: 24,
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "55%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 16,
            children: [
              {
                type: "text",
                text: "アジェンダ",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "table",
                defaultRowHeight: 36,
                columns: [{ width: 80 }, { width: 230 }, { width: 120 }],
                rows: [
                  {
                    cells: [
                      {
                        text: "時間",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "テーマ",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "担当",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                    ],
                  },
                  {
                    cells: [
                      { text: "09:00", fontPx: 13 },
                      { text: "開会挨拶・目的共有", fontPx: 13 },
                      { text: "社長", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "09:10", fontPx: 13 },
                      { text: "技術投資計画 概要", fontPx: 13 },
                      { text: "CIO", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "09:30", fontPx: 13 },
                      { text: "重点施策・KPI", fontPx: 13 },
                      { text: "CTO", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "09:50", fontPx: 13 },
                      { text: "投資判断のポイント", fontPx: 13 },
                      { text: "経営企画", fontPx: 13 },
                    ],
                  },
                  {
                    cells: [
                      { text: "10:05", fontPx: 13 },
                      { text: "質疑応答", fontPx: 13 },
                      { text: "全員", fontPx: 13 },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "vstack",
          w: "45%",
          gap: 18,
          children: [
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
                    text: "キーメッセージ",
                    fontPx: 18,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "・成長事業とコアシステム双方での投資バランス\n・開発の内製化率向上による継続的コスト最適化\n・セキュリティ/品質指標を経営指標に連動",
                    fontPx: 13,
                  },
                ],
              },
            },
            {
              type: "box",
              padding: 18,
              backgroundColor: palette.lightBlue,
              border: { color: palette.blue, width: 2 },
              children: {
                type: "hstack",
                gap: 12,
                alignItems: "center",
                children: [
                  {
                    type: "shape",
                    shapeType: "triangle",
                    w: 40,
                    h: 40,
                    fill: { color: palette.blue },
                    line: { color: palette.blue, width: 2 },
                  },
                  {
                    type: "text",
                    text: "リスクと対策をセットで提示",
                    fontPx: 14,
                    color: palette.navy,
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
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "意思決定ポイント",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "1. 投資優先順位 / 2. 投資額上限 / 3. モニタリング手法",
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
      type: "hstack",
      gap: 18,
      alignItems: "stretch",
      children: [
        {
          type: "box",
          w: "55%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "意思決定材料",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・KPIの算定根拠: 内製化率は稼働時間ベースで算出\n・ROI試算: 5年累計NPV +¥1.4B, IRR 28%\n・依存関係: 人事制度改定/海外DC統合/監査部門レビュー",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・システム更改ロードマップは別添Appendix-01を参照。DX推進委員会による承認済み。",
                fontPx: 13,
              },
            ],
          },
        },
        {
          type: "box",
          w: "45%",
          padding: 20,
          backgroundColor: palette.lightBlue,
          border: { color: palette.blue, width: 2 },
          children: {
            type: "vstack",
            gap: 8,
            children: [
              {
                type: "text",
                text: "コミュニケーション計画",
                fontPx: 18,
                color: palette.navy,
              },
              {
                type: "text",
                text: "・役員ブリーフィング: 月次\n・現場説明会: 各事業部で隔週開催\n・Slack #it-strategy に議事録・FAQ集約",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・議論想定論点: コスト抑制策、外部監査対応、海外/R&D拠点への展開可否。",
                fontPx: 13,
              },
            ],
          },
        },
      ],
    },
    {
      type: "box",
      padding: 16,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "text",
        text: "備考: 提示資料は社内ポータルに掲載予定。会議終了後24時間以内にフィードバックを集約します。",
        fontPx: 12,
        color: palette.charcoal,
      },
    },
  ],
};

// ページ3: 重点施策とKPI
const page3: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "重点施策と管理指標",
      fontPx: 28,
      color: palette.charcoal,
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "stretch",
      children: [
        {
          type: "vstack",
          w: "55%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 18,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "① 共通開発基盤",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "クラウドネイティブ基盤を社内標準化。テンプレート提供と教育で現場浸透を促進。",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: 主要サービス 90%移行",
                    fontPx: 12,
                    color: palette.blue,
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
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "② データ利活用高度化",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "営業・生産情報を横断するデータレイク構築。ダッシュボードを全事業部へ提供。",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: 可視化指標 35件",
                    fontPx: 12,
                    color: palette.blue,
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
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "③ セキュリティ自動化",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "ゼロトラスト前提のアクセス制御と脆弱性検知自動化を推進。",
                    fontPx: 13,
                  },
                  {
                    type: "text",
                    text: "KPI: インシデント MTTR -40%",
                    fontPx: 12,
                    color: palette.blue,
                  },
                ],
              },
            },
          ],
        },
        {
          type: "box",
          w: "45%",
          padding: 20,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 14,
            children: [
              {
                type: "text",
                text: "主要KPI",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "table",
                defaultRowHeight: 34,
                columns: [{ width: 160 }, { width: 120 }],
                rows: [
                  {
                    cells: [
                      {
                        text: "指標",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                      {
                        text: "2024目標",
                        fontPx: 14,
                        bold: true,
                        backgroundColor: palette.lightBlue,
                      },
                    ],
                  },
                  {
                    cells: [
                      { text: "リリース品質 (欠陥率)", fontPx: 12 },
                      { text: "0.12%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "内製化率", fontPx: 12 },
                      { text: "55%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "開発リードタイム", fontPx: 12 },
                      { text: "-20%", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "重大インシデント件数", fontPx: 12 },
                      { text: "0", fontPx: 12 },
                    ],
                  },
                  {
                    cells: [
                      { text: "社員教育受講率", fontPx: 12 },
                      { text: "95%", fontPx: 12 },
                    ],
                  },
                ],
              },
              {
                type: "vstack",
                gap: 6,
                children: [
                  {
                    type: "text",
                    text: "評価方法",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "四半期レビューで進捗を定量化し、経営指標と連動させる。",
                    fontPx: 12,
                  },
                ],
              },
            ],
          },
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
            text: "施策詳細",
            fontPx: 18,
            color: palette.charcoal,
          },
          {
            type: "text",
            text: "① 共通開発基盤: 規約テンプレート/CIセット/監査証跡の標準化により、プロジェクト開始時のセットアップ工数を40%削減。外部委託案件も同一基盤を義務化し、コード品質の可視化ダッシュボードを全役職へ展開。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "② データ利活用: データレイクに対してデータプロダクト単位で責任者を配置し、業務部門自らがKPI定義/SQLテンプレート作成を行える運営体制を敷く。BCP観点ではDRサイト自動同期と暗号化キー管理を統一。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "③ セキュリティ自動化: アクセスレビュー/脆弱性診断/ログモニタリングを自動連携し、検知から封じ込めまでの平均時間を短縮。SOC/CSIRT/IT企画が共通のワークフローで意思決定することで、経営レポーティングも月次で自動集計。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "④ 人材戦略: エンジニア評価制度と連動したスキルマップを整備し、アウトプットをKPIと紐付ける。ビジネス部門と共催でワークショップを行い、要求整理力の底上げを図る。",
            fontPx: 13,
          },
          {
            type: "text",
            text: "⑤ 事業連携: サプライチェーン/グループ会社向けのAPI公開ポリシーを策定し、外部ベンダーとの共同開発におけるガイドラインを整備。これにより、追加収益機会を探索すると同時に統制ラインを確保する。",
            fontPx: 13,
          },
        ],
      },
    },
    {
      type: "box",
      padding: 20,
      backgroundColor: "FFFFFF",
      border: { color: palette.border, width: 2 },
      children: {
        type: "hstack",
        gap: 18,
        alignItems: "start",
        children: [
          {
            type: "vstack",
            w: "55%",
            gap: 8,
            children: [
              {
                type: "text",
                text: "リスク・依存関係",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・海外拠点のネットワーク更新計画遅延→グローバルインフラ部門と合同の臨時タスクフォースを組成済み。\n・BPO委託更新: 既存契約の更改リードを見直し、SLAの段階導入で品質を確保。",
                fontPx: 13,
              },
              {
                type: "text",
                text: "・データ利活用における個人情報取り扱い: プライバシー委員会と連携し、マスキング/匿名加工の自動ルールを年内実装。",
                fontPx: 13,
              },
            ],
          },
          {
            type: "vstack",
            w: "45%",
            gap: 8,
            children: [
              {
                type: "text",
                text: "連動施策",
                fontPx: 16,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "1. 品質保証部門: 自動テストカバレッジ指標を品質会議で共有\n2. 人事部門: キャリアパス設計と評価テーブルの更新\n3. 監査部門: ITGC/サイバー監査の観点を共通基盤へ組み込み",
                fontPx: 13,
              },
              {
                type: "text",
                text: "各部門の成果報告はPowerBIテンプレート化し、役員会議での進捗報告に再利用できるようデータ構造を統一。",
                fontPx: 13,
              },
            ],
          },
        ],
      },
    },
    {
      type: "box",
      padding: 18,
      backgroundColor: palette.lightBlue,
      border: { color: palette.blue, width: 2 },
      children: {
        type: "text",
        text: "ガバナンス: CIO直轄のPMOが横断ルールを定め、各事業部の投資効果をモニタリングします。",
        fontPx: 13,
        color: palette.navy,
      },
    },
  ],
};

// ページ4: 推進体制とスケジュール
const page4: POMNode = {
  type: "vstack",
  w: "100%",
  h: "max",
  padding: 48,
  gap: 24,
  alignItems: "stretch",
  backgroundColor: palette.background,
  children: [
    {
      type: "text",
      text: "推進体制・スケジュール",
      fontPx: 28,
      color: palette.charcoal,
    },
    {
      type: "hstack",
      gap: 20,
      alignItems: "start",
      children: [
        {
          type: "box",
          w: "60%",
          padding: 22,
          backgroundColor: "FFFFFF",
          border: { color: palette.border, width: 2 },
          children: {
            type: "vstack",
            gap: 12,
            children: [
              {
                type: "text",
                text: "ロードマップ",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "vstack",
                gap: 10,
                children: [
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q1",
                        fontPx: 14,
                        fill: { color: palette.lightBlue },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "現状分析・要件定義 / 主要メンバー確定",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q2",
                        fontPx: 14,
                        fill: { color: "FFFFFF" },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "共通基盤リリース / データレイク構築着手",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q3",
                        fontPx: 14,
                        fill: { color: palette.lightBlue },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "セキュリティオートメーション展開 / KPIレビュー",
                        fontPx: 13,
                      },
                    ],
                  },
                  {
                    type: "hstack",
                    gap: 10,
                    alignItems: "center",
                    children: [
                      {
                        type: "shape",
                        shapeType: "ellipse",
                        w: 34,
                        h: 34,
                        text: "Q4",
                        fontPx: 14,
                        fill: { color: "FFFFFF" },
                        line: { color: palette.blue, width: 2 },
                      },
                      {
                        type: "text",
                        text: "最終評価 / 次年度計画とロードマップ策定",
                        fontPx: 13,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        },
        {
          type: "vstack",
          w: "40%",
          gap: 16,
          children: [
            {
              type: "box",
              padding: 20,
              backgroundColor: "FFFFFF",
              border: { color: palette.border, width: 2 },
              children: {
                type: "vstack",
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "推進体制",
                    fontPx: 18,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "・経営直轄PMO: 企画/進捗管理\n・CTO室: 技術支援 / 標準整備\n・各事業部: 実装 / 効果測定",
                    fontPx: 13,
                  },
                ],
              },
            },
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
                    text: "ガバナンス",
                    fontPx: 16,
                    color: palette.navy,
                  },
                  {
                    type: "text",
                    text: "月次ステアリングコミッティで課題共有、重要リスクは即日シニアレビュー。",
                    fontPx: 12,
                    color: palette.navy,
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
                gap: 8,
                children: [
                  {
                    type: "text",
                    text: "次のアクション",
                    fontPx: 16,
                    color: palette.charcoal,
                  },
                  {
                    type: "text",
                    text: "承認後2週間でキックオフ。進捗はPowerBIで役員へ週次共有。",
                    fontPx: 12,
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
        type: "hstack",
        gap: 18,
        alignItems: "start",
        children: [
          {
            type: "vstack",
            w: "55%",
            gap: 10,
            children: [
              {
                type: "text",
                text: "役割責任 (RACI)",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "R: PMO, A: CIO, C: CTO室/監査, I: 事業本部\nQ2以降は海外IT統括もRACIに追加し、意思決定の一貫性を担保。",
                fontPx: 13,
              },
              {
                type: "text",
                text: "業務部門のプロダクトオーナーをリード役に据え、各施策のアウトカム/KPIへの責任範囲を明文化する。",
                fontPx: 13,
              },
            ],
          },
          {
            type: "vstack",
            w: "45%",
            gap: 10,
            children: [
              {
                type: "text",
                text: "主要成果物",
                fontPx: 18,
                color: palette.charcoal,
              },
              {
                type: "text",
                text: "・統合ロードマップ (ver.4.2)\n・共通基盤Runbook + Playbook\n・セキュリティ自動化ハンドブック\n・データガバナンス規程/教育資料",
                fontPx: 13,
              },
              {
                type: "text",
                text: "成果物はTeams SharePointにて管理し、最終承認版はConfluenceでナレッジ化。",
                fontPx: 13,
              },
            ],
          },
        ],
      },
    },
    {
      type: "text",
      text: "お問い合わせ: Corporate IT Planning Division / planning@sakura-tech.co.jp",
      fontPx: 12,
      color: palette.charcoal,
    },
  ],
};

async function main() {
  const pptx = await buildPptx(
    [page1, page2, page3, page4],
    {
      w: 1280,
      h: 720,
    },
    {
      master: {
        header: {
          type: "hstack",
          h: 40,
          padding: { left: 48, right: 48, top: 12, bottom: 0 },
          justifyContent: "spaceBetween",
          alignItems: "center",
          backgroundColor: palette.navy,
          children: [
            {
              type: "text",
              text: "桜テックホールディングス",
              fontPx: 14,
              color: "FFFFFF",
            },
            {
              type: "text",
              text: "{{date}}",
              fontPx: 12,
              color: "E2E8F0",
            },
          ],
        },
        footer: {
          type: "hstack",
          h: 30,
          padding: { left: 48, right: 48, top: 0, bottom: 8 },
          justifyContent: "spaceBetween",
          alignItems: "center",
          children: [
            {
              type: "text",
              text: "Confidential",
              fontPx: 10,
              color: palette.charcoal,
            },
            {
              type: "text",
              text: "Page {{page}} / {{totalPages}}",
              fontPx: 10,
              color: palette.charcoal,
              alignText: "right",
            },
          ],
        },
        date: {
          format: "YYYY/MM/DD",
        },
      },
    },
  );

  await pptx.writeFile({ fileName: "sample.pptx" });
}

main();
