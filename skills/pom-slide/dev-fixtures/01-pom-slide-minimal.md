# Fixture 01: pom-slide が triggered される最小プロンプト（テーマなし）

## 目的

`pom-slide` skill が **テーマファイルが無い状態** で triggered され、デザイン原則に従った pom XML を生成できるかを確認する。

## セットアップ

1. 一時ディレクトリを作る（例: `/tmp/pom-slide-fixture-01/`）
2. その中で agent を起動する
3. ディレクトリ内に `pom-theme.json` が **存在しないこと** を確認する

```bash
mkdir -p /tmp/pom-slide-fixture-01
cd /tmp/pom-slide-fixture-01
# 必要なら過去のテーマ / 出力を削除
rm -f pom-theme.json slides.pom.xml
```

## 入力プロンプト

```
自社の Q3 業績ハイライトを 3 枚のスライドにまとめてください。表紙、KPI サマリー、来期の方針の 3 構成で。
```

## 期待される挙動チェックリスト

- [ ] **skill triggered**: `pom-slide` skill が起動する（SKILL.md の内容を踏まえた応答になる）
- [ ] **テーマ確認**: agent が `pom-theme.json` を読みに行こうとし、存在しないと判定する
- [ ] **トーン決定**: agent がトーン（コーポレート / ダーク・テック など）を 1 つ選ぶ
- [ ] **配色決定**: 配色パレット（base / surface / ink / muted / accent / accent2）の 6 ロールを宣言する
- [ ] **XML 生成**: `slides.pom.xml`（または指示があれば別名）が現ディレクトリに保存される
- [ ] **`<Theme>` 要素**: 出力 XML のトップに `<Theme ... />` が含まれ、`$tokenName` 参照が本文側で使われている
- [ ] **3 枚構成**: 出力 XML に `<Slide>` が 3 つ含まれる
- [ ] **デザイン原則の反映**: タイポグラフィスケール（display/title/heading/body/caption）と 8 の倍数余白がおおむね守られている
- [ ] **真っ白背景 + 純黒テキストを避ける**: `base` は `FFFFFF` ではなく、`ink` は `000000` ではない
- [ ] **セルフレビュー**: 生成後に自分でレンダリング結果を確認しようとする（または PNG を見て修正案を出す）流れに入る

## 両 agent で確認するメモ

| 項目 | Claude Code | Codex CLI |
| --- | --- | --- |
| 起動方法 | 自然言語のほか、`/pom-slide` slash command でも triggered する想定 | 自然言語のみ。slash command は無い |
| skill 読み込み | session 開始時のみ。SKILL.md 編集後は **再起動必須** | 同様にセッション再起動が安全 |
| tool 呼び出し粒度 | `Write` / `Read` / `Bash` を細かく分けて呼ぶ傾向 | tool 呼び出しの粒度が異なる場合あり（要観察） |
| プレビュー起動 | Bash を別ターミナルで起動する案内になりやすい | 同様 |

## 失敗時のヒント

- skill が triggered されない → 0 節の symlink 配置と agent 再起動を確認
- `pom-theme.json` を読まない → SKILL.md の「2. デザイン方針の決定 → テーマファイルの確認」セクションが drift していないか確認
- `<Theme>` 要素が出ない → 同 SKILL.md の `<Theme>` セクションが drift していないか確認
