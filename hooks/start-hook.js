#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(process.env.CLAUDE_PROJECT_DIR, '.code-rudder', 'state.json');

// Check if enabled in state.json
try {
    const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
    const state = JSON.parse(stateContent);
    if (state.enabled === false) {
        console.log(JSON.stringify({
            hookSpecificOutput: {
                hookEventName: "SessionStart",
                additionalContext: ""
            }
        }, null, 2));
        process.exit(0);
    }
} catch (err) {
    // If state file doesn't exist or can't be read, continue normally
}

const BLOCK_REASON_FILE = path.join(process.env.CLAUDE_PLUGIN_ROOT, 'hooks', 'stop-hook-rules.md');

let reason = '';
try {
    const content = fs.readFileSync(BLOCK_REASON_FILE, 'utf8');
    reason = content.replace(/"/g, '\\"');
} catch (err) {
    reason = '';
}

console.log(JSON.stringify({
    hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: reason
    }
}, null, 2));
