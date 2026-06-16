# pom kit dev fixtures

`skills/pom-slide/` および `skills/pom-theme/` を編集したときに、Claude Code と Codex CLI **両方**で

1. skill として triggered されるか
2. 想定通りに動作するか（pom XML 生成・テーマ適用・preview 起動まで）

を手動で確認するための動作確認用プロンプト集。自動テスト化はスコープ外で、人間がチェックリストを目視で潰す前提。

## 使い方

### 0. symlink 配置（初回 / SKILL.md 編集後）

repo ルートで以下を実行し、`skills/<name>/` を Claude Code / Codex CLI 双方の探索パスに symlink する。

```bash
pnpm run dev:link-skills
```

**Claude Code は session 開始時にしか skill を読まないため、SKILL.md を編集した直後は agent 再起動が必須**。Codex CLI も同様にセッション再起動が安全。

### 1. fixture を選ぶ

| fixture                                                      | 目的                                                                         |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [`01-pom-slide-minimal.md`](./01-pom-slide-minimal.md)       | `pom-slide` が triggered され、テーマなしで pom XML を生成できる最小ケース   |
| [`02-pom-slide-with-theme.md`](./02-pom-slide-with-theme.md) | `pom-theme.json` が存在するときにブランド配色・フォントが適用されるケース    |
| [`03-pom-slide-preview.md`](./03-pom-slide-preview.md)       | 生成後に `pom preview`（pom-cli のバイナリ）が起動する経路                   |
| [`04-pom-theme-minimal.md`](./04-pom-theme-minimal.md)       | `pom-theme` skill が triggered され、`pom-theme.json` が生成される最小ケース |

### 2. 各 fixture を Claude Code と Codex CLI それぞれで走らせる

- fixture 内の「入力プロンプト」を、空ディレクトリ（または fixture 指定のセットアップ後）で agent に投げる
- 「期待される挙動チェックリスト」の各項目を ✓ / ✗ で評価する
- 「両 agent で確認するメモ」に書かれた agent 固有の差分があれば、その項目だけ別途確認する

### 3. プロンプト本体は agent 非依存

入力プロンプトは Claude Code / Codex CLI のどちらに投げても同じ文言で動くように書く。agent 固有の起動方法（Claude Code の `/pom-slide` slash command 経由 vs Codex CLI の自然言語起動など）は、各 fixture の「両 agent で確認するメモ」で併記する。

## スコープ外

- **自動 CI 化**: Claude Code / Codex CLI 上での triggered 判定を自動再現する仕組みは持たない（重実装。必要になれば別 issue 化）
- **Cursor / OpenCode 等**: 配布側（`npx skills add`）は対応しているが、開発時の動作確認 fixture は当面 Claude Code / Codex CLI の 2 agent に絞る
- **Windows**: symlink 制約のため対象外
