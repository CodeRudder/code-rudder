#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const codeRudderDir = path.join(cwd, '.code-rudder');
const stateFile = path.join(codeRudderDir, 'state.json');

// Check if state.json exists
if (!fs.existsSync(stateFile)) {
  console.error('state.json not found. Please run /rudder start first.');
  process.exit(1);
}

// Read and update state.json
const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
state.enabled = false;
fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));

console.log('Rudder stopped successfully! (enabled set to false)');
