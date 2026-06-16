# Fixture 04: pom-theme が triggered される最小プロンプト

## 目的

`pom-theme` skill が triggered され、ブランドカラー直接指定から `pom-theme.json` を生成できるかを確認する。

## セットアップ

1. 一時ディレクトリを作り、その中で agent を起動する
2. 既存の `pom-theme.json` が無いことを確認する

```bash
mkdir -p /tmp/pom-theme-fixture-04
cd /tmp/pom-theme-fixture-04
rm -f pom-theme.json
```

## 入力プロンプト

```
ブランドカラーは #0052CC です。これに合わせた pom 用のテーマファイルを作ってください。トーンはコーポレートで、日本語デッキ向けにしてください。
```

## 期待される挙動チェックリスト

- [ ] **skill triggered**: `pom-theme` skill が起動する（SKILL.md の内容を踏まえた応答になる）
- [ ] **入力ソース判定**: agent が「ブランドカラー直接指定」だと認識する
- [ ] **`pom-theme.json` 生成**: 現ディレクトリに `pom-theme.json` が保存される
- [ ] **`colors.accent`**: 指定の `0052CC` がそのまま使われる
- [ ] **配色 5 ロール**: `colors.base` / `colors.surface` / `colors.ink` / `colors.muted` / `colors.accent` がすべて埋まる
- [ ] **`colors.charts`**: `accent` を先頭にした 3〜5 色の配列がある
- [ ] **`tone`**: `"コーポレート"` がそのまま反映される
- [ ] **`typography.fontFamily`**: 日本語デッキ前提として `Noto Sans JP`（または相当のフォント）が指定される
- [ ] **`slideMaster.background.color`**: `colors.base` と整合する hex が入る
- [ ] **`source`**: `source.type` が `"brandColor"`、`source.brandColors` に `["0052CC"]` 相当が記録される
- [ ] **JSON 妥当性**: 出力が valid JSON で、6 桁 hex（`#` なし）になっている

## 両 agent で確認するメモ

| 項目 | Claude Code | Codex CLI |
| --- | --- | --- |
| 起動方法 | 自然言語のほか `/pom-theme` slash command でも triggered する想定 | 自然言語のみ |
| `WebFetch` の使用 | URL / 画像が無い指示なので `WebFetch` は走らないはず | 同上 |
| 派生色のロジック | SKILL.md の Step 3 導出ルールに従う | 同上 |

## 失敗時のヒント

- skill が triggered されない → symlink 配置と agent 再起動を確認
- `colors.accent` が指定 hex と異なる → SKILL.md「ブランドカラー直接指定」セクションが drift
- `tone` が指定どおりにならない → 同 SKILL.md のトーン採用部分が drift
- 出力 hex に `#` 接頭辞が混ざる → 「6 桁 hex（`#` なし）」の指示が drift
