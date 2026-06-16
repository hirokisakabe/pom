# Fixture 03: pom-cli preview の起動経路

## 目的

XML 生成後に `pom-cli` が利用可能な環境で **preview サーバーを起動する経路** が機能するかを確認する。

## セットアップ

1. `pom-cli` がインストール済みであることを確認する（`pnpm dlx @hirokisakabe/pom-cli --version` などで疎通確認）
2. 一時ディレクトリを作り、その中で agent を起動する

```bash
mkdir -p /tmp/pom-slide-fixture-03
cd /tmp/pom-slide-fixture-03
rm -f slides.pom.xml pom-theme.json
# pom-cli 疎通確認（任意）
pnpm dlx @hirokisakabe/pom-cli --version || echo "pom-cli not available — fixture skipped"
```

## 入力プロンプト

```
社内勉強会用に、TypeScript 5 の新機能ハイライトを 3 枚にまとめて、生成後にプレビューでも見られるようにしてください。
```

## 期待される挙動チェックリスト

- [ ] **skill triggered**: `pom-slide` skill が起動する
- [ ] **XML 生成**: `slides.pom.xml` が現ディレクトリに保存される
- [ ] **preview コマンド提示 or 実行**: agent が `pom-cli preview slides.pom.xml`（または同等のコマンド）を提示する、もしくは `Bash` で実行する
- [ ] **「別ターミナルで起動」アナウンス**: long-running プロセスのため、別ターミナルで起動するよう案内する、または `run_in_background` 的に起動する
- [ ] **URL 案内**: preview サーバーの URL（例: `http://localhost:3000`）が案内される
- [ ] **セルフレビューループ**: preview を見たうえで修正案を出す流れ、または「プレビューを見て気になる点があれば言ってください」のフォローがある

## 両 agent で確認するメモ

| 項目                      | Claude Code                                                         | Codex CLI                                              |
| ------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------ |
| Bash の long-running 実行 | `run_in_background: true` で起動できる                              | shell 経由で `&` background 起動が必要な場合あり       |
| preview の URL 提示       | text 出力で案内                                                     | 同上                                                   |
| pom-cli 未インストール時  | `Bash` 実行時にエラーになり、agent がインストール手順を提示する想定 | 同上。CLI が無くてもプロンプト経路自体は完走するか確認 |

## 失敗時のヒント

- agent が preview コマンドを案内しない → SKILL.md「pom-cli が…プレビューサーバーを起動する」周辺が drift
- foreground 実行で long-running になり session が固まる → background 起動の指示が drift
- `pom-cli` 未導入で実行エラー → fixture スコープ外。実行は skip し、コマンド提示までを ✓ とする
