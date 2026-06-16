# Fixture 02: pom-theme.json があるときのブランド適用

## 目的

カレントディレクトリに `pom-theme.json` が存在するときに、`pom-slide` skill が **自動でテーマを読み込み**、配色・フォント・トーンをそのまま採用するかを確認する。

## セットアップ

1. 一時ディレクトリを作る（例: `/tmp/pom-slide-fixture-02/`）
2. その中に下記の `pom-theme.json` を保存する
3. ディレクトリ内で agent を起動する

```bash
mkdir -p /tmp/pom-slide-fixture-02
cd /tmp/pom-slide-fixture-02
rm -f slides.pom.xml
cat > pom-theme.json <<'EOF'
{
  "name": "fixture-corp",
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
EOF
```

## 入力プロンプト

```
新サービスの社内向け説明資料を 4 枚で作ってください。タイトル / 課題 / 解決策 / 次のアクション の構成で。
```

## 期待される挙動チェックリスト

- [ ] **skill triggered**: `pom-slide` skill が起動する
- [ ] **テーマ読み込み**: agent が `Read` で `pom-theme.json` を読み、内容に言及する
- [ ] **トーン採用**: `tone: "コーポレート"` をそのまま採用する（独自に別トーンを選び直さない）
- [ ] **配色採用**: `colors.base` / `colors.surface` / `colors.ink` / `colors.muted` / `colors.accent` の hex がそのまま XML に現れる
- [ ] **`<Theme>` 宣言**: 出力 XML の `<Theme ... />` に上記 hex が反映されている
- [ ] **accent2 の手当て**: `accent` に対する近傍色を **手動で 1 色選び** `<Theme accent2="..."/>` として宣言する（`colors.charts[1]` を盲目的に転記しない）
- [ ] **フォント採用**: `fontFamily` に `Noto Sans JP` が使われる
- [ ] **背景色**: スライド背景が `F7F9FC` 系（テーマの `slideMaster.background.color`）になっている
- [ ] **XML 生成**: `slides.pom.xml` が現ディレクトリに保存される
- [ ] **4 枚構成**: 出力 XML に `<Slide>` が 4 つ含まれる

## 両 agent で確認するメモ

| 項目                  | Claude Code                                                         | Codex CLI |
| --------------------- | ------------------------------------------------------------------- | --------- |
| `pom-theme.json` 検出 | 自動で `Read` を呼ぶ想定                                            | 同様      |
| 色の transformation   | テーマの hex をそのまま使うべきで、agent が独自に微調整しないか観察 | 同上      |
| `accent2` の選び方    | SKILL.md の指示どおり手動選択 1 色になっているか                    | 同上      |

## 失敗時のヒント

- `pom-theme.json` を読まずに独自配色で生成する → SKILL.md「テーマファイルの確認」が drift
- `accent2` が `colors.charts[1]` の自動転記になっている → 同じセクションの注意書きが効いていない
- フォントが `Noto Sans JP` にならない → `typography.fontFamily` の参照がいずれか drift
