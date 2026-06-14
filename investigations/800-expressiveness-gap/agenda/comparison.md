# アジェンダ — 比較ノート

## サブテーマ

5 セクションの目次。左カラムにタイトル + helper、右カラムにナンバリング付きリスト。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                                                 | HTML                                                     | pom                                                                                                             | 分類                                 |
| ---------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| 2 カラム比 1 : 1.4                                   | `grid-template-columns: 1fr 1.4fr`                       | `HStack grow="1"` / `grow="1.4"` で同等 (#797)                                                                  | 同等                                 |
| タイトルのテキストグラデーション (`本日の` + accent) | `background-clip: text` + accent → ink グラデ            | 不可。`Text color="$accent"` で単色                                                                             | 機能ギャップ (A1)                    |
| ナンバリングのアクセントグラデ表示                   | `background-clip: text` で `01`〜`05` を accent gradient | 単色 (`color="$accent"`)                                                                                        | 機能ギャップ (A1)                    |
| ナンバリングの "01" "02" 表記                        | `<span>01</span>` で正しく表示                           | XML 入力は `<Text>01</Text>` だが、`pom-cli render` 経由の PNG 上で `1`, `2`, ..., `5` に欠落 (PPTX 自体は正常) | 表現観察 (A9 / 描画パイプライン由来) |
| 各行のセパレータ罫線                                 | `border-top: 1px solid rgba(255,255,255,0.06)`           | `borderTop.color="FFFFFF" borderTop.width="1"` で同等                                                           | 同等                                 |
| 行の `baseline` 揃え                                 | `align-items: baseline`                                  | `alignItems="center"` で代用 (HStack に baseline 未対応)                                                        | 機能ギャップ (低優先)                |
| サブテキスト改行 (`<br/>`)                           | HTML タグでブレーク                                      | `\n` を含む Text content では pom が改行扱いしない。本調査では 1 行に押し込んで暫定回避                         | 機能ギャップ (B7 と関連)             |
| `text-transform: uppercase`                          | CSS で自動大文字化                                       | XML 側で `SECTION 01` 等を直接記述                                                                              | 同等 (DSL 利便性差のみ)              |

## このスライドだけで見えた気付き

- アジェンダのナンバリング装飾は、HTML だと「accent → accent2 のグラデ文字」が定石。pom は単色のため A1 の影響度が顕著に出る
- "01" → "1" の欠落は LibreOffice 経路由来 (A9)。回避は `"01."` のように非数字を 1 文字混ぜることで OK
- 2 カラム比例レイアウトは `grow` 比率指定 (#797) でほぼ何のストレスもなく書ける。skill レシピへの追加価値あり (B8 関連)
