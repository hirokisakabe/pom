# 表紙 — 比較ノート

## サブテーマ

「FY2026 Q3 プロダクトレビュー — Cosmo」表紙。AI コーディング支援 SaaS の社内四半期レビュー。

## 出力

- HTML: [`slide.html`](./slide.html) → [`slide.html.png`](./slide.html.png)
- pom: [`slide.pom.xml`](./slide.pom.xml) → [`slide.pom.xml.png`](./slide.pom.xml.png)

## 観察

| 項目                                | HTML                                                                       | pom                                                                                                                                                                                                           | 分類                      |
| ----------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 背景グラデーション                  | `linear-gradient` + 2 個の `radial-gradient` 重ね合わせ                    | `backgroundGradient` 1 個（linear のみ）                                                                                                                                                                      | 機能ギャップ              |
| 文字のグラデーション                | `background-clip: text` でタイトル文字自体をグラデーション着色             | 非対応。`Text` は単色のみ                                                                                                                                                                                     | **機能ギャップ**          |
| 半透明グロー blob                   | `radial-gradient(...rgba(56,189,248,0.25),transparent 50%)` で柔らかい発光 | 円 Shape + `fill.transparency` で近似可能だが、滲みのソフトさが出ない                                                                                                                                         | 機能ギャップ（差）        |
| 装飾の重ねレイヤー                  | `position:absolute` で z 順序を自由に                                      | `Layer` + 子の source 順で同等表現可能                                                                                                                                                                        | 同等                      |
| バッジ（pill 形 + 1px ボーダー）    | `border-radius: 999px` + `border` + 半透明背景 + `backdrop-filter: blur`   | `borderRadius="999"` + 半透明背景。`backdrop-filter` なし                                                                                                                                                     | 機能ギャップ（軽微）      |
| バッジ内のドット glow               | `box-shadow: 0 0 12px #38BDF8` でドットの周りに発光                        | Text/Shape の `glow` はあるが Shape では使えない                                                                                                                                                              | 機能ギャップ              |
| display サイズの bold タイトル      | font-weight 800 + letter-spacing -0.025em                                  | `bold` + `letterSpacing="-2"`。レンダリング上 HTML 版ほど太く見えないが、これは pom 表現力の問題ではなく HTML (`Inter` weight 800) と pom (`Noto Sans JP` Regular/Bold) の font weight 差。混入要因として記録 | フォント差混入 / 観察保留 |
| サブタイトル: テキスト + sep ライン | flex layout で自然に表現                                                   | `HStack` + `Shape` w=32 h=1 でセパレータ。動作するが直感的でない                                                                                                                                              | 語彙ギャップ              |
| グリッドオーバーレイ                | `background-image: linear-gradient(...)` 2 系統 + `mask-image`             | 非対応。多数の小 Line を敷くワークアラウンドが必要                                                                                                                                                            | 機能ギャップ              |
| 右上の装飾リング                    | `border-radius: 999px` の絶対配置 div + outer/inner shadow                 | `Shape shapeType="ellipse"` で可能。ただしスライド境界外配置に対する `NODE_OUT_OF_BOUNDS` 警告と autoFit の衝突あり                                                                                           | 語彙ギャップ              |
| コーナーキャプション                | `position:absolute` で簡単                                                 | `Layer` 内では可能だが `letterSpacing="3"` を付けると autoFit が overflow を主張する場面あり                                                                                                                  | **機能バグ / 仕様確認要** |
| スペーサー要素 (透明 Box)           | `<div>` で 0 視覚負荷                                                      | `Shape grow="1"` で代用するが、`fill.transparency="1.0"` でも line 色や fill が完全に消えないケースあり                                                                                                       | **機能ギャップ**          |

## このスライドだけで見えたギャップ要約

- **真のテキストグラデーション**（タイトル文字自体を 2 色グラデーションにする） — HTML 表紙で頻出だが pom は未対応
- **拡散グロー / ブラー blob** — HTML の柔らかい発光を pom で表現する手段がない
- **透明スペーサー** — VStack 内の grow=1 で押し下げるための「視覚的にゼロ」な primitive
- **Shape の glow** — Shape ノードへの glow 適用（現状 Text のみ）
- **`backdrop-filter: blur`** — PPTX 仕様上不可能。代替は半透明 surface 色 + drop shadow

## 表紙特有の autoFit 挙動メモ

Layer ベースで作ると `letterSpacing` 付きの fontSize=10 程度の小さい Text が autoFit に対して content height を 720px を超えると判定するケースがあり、座標を変えても解消しないことがあった (`AUTOFIT_OVERFLOW`)。Layer 内の絶対配置子要素の measure ロジックに何らかのバグ、または Text 内部の bounding box 計算が letterSpacing 付きで予期せぬ拡張をしている可能性。再現コードは [`/tmp/minimal-layer.pom.xml`](/tmp/minimal-layer.pom.xml) に控え。本調査内では VStack ベースに切り替えて回避した。
