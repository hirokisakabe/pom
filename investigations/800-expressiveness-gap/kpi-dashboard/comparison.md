# KPI ダッシュボード — 比較ノート

## サブテーマ

Q3 主要指標: MRR / Active Users / NRR / Churn Rate の 4 タイル + sparkline + 変化率ピル。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                                 | HTML                                                            | pom                                                                                                                                  | 分類                                |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| 4 タイル等幅レイアウト               | CSS Grid `repeat(4, 1fr)` + `gap: 24px`                         | `HStack gap="20"` + `grow="1"` で同等 (#797 で導入済み)                                                                              | 同等                                |
| タイルの 1px ボーダー + 角丸 16px    | `border` + `border-radius: 16px`                                | `border` + `borderRadius="16"` で同等                                                                                                | 同等                                |
| **タイル上端のアクセント細バー**     | `::before` 疑似要素で `border-radius` 角を継承しつつ top にバー | **`borderTop` + `borderRadius` は #795 のスコープ外で併用不可**。ドット代用に劣化                                                    | **機能ギャップ**                    |
| `backdrop-filter: blur(10px)`        | ガラス調の半透明背景                                            | 非対応 (PPTX 仕様外)                                                                                                                 | PPTX 原理限界                       |
| 数字 (display サイズ)                | font-size 56 / weight 800 / 文字グラデーション                  | fontSize 52 / bold / 単色のみ                                                                                                        | 機能ギャップ                        |
| **数字 + 単位の inline 配置**        | `<span>` で `M` `%` を小さく inline 配置                        | `HStack` で組むしかない。`HStack` 子は別 yoga ボックスなので **数字幅が予測できず "¥84.2" が "¥84." に切れる** バグ的挙動            | **機能 / 語彙ギャップ**             |
| **Chart node の sparkline 描画**     | div 6 個に高さ % を指定するだけで sparkline                     | `Chart chartType="bar"` は使えるが、**40px 高さの sparkline 用途では LibreOffice 経路で軸ラベル / 凡例の余白が消えず白塗りに見える** | **機能バグ / sparkline 用途で限界** |
| 変化率ピル (rounded badge)           | `padding` + `border-radius: 999px` + 色違い背景                 | 同等 (`borderRadius="999"`) だが、ピル幅を固定したため `+4pt QoQ` の中央寄せが崩れる                                                 | 語彙ギャップ                        |
| 変化率の色 (上昇=緑 / 下降=赤)       | クラスで分けて自由                                              | `color` 属性で同等                                                                                                                   | 同等                                |
| フッタ (左: 出典 / 右: ページ番号)   | `justify-content: space-between`                                | `HStack justifyContent="spaceBetween"`                                                                                               | 同等                                |
| 背景の radial blob 飾り              | `radial-gradient` 重ね                                          | 線形のみ。`radial-gradient` 未対応                                                                                                   | 機能ギャップ                        |
| 数字 + 文字の **数字グラデーション** | `background-clip: text` + accent → ink へ                       | 非対応                                                                                                                               | 機能ギャップ (表紙と重複)           |

## このスライドだけで見えた重要ギャップ要約

1. **`borderTop` + `borderRadius` 併用不可** が KPI タイルの王道デザイン（上端アクセントバー + 角丸）を阻む。#795 のスコープ外を改めて再考する価値あり。代替はドット / アイコンになるが見栄えは劣る
2. **数字 + 単位の inline 配置**: HStack で組むと数字テキストの幅が `flex-shrink` で潰れて末尾が切れることがある（"¥84.2M" → "¥84." + "M"）。inline run で fontSize を変える形（Text 内の `<Span fontSize="...">`）が一番素直だが、現状 `<Span>` は fontSize 変更を受け付けない
3. **小さい Chart (h=40 程度の sparkline) の描画品質**: LibreOffice 経路では Chart の凡例 / 軸の余白が削れず白塗り化する。`renderPptx/nodes/chart.ts` 側で sparkline モード（axis なし / legend なし / 余白ゼロ）を持つか、もしくは数本の Shape rect でバー描画する語彙を `pom-slide` skill で示すか
4. **radial-gradient 背景の有無**: 線形のみで装飾の表現幅が限定される。表紙でも同様の観察があった

## このスライドだけで見えた「動作した」確認事項

- `grow="1"` (#797) で 4 等分が綺麗にできた
- `Theme` トークン参照が複数色（accent / accent2 / accentGreen / accentRed）でも問題なく機能
- `borderRadius="999"` の pill 形状は安定
- `letterSpacing="-2"` で数字のジャンプを締めるのは効果あり
