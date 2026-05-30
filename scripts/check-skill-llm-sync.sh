#!/bin/bash
# Check that the embedded llm.txt block in skills/pom-slide/SKILL.md matches
# apps/website/public/llm.txt. Exit 1 if they differ.
set -euo pipefail

LLM_TXT="apps/website/public/llm.txt"
SKILL_MD="skills/pom-slide/SKILL.md"

if [ ! -f "$LLM_TXT" ]; then
  echo "ERROR: $LLM_TXT が見つかりません" >&2
  exit 1
fi

if [ ! -f "$SKILL_MD" ]; then
  echo "ERROR: $SKILL_MD が見つかりません" >&2
  exit 1
fi

embedded=$(awk '/<!-- BEGIN llm\.txt -->/{found=1; next} /<!-- END llm\.txt -->/{found=0} found' "$SKILL_MD")

if diff <(printf '%s\n' "$embedded") "$LLM_TXT" > /dev/null 2>&1; then
  echo "OK: $SKILL_MD の埋め込みブロックは $LLM_TXT と一致しています"
  exit 0
fi

echo "ERROR: $SKILL_MD の埋め込みブロックが $LLM_TXT と一致しません" >&2
echo "以下のコマンドで同期してください:" >&2
echo "  bash scripts/sync-skill-llm.sh" >&2
echo "" >&2
diff <(printf '%s\n' "$embedded") "$LLM_TXT" >&2 || true
exit 1
