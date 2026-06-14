# 2 案比較 — 比較ノート

## サブテーマ

「自社開発」 vs 「OSS 採用 (Langfuse + 内製アダプタ)」の意思決定スライド。推奨案にバイオレットの外側グロー。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                              | HTML                                          | pom                                                                                        | 分類                                   |
| --------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------- |
| 2 カード等幅                      | `grid-template-columns: 1fr 1fr`              | `HStack` + `grow="1"` × 2                                                                  | 同等                                   |
| カード B (推奨) の外側グロー      | `box-shadow: 0 0 40px rgba(167,139,250,0.15)` | `shadow.type="outer" shadow.blur="20" shadow.color="A78BFA"` でほぼ意図通り発光            | 同等                                   |
| バッジの gradient 塗り (推奨)     | `linear-gradient(135deg, #38bdf8, #a78bfa)`   | `backgroundColor="$accent"` 単色で代用                                                     | 機能ギャップ (A2 / 単色ですが許容範囲) |
| `::before` 疑似要素のチェック ✓   | `content: "✓"` + `color: #34d399`             | `HStack` + `Text "✓"` で別ノードとして配置                                                 | 語彙ギャップ (B 系)                    |
| HStack 内 ✓ と Text の間隔        | `gap: 12px` が CSS だけで安定                 | HStack の `gap="12"` を入れたが、HSTack 子 Text が grow=1 取らないと右端まで広がってしまう | 語彙ギャップ (B6)                      |
| 区切り線 (verdict 上のダッシュ線) | `border-top: 1px dashed`                      | `borderTop` には `dashType` 適用が現状効かないため solid のみ                              | 機能ギャップ (低優先)                  |
| カード本文の Ul / Li bullet       | `::before "·"` でカスタム小ドット             | `Ul`/`Li` のデフォルトドットを利用                                                         | 同等                                   |
| **テキストの表記差**              | HTML: "OSS 採用 (Langfuse + 内製アダプタ)"    | pom: "OSS 採用 (Langfuse + アダプタ)" — **意図せず文言が短縮されている (手直しが必要)**    | 観察ミス / 整合性                      |

## このスライドだけで見えた気付き

- カード B の外側グロー (バイオレット) は `shadow.color` で意外と再現できる。`pom-slide` skill に「推奨案を視覚的に際立たせる shadow」のレシピを追加する価値あり
- 文言の不一致 (Langfuse + 内製アダプタ ↔ アダプタ) を後で発見。比較ペアの整合性チェックを skill 化する余地 (B 系)
- `borderTop` の `dashType` が反映されないのは [#795](https://github.com/hirokisakabe/pom/issues/795) のスコープ外の制限 (A3 と関連)
