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

- **机上で既起票済みの #793〜#798 はすべて妥当だった**（実例で叩いても投資対効果の優先順位は変わらない）。本調査で重要だったのは「机上見立ての答え合わせ」と「未発見ギャップの洗い出し」の両輪
- **未発見の決定的な機能ギャップは「テキストグラデーション (A1)」と「`backgroundGradient` の radial サポート (A2)」の 2 つ**。両者とも表紙の華やかさを左右する基幹機能で、pptxgenjs 経由（または XML 後処理）で実装可能
- **`borderTop` × `borderRadius` 併用不可 (A3)** が KPI タイル / 比較カードの王道デザインを阻む。#795 のスコープ外を再考する価値あり
- **語彙ギャップは想定より大きい**（B1〜B8）。`pom-slide` skill / `llm.txt` に「`<Theme>` トークン + `Layer` 装飾レイヤ + 6 ロールパレット + accent2」のレシピを追記すると AI 生成物の質が体感で 1 段上がるはず
- **PPTX 原理限界は HTML を完全に追わない方針が現実的**（C1〜C5）。`backdrop-filter` / `mask-image` / 任意フォントロードは諦め、半透明 surface + drop shadow / Image ノードで吸収

## 既知の制約 / 注意事項

本調査の比較条件には以下の混入要因がある。findings を読む際の前提として参照されたい:

- **フォントが揃っていない**: HTML 側は `Inter` + `Noto Sans JP` のフォールバック、pom 側は pom-cli にバンドルされる `Carlito` / `Noto Sans CJK JP` / `Noto Sans JP` を踏襲。display サイズの「太く見えない」「迫力が落ちる」観察は **DSL の表現力ギャップではなく、フォント差分による視覚効果差** の可能性が高い。気付きとしては「pom 側でフォントの選択肢を増やす運用ノウハウ」も語彙ギャップの一部として扱う（B 系の項目で言及）
- **HTML 版は `Chrome DevTools MCP take_screenshot` でデフォルト devicePixelRatio で取得**。pom 版は `pom-cli render` 経由で 1280×720 程度の解像度。両者を並べる際は解像度差を許容
- **pom 版は LibreOffice 経由で PNG 化されており、PPTX 自体は正しく生成されている**。PNG 上で観察される細部の不一致（例えば後述の "01 → 1" のような数字表示）の一部は LibreOffice の表示挙動由来であり、PowerPoint で開くと意図通り表示される可能性がある。findings.md の "rendering pipeline" 注記を参照

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
