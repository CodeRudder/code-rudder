#!/bin/bash

BLOCK_REASON_FILE="${CLAUDE_PROJECT_DIR}/.claude/hook/stop-hook-rules.md"

reason=(cat "$BLOCK_REASON_FILE" | jq -Rs . | sed 's/^"//;s/"$//')


system_message=""

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "$reason"
  }
}
EOF
