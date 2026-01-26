#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const blockReasonFile = path.join(process.env.CLAUDE_PROJECT_DIR, '.claude', 'hook', 'stop-hook-rules.md');

let reason = '';
try {
  reason = fs.readFileSync(blockReasonFile, 'utf8');
  // Escape newlines and quotes for JSON
  reason = reason.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
} catch (err) {
  // If file doesn't exist, leave reason empty
}

const output = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: reason
  }
};

console.log(JSON.stringify(output, null, 2));
