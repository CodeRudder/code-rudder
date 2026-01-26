#!/bin/bash

# Stop Hook - Monitors stop_hook_active property
# Default behavior: block stop (block: true)
# If stop_hook_active is true more than 5 times within 5 minutes, allow stop (block: false)


# Current timestamp in seconds
CURRENT_TIME=$(date +%s)
TIME_WINDOW=300  # 5 minutes in seconds
MAX_ATTEMPTS=5


# Read JSON input from stdin
INPUT=$(cat)

# Extract stop_hook_active property
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

CODE_RUDDER_DIR="${CLAUDE_PROJECT_DIR}/.claude/code-rudder"
# State file to track stop attempts
STATE_DIR="$CODE_RUDDER_DIR/state"
STATE_FILE="$STATE_DIR/stop-hook-state.json"
mkdir -p "$STATE_DIR"

BLOCK_REASON_FILE="$CODE_RUDDER_DIR/stop-hook-rules.md"

# Extract transcript_path from input
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path')

# Function to get last assistant output
get_last_output() {
    if [[ -z "$TRANSCRIPT_PATH" ]]; then
        echo ""
        return
    fi

    local last_line=$(tail -n 10 "$TRANSCRIPT_PATH" | grep '"role":"assistant"' | tail -1)
    if [[ -z "$last_line" ]]; then
        echo ""
        return
    fi

    echo "$last_line" | jq -r '
        .message.content |
        map(select(.type == "text")) |
        map(.text) |
        join("\n")
    ' 2>/dev/null || echo ""
}

# Function to check if task is completed
is_task_completed() {
    local last_output=$(get_last_output)
    if [[ "$last_output" == *"STOPPED:TASK_COMPLETED"* ]] || [[ "$last_output" == *"STOPPED:NO_TASKS"* ]]; then
        echo "true"
    else
        echo "false"
    fi
}



# Initialize state file if it doesn't exist or is invalid
init_state_file() {
    echo '{"attempts": []}' > "$STATE_FILE"
}

if [ ! -f "$STATE_FILE" ]; then
    init_state_file
fi

# Check if file is valid JSON, if not, reinitialize
if ! jq empty "$STATE_FILE" 2>/dev/null; then
    init_state_file
fi

# Function to check if should block
check_should_block() {
    local attempts=$(jq -r '.attempts[]' "$STATE_FILE" 2>/dev/null || echo "")
    local count=0

    if [ -z "$attempts" ]; then
        echo "false"
        return
    fi

    # Count attempts within time window
    while IFS= read -r timestamp; do
        local elapsed=$((CURRENT_TIME - timestamp))
        if [ $elapsed -lt $TIME_WINDOW ]; then
            count=$((count + 1))
        fi
    done <<< "$attempts"

    if [ $count -ge $MAX_ATTEMPTS ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Function to add current attempt
add_attempt() {
    local current_state=$(cat "$STATE_FILE" 2>/dev/null)
    if [ -z "$current_state" ] || ! echo "$current_state" | jq empty 2>/dev/null; then
        init_state_file
        current_state='{"attempts": []}'
    fi
    echo "$current_state" | jq --arg ts "$CURRENT_TIME" '.attempts += [$ts | tonumber]' > "$STATE_FILE.tmp"
    mv "$STATE_FILE.tmp" "$STATE_FILE"
}

# Function to clean old attempts
cleanup_old_attempts() {
    local current_state=$(cat "$STATE_FILE" 2>/dev/null)
    if [ -z "$current_state" ] || ! echo "$current_state" | jq empty 2>/dev/null; then
        init_state_file
        return
    fi
    echo "$current_state" | jq --argjson ct "$CURRENT_TIME" --argjson tw "$TIME_WINDOW" '
        .attempts = [.attempts[] | tonumber | select(. > ($ct - $tw))]
    ' > "$STATE_FILE.tmp"
    mv "$STATE_FILE.tmp" "$STATE_FILE"
}

# Clean old attempts first
cleanup_old_attempts

# Function to output block response
output_block() {
    local message="$1"
    local reason_file="$2"

    # if [ -f "$reason_file" ]; then
    #     REASON=$(cat "$reason_file" | jq -Rs . | sed 's/^"//;s/"$//')
    # else
        REASON="MUST check reason file carefully: $reason_file"
    # fi

    cat <<EOF
{
  "decision": "block",
  "reason": "${REASON}",
  "suppressOutput": false,
  "systemMessage": "⚠️ ${message}"
}
EOF
}

# Check if task is completed first
TASK_COMPLETED=$(is_task_completed)

# If stop_hook_active is not true, block immediately
if [ "$STOP_HOOK_ACTIVE" != "true" ] || [ "$TASK_COMPLETED" != "true" ]; then
    # output_block "Stop blocked: stop_hook_active is false" "$BLOCK_REASON_FILE"
    output_block "Continue" "$BLOCK_REASON_FILE"
    exit 0
fi

# Check if task is completed first
# TASK_COMPLETED=$(is_task_completed)
# if [ "$TASK_COMPLETED" = "true" ]; then
#     # Allow stop when task is completed
#     cat <<EOF
# {
#   "decision": undefined,
#   "suppressOutput": false,
#   "systemMessage": "✅ Stop allowed: Task stopped marker detected."
# }
# EOF
#     exit 0
# fi

# Add current attempt
add_attempt

# Check if should allow (more than threshold)
SHOULD_ALLOW=$(check_should_block)

if [ "$SHOULD_ALLOW" = "true" ]; then
    # Allow the stop action (threshold exceeded)
    cat <<EOF
{
  "decision": undefined,
  "suppressOutput": false,
  "systemMessage": "✅ Stop allowed: stop_hook_active has been triggered more than $MAX_ATTEMPTS times within ${TIME_WINDOW}s."
}
EOF
    exit 0
fi

# Block the stop action (default behavior)
CURRENT_COUNT=$(jq -r '.attempts | length' "$STATE_FILE" 2>/dev/null || echo "0")
output_block "Stop blocked: stop_hook_active attempts $CURRENT_COUNT." "$BLOCK_REASON_FILE"
exit 0
