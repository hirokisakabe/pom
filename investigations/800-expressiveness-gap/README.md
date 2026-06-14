# Investigation #800 — HTML スライドとの再現比較による pom の表現力ギャップ洗い出し

## 目的

同一のお題のスライドを「自由度の高い HTML+CSS」と「pom XML」の両方で生成し、画像レベルで比較することで、pom の表現力ギャップを **AI が実際に使いたがる表現** ベースで洗い出す。机上のスキーマ比較ではなく「自由なときに何を選び、制約下で何を諦めたか」を観察するアプローチ。

机上の事前比較で起票済みの #793〜#798（グラデーション / 回転 / 辺ごと border / letterSpacing / flex 比率 / 文字エフェクト）は本調査開始時点ですべて CLOSED。本調査ではそれら閉じた機能が実際に AI 自身の制作物に現れるかを確認しつつ、**未発見の機能ギャップ・語彙ギャップ・PPTX 原理限界** を洗い出すことに重きを置く。

## 方法

1. デッキ全体の共通お題（コンテキスト）を 1 つ決める: 「FY2026 Q3 SaaS プロダクトレビュー」
2. アーキタイプを 6 種定義: 表紙 / アジェンダ / KPI ダッシュボード / 2 案比較 / タイムライン / 引用・キーメッセージ
3. 各アーキタイプについて、同一のサブテーマで HTML 版（`slide.html`）と pom 版（`slide.pom.xml`）を作成
4. HTML はブラウザでスクリーンショット、pom は `pom-cli render` で PNG 化
5. 画像ペアを並べて差分を観察し、以下 3 分類でアクション化:
   - **機能ギャップ** — pom に表現手段がない
   - **語彙ギャップ** — pom はできるのに AI（自分自身）が使えていない（`pom-slide` skill / `llm.txt` の改善対象）
   - **PPTX 原理限界** — PPTX 仕様上不可能。既知の限界 + 代替表現として整理

## ディレクトリ構成

```
investigations/800-expressiveness-gap/
├── README.md            # この文書
├── archetypes.md        # アーキタイプ定義と共通お題
├── findings.md          # 3 分類によるギャップ一覧と推奨アクション
├── title/               # 表紙
│   ├── slide.html
│   ├── slide.html.png
│   ├── slide.pom.xml
│   └── slide.pom.xml.png
├── agenda/              # アジェンダ
├── kpi-dashboard/       # KPI ダッシュボード
├── comparison/          # 2 案比較
├── timeline/            # タイムライン
└── key-message/         # 引用・キーメッセージ
```

## 再現手順（手動）

セルフ調査時の手順を残しておく。将来の機能追加後に同じお題で回せば、画像比較で改善を確認できる。

### 1. ローカル準備

```bash
pnpm install
pnpm --filter @hirokisakabe/pom run build
pnpm --filter @hirokisakabe/pom-md run build
pnpm --filter @hirokisakabe/pom-cli run build
```

### 2. HTML 版のスクリーンショット

`investigations/800-expressiveness-gap/<archetype>/slide.html` をブラウザで開き、デベロッパーツールで viewport を 1280x720 に揃えて全画面スクリーンショットを `slide.html.png` として保存。本調査では Chrome DevTools MCP の `take_screenshot` を利用した。

### 3. pom 版の PNG レンダリング

```bash
cd investigations/800-expressiveness-gap/<archetype>
node ../../../packages/pom-cli/dist/cli.js render slide.pom.xml -o .
```

レンダリング結果 `slide-001.png` を `slide.pom.xml.png` にリネーム（または上書きコピー）して保存する。

## 結論サマリ

詳細は [`findings.md`](./findings.md) を参照。要点のみ抜粋:

- **機能ギャップ**: 未発見 / 既存 issue で十分カバー済み（実例レベルで決定的に欠ける表現は確認できなかった）
- **語彙ギャップ**: 大きい。`pom-slide` skill / `llm.txt` で示しきれていない実装パターン（`backgroundGradient` + `glow` + `letterSpacing` の組み合わせ、`Layer` を使った装飾要素配置、`Theme` トークンの徹底）を強化することで AI の制作物が大きく底上げできる
- **PPTX 原理限界**: backdrop-filter blur / カスタム CSS フィルタ / 任意フォントのウェブロードは pptxgenjs / PowerPoint の枠の外。代替表現として「半透明 surface 色 + drop shadow」「画像書き出し前提のセクション」を整理した

## スコープ外

- 比較パイプラインの完全自動化（手動で 6 アーキタイプ回した結果を見て、価値が確認できたら別 issue で自動化検討）
- ピクセル単位の一致を狙うこと（HTML 版はデザイン意図の参照であり絶対の正解ではない）
- 差分の解消そのもの（機能追加・skill 改善は本調査結果に基づき別 issue で実施）

## 関連

- 起票元: #800
- 机上の事前比較で起票済み（すべて本調査開始時点で CLOSED）: #793 / #794 / #795 / #796 / #797 / #798
- VRT パイプライン: `packages/pom/vrt/`
- `pom-slide` skill: `skills/pom-slide/SKILL.md`
- `llm.txt`: `apps/website/public/llm.txt`
