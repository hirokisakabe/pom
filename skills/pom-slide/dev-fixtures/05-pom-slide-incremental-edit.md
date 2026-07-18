# Fixture 05: 既存 pom XML の incremental edit

## 目的

`pom-slide` skill が既存デッキへの指示を新規生成と区別し、指定された `<Slide>` だけを更新するか確認する。トップレベルの `<Theme>` と対象外 slide の保持、ファイル全体の strict validation、変更 slide の自己修正、既存 preview server の再利用も対象とする。

## セットアップ

1. 一時ディレクトリを作り、以下を `slides.pom.xml` として保存する
2. `pom` が PATH 上にあれば、別ターミナルで `pom preview slides.pom.xml --no-open` を起動しておく。利用できなければ preview 再利用の項目だけ確認対象外とする
3. agent を一時ディレクトリ内で起動する

```bash
mkdir -p /tmp/pom-slide-fixture-05
cd /tmp/pom-slide-fixture-05
cat > slides.pom.xml <<'EOF'
<Theme base="F8F9FB" surface="FFFFFF" ink="1F2937" muted="6B7280" accent="1E3A8A" accent2="3B82F6" />
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="24">
    <Text fontSize="32" bold="true" color="$ink">四半期レビュー</Text>
    <Text fontSize="16" color="$muted">変更してはいけない表紙</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="24">
    <Text fontSize="32" bold="true" color="$ink">旧 KPI</Text>
    <Text fontSize="16" color="$ink">売上 100 / 継続率 80%</Text>
  </VStack>
</Slide>
<Slide>
  <VStack w="100%" h="max" padding="64" backgroundColor="$base" gap="24">
    <Text fontSize="32" bold="true" color="$ink">次のアクション</Text>
    <Text fontSize="16" color="$muted">変更してはいけないまとめ</Text>
  </VStack>
</Slide>
EOF

if command -v pom >/dev/null 2>&1; then
  pom preview slides.pom.xml --no-open
fi
```

## 入力プロンプト

```
既存の slides.pom.xml の 2 枚目だけを更新してください。タイトルを「Q3 KPI」にし、売上 120、継続率 92% を見やすい KPI カードで示してください。1 枚目と 3 枚目、テーマは変更しないでください。
```

## 期待される挙動チェックリスト

- [ ] **skill triggered**: `pom-slide` skill が起動し、既存 XML の incremental edit と判定する
- [ ] **既存 XML 読み込み**: 編集前に `slides.pom.xml` 全体を読み、`<Theme>` と 3 枚の構成を把握する
- [ ] **更新ケースの選択**: 「N 枚目だけ更新」と分類し、2 枚目の `<Slide>` だけを書き換える
- [ ] **対象外 slide の保持**: 1 枚目と 3 枚目の XML 内容・相対順序が変わらない
- [ ] **Theme の保持**: トップレベルの `<Theme>` 宣言が変わらない
- [ ] **既存デザインへの整合**: 2 枚目が既存の token 参照、タイポグラフィ、余白に合わせて更新される
- [ ] **全体 strict validation**: `pom build slides.pom.xml -o <一時出力>` または同等の `buildPptx(..., { strict: true })` を 3 枚全体に実行する
- [ ] **局所的な自己修正**: validation が失敗した場合、diagnostics が示す変更 slide だけを修正して全体を再検証し、1 枚目・3 枚目・`<Theme>` へ修正を広げない
- [ ] **変更 slide のセルフレビュー**: strict validation 後、2 枚目を `pom render ... --slides 2` などで視覚確認する（pom-cli が無ければ未実施理由を報告する）
- [ ] **preview server の再利用**: セットアップで preview を起動した場合、既存 server を利用し、別の `pom preview` process を重複起動しない
- [ ] **完了報告**: 2 枚目だけを更新したことと strict validation の結果を報告する

## 両 agent で確認するメモ

| 項目           | Claude Code                                               | Codex CLI                                                  |
| -------------- | --------------------------------------------------------- | ---------------------------------------------------------- |
| skill 読み込み | session 開始時のみ。SKILL.md 編集後は **再起動必須**      | 同様にセッション再起動が安全                               |
| XML 編集       | `Read` 後に対象範囲だけ `Edit` するか確認                 | patch の粒度が異なっても、編集前後の不変部分を diff で確認 |
| validator      | `Bash` で full build を実行するか確認                     | 同様                                                       |
| preview 再利用 | 既存 background task / process を検出して再利用するか確認 | process list / port の確認後に重複起動しないか確認         |

## 失敗時のヒント

- ファイル全体を再生成する → SKILL.md「N 枚目だけ更新」の対象外保持ルールが効いていない
- `<Theme>` や前後 slide も変わる → 編集前後の `diff` で不変部分を特定し、incremental edit セクションを確認する
- 2 枚目だけを build して済ませる → validator は常に保存ファイル全体へ実行する
- validation エラー時に全 slide を直す → diagnostics の slide 番号を確認し、変更対象だけを自己修正する
- preview process が増える → 起動前の process / port 確認と既存 server 再利用の指示を確認する
