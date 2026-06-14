# タイムライン — 比較ノート

## サブテーマ

Q4 マイルストーン 4 ステップ (α 版 → β 招待 → 価格モデル → GA)。色は accent → accent2 に推移し、視覚的にフェーズの進捗を示す。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                                    | HTML                                                                     | pom                                                                                                                                    | 分類                          |
| --------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| 横並び 4 ステップ                       | `grid-template-columns: repeat(4, 1fr)`                                  | `Timeline direction="horizontal"` で自動配置                                                                                           | 同等                          |
| 軸線のグラデーション (accent → accent2) | `linear-gradient(90deg, #38bdf8 0%, #a78bfa 100%)` (`::before` 疑似要素) | **`Timeline` の軸線は固定色 (E2E8F0) で属性として変更不可** (`renderPptx/nodes/timeline.ts:189`)                                       | 機能ギャップ (B7 / A2 と関連) |
| ドットの glow                           | `box-shadow: 0 0 16px var(--color)` + `inset 0 0 0 4px var(--color)`     | `Shape ellipse` の `glow` は現状 Text 限定のため発光が出ない                                                                           | 機能ギャップ (A5)             |
| ドットの 2 重リング表現                 | `border: 2px solid var(--color)` + `inset shadow`                        | `Timeline` の内部実装が単色 fill のみで、外側リングのカスタマイズなし                                                                  | 機能ギャップ (B7)             |
| バッジ ("M1" 〜 "M4")                   | `.badge` クラスで描画                                                    | `Timeline` ノードに位置をマップする手段がなく、本調査では **省略した (整合性のため要追記)**                                            | 機能ギャップ (Timeline 拡張)  |
| 日付ラベルの色 (per-step)               | `color: var(--color)` でステップ色と同色                                 | `dateColor` は Timeline 全体でのみ設定可。アイテムごとに color = ステップ色という関連付けがない                                        | 機能ギャップ (B7)             |
| description の改行                      | `<br/>` で改行                                                           | description 内 `\n` は pom が改行扱いしない (例: `α 版リリース` の description が 1 行に詰まって表示される)                            | 機能ギャップ                  |
| 全体のフォント                          | `Inter`                                                                  | **Timeline は `fontFace: "Noto Sans JP"` をハードコード** (`renderPptx/nodes/timeline.ts:227,240,255`)。デッキ全体のフォント設定と独立 | 機能ギャップ (B7)             |

## このスライドだけで見えた気付き

- `Timeline` ノードは便利だが、**カスタマイズの幅が想定より狭い**。軸線色 / フォント / アイテムごとの色応用 / バッジ追加など、装飾度を上げる手段が乏しい。実用上は `Layer` + 自前 Shape で組む方が自由度が高い
- B7 の優先度は当初想定より高い: Timeline は AI スライド生成の頻出ノードであり、デッキ全体の視覚言語と独立した「テーマ無視」挙動は AI 制作物の一貫性を阻害する
- バッジ "M1〜M4" は今回 pom 側に入れなかったが、本来 HTML との等価性のために追加すべきだった (調査の整合性メモ)
