#!/bin/bash
# Update the embedded llm.txt block in skills/pom-slide/SKILL.md to match
# the current content of apps/website/public/llm.txt.
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

python3 - <<'PYEOF'
import re, sys

with open('apps/website/public/llm.txt') as f:
    llm = f.read()
with open('skills/pom-slide/SKILL.md') as f:
    skill = f.read()

content = llm if llm.endswith('\n') else llm + '\n'
new, count = re.subn(
    r'(?<=<!-- BEGIN llm\.txt -->\n).*?(?=<!-- END llm\.txt -->)',
    content,
    skill,
    flags=re.DOTALL,
)

if count != 1:
    print(f'ERROR: マーカーが見つかりません (置換回数={count})。<!-- BEGIN llm.txt --> / <!-- END llm.txt --> の存在を確認してください。', file=sys.stderr)
    sys.exit(1)

if new == skill:
    print('already up to date')
    sys.exit(0)

with open('skills/pom-slide/SKILL.md', 'w') as f:
    f.write(new)

print('OK: skills/pom-slide/SKILL.md を apps/website/public/llm.txt で更新しました')
PYEOF
