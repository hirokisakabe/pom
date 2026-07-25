#!/bin/bash
# Local skill development helper.
#
# `skills/<name>/` を source-of-truth として、Claude Code (`.claude/skills/`) と
# Codex CLI (`.agents/skills/`) 両方の探索パスに symlink を貼り直す。
# 既存の通常ファイル / ディレクトリ / 古い symlink は安全に削除してから再作成する (冪等)。
#
# macOS / Linux 対応。Windows は symlink 制約のため対象外。
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

if [ "$(uname -s)" = "MINGW64_NT" ] || [ "$(uname -s | cut -c1-6)" = "CYGWIN" ] || [ -n "${WINDIR:-}" ]; then
  echo "ERROR: Windows is not supported (symlink semantics differ)." >&2
  exit 1
fi

SKILLS=(pom-slide pom-theme)
AGENT_DIRS=(.claude/skills .agents/skills)

for agent_dir in "${AGENT_DIRS[@]}"; do
  mkdir -p "$agent_dir"
  for skill in "${SKILLS[@]}"; do
    target="$agent_dir/$skill"
    source="../../skills/$skill"

    if [ ! -d "skills/$skill" ]; then
      echo "ERROR: skills/$skill が存在しません" >&2
      exit 1
    fi

    # 既存の通常ファイル / 通常ディレクトリ / symlink を冪等に消す。
    # -e は壊れた symlink を見落とすので -L を併用する。
    if [ -e "$target" ] || [ -L "$target" ]; then
      rm -rf "$target"
    fi

    ln -s "$source" "$target"
    echo "linked: $target -> $source"
  done
done

echo ""
echo "Claude Code / Codex CLI 双方の探索パスに symlink を貼り直しました。"
echo "Claude Code は session 開始時にしか skill を読まないため、編集後は再起動が必要です。"
