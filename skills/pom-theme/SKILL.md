---
name: pom-theme
description: Onboard brand assets into a pom theme. Reads brand colors (hex), an existing PPTX master, or a website/image, then generates pom-theme.json (color palette + typography + SlideMaster settings) that the pom-slide skill picks up automatically.
license: MIT
allowed-tools: Write,Edit,Read,Bash,WebFetch
metadata:
  version: "0.1.0"
---

ブランド資産（ブランドカラー・既存 PPTX マスター・Web サイト / 画像）から pom 用のテーマを生成し、`pom-theme.json` として保存する。テーマを一度作れば、以降の `/pom-slide` によるスライド生成がブランドに沿った見た目になる。

## テーマファイル形式（`pom-theme.json`）

本 skill の出力。pom-slide skill は生成時にカレントディレクトリの `pom-theme.json` を自動で読み、デザイントークンとして使用する。pom-slide が自動適用するのは **トーン・配色・フォント・背景色**（`tone` / `colors` / `typography` / `slideMaster.background.color`）。`slideMaster` のその他の設定（`margin` / `objects` / `slideNumber` / `title`）は pom-slide では消費されず、`buildPptx(xml, size, { master })` を直接使う API 利用者向けの記録となる。

```json
{
  "name": "acme-corporate",
  "tone": "コーポレート",
  "colors": {
    "base": "F7F9FC",
    "surface": "FFFFFF",
    "ink": "1E2A38",
    "muted": "5D6B7A",
    "accent": "0052CC",
    "charts": ["0052CC", "36B37E", "FFAB00", "6554C0"]
  },
  "typography": {
    "fontFamily": "Noto Sans JP",
    "headingFontFamily": "Noto Sans JP"
  },
  "slideMaster": {
    "background": { "color": "F7F9FC" }
  },
  "source": {
    "type": "brandColor",
    "brandColors": ["0052CC"]
  }
}
```

| フィールド | 内容 |
| --- | --- |
| `name` | テーマ名（kebab-case） |
| `tone` | トーンの言語表現（pom-slide のトーン選択に対応。例: コーポレート / ダーク・テック / ウォーム・エディトリアル） |
| `colors.base` | スライド背景色（6 桁 hex、`#` なし） |
| `colors.surface` | カード・パネルの背景色 |
| `colors.ink` | 本文テキスト色 |
| `colors.muted` | 補助テキスト・キャプション色 |
| `colors.accent` | 強調 1 色 |
| `colors.charts` | グラフ用の配列（`Chart` の `chartColors` に使う。accent を先頭に 3〜5 色） |
| `typography.fontFamily` | 本文フォント名 |
| `typography.headingFontFamily` | 見出しフォント名（省略時は `fontFamily` と同じ） |
| `slideMaster` | `@hirokisakabe/pom` の `SlideMasterOptions` と同形。`buildPptx(xml, size, { master })` にそのまま渡せる。`background` / `margin` / `objects` / `slideNumber` / `title` を指定可能 |
| `source` | テーマの出自の記録。`type` は `brandColor` / `masterPptx` / `website` / `image`。`masterPptx` 由来の場合は相対パスを `source.masterPptx` に記録する |

> **フォントについて**: `fontFamily` はテーマに記録されるが、pom のテキスト計測は標準フォントベースのため、特殊なブランドフォントでは行幅の計測がずれることがある（フォント計測の拡張は pom 本体の今後の対応範囲）。日本語デッキでは `Noto Sans JP` を推奨。

## 手順

### 1. 入力の解釈

ユーザーの指示から入力ソースを判定する:

- **ブランドカラー直接指定**: hex 値（`#0052CC` など）が指示に含まれる
- **既存 PPTX マスター**: `.pptx` ファイルのパスが指示に含まれる
- **Web サイト / 画像**: URL または画像ファイルのパスが指示に含まれる

複数のソースが与えられた場合は PPTX マスター > ブランドカラー > Web / 画像 の順を基本としつつ、ユーザーの意図（「色はこの hex、フォントはこの PPTX に合わせて」など）に従って組み合わせる。

明示されていない場合のデフォルト:

- 出力ファイル名: `pom-theme.json`（カレントディレクトリ）
- 基調: ライト（ユーザーが「ダーク」を指定した場合のみダーク基調）

### 2. ソース別の色・フォント抽出

#### a. ブランドカラー直接指定

指定された hex をそのまま採用する。複数指定された場合は主たる 1 色（最初に挙げられた色、または「メイン」と明示された色）を accent の元とし、残りは `colors.charts` の候補として記録する。Step 3 の導出ルールへ進む。

#### b. 既存 PPTX マスターの読み込み

PPTX は zip アーカイブなので、`unzip -p` でテーマ XML を直接読み取れる。

```bash
# カラースキームとフォントスキーム
unzip -p <input.pptx> ppt/theme/theme1.xml

# マスターの背景定義（p:bg 要素）
unzip -p <input.pptx> ppt/slideMasters/slideMaster1.xml
```

`theme1.xml` の `<a:clrScheme>` から色を、`<a:fontScheme>` からフォントを以下の対応で取り込む:

| theme1.xml | テーマのロール |
| --- | --- |
| `<a:lt1>`（背景 1） | base の候補。純白 `FFFFFF` の場合は Step 3 でオフホワイトへの調整を検討 |
| `<a:lt2>`（背景 2） | surface の候補 |
| `<a:dk1>`（テキスト 1） | ink の候補。純黒 `000000` の場合は Step 3 で調整 |
| `<a:dk2>`（テキスト 2） | muted 導出の参考 |
| `<a:accent1>` | accent |
| `<a:accent1>`〜`<a:accent6>` | `colors.charts`（上から順に 3〜5 色） |
| `<a:fontScheme>` の `minorFont` | `typography.fontFamily`（日本語デッキでは `<a:ea>` の typeface を優先、無ければ `<a:latin>`） |
| `<a:fontScheme>` の `majorFont` | `typography.headingFontFamily` |

色値は `<a:srgbClr val="..."/>` から取る。`<a:sysClr>`（`windowText` → `000000`、`window` → `FFFFFF`）の場合は `lastClr` 属性の値を使う。

`slideMaster1.xml` の `<p:bg>` に単色背景（`<a:solidFill>`）があれば base および `slideMaster.background.color` に反映する。画像背景の場合は `slideMaster.background` には取り込まず、完了報告でその旨を伝える（画像背景の移植は対象外）。

`theme1.xml` が存在しない・読み取れない場合はエラー内容を報告し、ブランドカラー直接指定での再実行を案内する。

#### c. Web サイト / 画像からの抽出

- **Web サイト**: `WebFetch`（または `curl`）でトップページの HTML / CSS を取得し、ブランドカラーを特定する。手がかり: `<meta name="theme-color">`、CSS カスタムプロパティ（`--primary` / `--brand` など）、ヘッダー・ボタンに使われている色。
- **画像**（ロゴなど）: `Read` ツールで画像を読み、視覚的に支配的なブランドカラーを特定して hex で表現する。

特定した色を主ブランドカラーとして Step 3 の導出ルールへ進む。確信が持てない場合は候補色をユーザーに提示して確認する。

### 3. 5 ロールパレットの導出

主ブランドカラーを accent に据え、残りのロールを導出する。PPTX マスター由来で全ロールが揃っている場合も、以下の品質基準（純白・純黒回避、コントラスト）を満たすよう微調整する。

**ライト基調**:

- `accent`: 主ブランドカラー。背景に対して暗すぎ・明るすぎる場合のみ明度を微調整する
- `base`: ブランドカラーの色相をわずかに含むオフホワイト（明度 96〜98%・低彩度）。純白 `FFFFFF` 固定にしない
- `surface`: `FFFFFF` または base よりわずかに明るい色
- `ink`: ブランドカラーと同系色相のダークグレー（明度 12〜20%）。純黒 `000000` は避ける
- `muted`: ink と base の中間（明度 40〜55%）

**ダーク基調**:

- `base`: ブランドカラーの色相を含むダーク（明度 8〜14%）
- `surface`: base より明度 +6〜10%
- `ink`: オフホワイト（明度 92〜96%）
- `muted`: 明度 55〜70% のグレー
- `accent`: 主ブランドカラーが暗い場合は明度を上げて視認性を確保する

`colors.charts` は accent を先頭に、色相をずらした調和色または PPTX の accent2〜6 から 3〜5 色を選ぶ。

### 4. コントラスト検証

WCAG の相対輝度に基づくコントラスト比で以下を確認し、満たさない場合は明度を調整して再確認する:

| 組み合わせ | 最低基準 |
| --- | --- |
| ink / base | 7:1 以上（最低でも 4.5:1） |
| ink / surface | 4.5:1 以上 |
| muted / base | 3:1 以上 |
| accent / base | 3:1 以上（accent をテキストや細いバーに使うため） |

コントラスト比は `(L1 + 0.05) / (L2 + 0.05)`（L は相対輝度、L1 ≧ L2）。厳密な計算が難しい場合は `python3` ワンライナーで算出する:

```bash
python3 -c "
def lum(h):
    r,g,b=(int(h[i:i+2],16)/255 for i in (0,2,4))
    f=lambda c: c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)
a,b=lum('1E2A38'),lum('F7F9FC')
print(round((max(a,b)+0.05)/(min(a,b)+0.05),2))
"
```

### 5. SlideMaster 設定の生成

`slideMaster` フィールドを `SlideMasterOptions` の形で組み立てる:

- `background.color`: base と同じ色（PPTX マスターに単色背景があればその色）
- ユーザーがページ番号を希望した場合: `slideNumber` を右下に配置（例: `{ "x": 1180, "y": 690, "w": 60, "h": 20, "fontSize": 10, "color": "<muted>" }`）
- ユーザーがフッター（会社名・コピーライト等）を希望した場合: `objects` に text オブジェクトを追加する

最小構成は `background` のみでよい。指示がなければ `slideNumber` / `objects` は追加しない。

### 6. ファイルへの保存

`Write` ツールで `pom-theme.json` に保存する。`source` フィールドに出自（`type`、ブランドカラーの hex、PPTX の相対パス、URL 等）を記録する。

### 7. サンプルスライドでの確認（オプション）

`pom`（pom-cli）がインストール済みの場合、テーマを適用した 1 枚のサンプルスライド（タイトル + 本文 + accent バー）を一時ファイルに生成し、`pom build` が通ることと、可能ならレンダリング画像で配色の印象を確認する。問題があれば Step 3〜4 に戻って調整する。pom-cli がない場合はスキップする。

### 8. 完了報告

以下を報告する:

- 保存したテーマファイルのパス
- 確定した 5 ロールの色とフォント（コントラスト検証の結果を含む）
- 次のステップ: 同じディレクトリで `/pom-slide` を実行すると `pom-theme.json` が自動で適用されること
- PPTX マスター由来の場合: `source.masterPptx` に元ファイルのパスを記録したこと。pom-md（`.pom.md`）の front-matter `masterPptx:` や `buildPptx` の `masterPptx` オプションで元 PPTX の**背景を再利用できる**こと（`masterPptx` が取り込むのは背景のみで、`objects` / `margin` / `slideNumber` / フォントは反映されない）
