# 引用・キーメッセージ — 比較ノート

## サブテーマ

顧客の声引用。「平均 4.2 時間 → 22 分に短縮」を強調。巨大な引用符 + 出典バー。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                          | HTML                                                          | pom                                                                                  | 分類               |
| ----------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------ |
| 巨大な引用符 (180px)          | `font-size: 180px` + `background-clip: text` でグラデーション | `fontSize="180"` + `glow.size="20"` で発光を付与。グラデーションは単色 accent で代用 | 機能ギャップ (A1)  |
| 背景の radial-gradient (2 個) | `radial-gradient` を 2 枚重ね                                 | `linear-gradient` のみ (1 本)                                                        | 機能ギャップ (A2)  |
| 引用文中の強調 (inline)       | `<strong>` + gradient text                                    | `<Span color="38BDF8" bold="true">` で色 + 太字。**`<Span>` で gradient はできない** | 機能ギャップ (A1)  |
| 出典の vertical bar           | `width: 4px height: 56px; background: linear-gradient`        | `Shape backgroundGradient="linear-gradient(180deg, ...)"` で同等                     | 同等               |
| Layer ベースの絶対配置        | `position: absolute`                                          | `Layer` + 子の `x/y` 指定で同等                                                      | 同等               |
| serif フォント (引用符)       | `Georgia / Noto Serif JP`                                     | pom-cli にバンドル serif フォントなし。Noto Sans JP のままで sans-serif 表示         | PPTX 原理限界 (C4) |

## このスライドだけで見えた気付き

- 引用符のような **巨大装飾文字** は pom でも fontSize 180 + glow で結構戦える。文字グラデーション (A1) があればさらに格が上がる
- `<Span>` の inline 強調 (色 + bold) は意外と効く。`pom-slide` skill の Text effects レシピで「重要部分の inline 色付け」を追記する価値 (B3)
- 引用符だけ serif にしたかったが、pom-cli の同梱フォントに serif がない。`pom-theme.json` 経由でシステムフォント (Georgia / 游明朝) を指定する運用を案内できる (C4 補強)
- radial-gradient 背景は表紙 / KPI と同様にここでも欲しくなった (A2 の頻度確認)
