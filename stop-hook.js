#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Constants
const TIME_WINDOW = 300; // 5 minutes in seconds
const MAX_ATTEMPTS = 5;
const CURRENT_TIME = Math.floor(Date.now() / 1000);

// Paths
const codeRudderDir = path.join(process.env.CLAUDE_PROJECT_DIR, '.claude', 'code-rudder');
const stateDir = path.join(codeRudderDir, 'state');
const stateFile = path.join(stateDir, 'stop-hook-state.json');
const blockReasonFile = path.join(codeRudderDir, 'stop-hook-rules.md');

// Ensure state directory exists
if (!fs.existsSync(stateDir)) {
  fs.mkdirSync(stateDir, { recursive: true });
}

// Read JSON input from stdin
async function readInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity
  });

  let input = '';
  for await (const line of rl) {
    input += line;
  }
  return input;
}

// Initialize state file
function initStateFile() {
  fs.writeFileSync(stateFile, JSON.stringify({ attempts: [] }, null, 2));
}

// Read and validate state file
function readState() {
  if (!fs.existsSync(stateFile)) {
    initStateFile();
    return { attempts: [] };
  }

  try {
    const content = fs.readFileSync(stateFile, 'utf8');
    const state = JSON.parse(content);
    if (!Array.isArray(state.attempts)) {
      initStateFile();
      return { attempts: [] };
    }
    return state;
  } catch (err) {
    initStateFile();
    return { attempts: [] };
  }
}

// Write state file
function writeState(state) {
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

// Check if should block
function checkShouldBlock(state) {
  const count = state.attempts.filter(ts => (CURRENT_TIME - ts) < TIME_WINDOW).length;
  return count >= MAX_ATTEMPTS;
}

// Add current attempt
function addAttempt(state) {
  state.attempts.push(CURRENT_TIME);
  writeState(state);
}

// Clean old attempts
function cleanupOldAttempts(state) {
  state.attempts = state.attempts.filter(ts => (CURRENT_TIME - ts) < TIME_WINDOW);
  writeState(state);
}

// Get last assistant output from transcript
function getLastOutput(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) {
    return '';
  }

  try {
    const content = fs.readFileSync(transcriptPath, 'utf8');
    const lines = content.split('\n').slice(-10);
    const lastAssistantLine = [...lines].reverse().find(line => line.includes('"role":"assistant"'));

    if (!lastAssistantLine) {
      return '';
    }

    const parsed = JSON.parse(lastAssistantLine);
    if (parsed.message && parsed.message.content) {
      return parsed.message.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
    }
    return '';
  } catch (err) {
    return '';
  }
}

// Check if task is completed
function isTaskCompleted(lastOutput) {
  return lastOutput.includes('STOPPED:TASK_COMPLETED') || lastOutput.includes('STOPPED:NO_TASKS');
}

// Output block response
function outputBlock(message) {
  const reason = `MUST check reason file carefully: ${blockReasonFile}`;
  console.log(JSON.stringify({
    decision: 'block',
    reason: reason,
    suppressOutput: false,
    systemMessage: `⚠️ ${message}`
  }, null, 2));
}

// Main function
async function main() {
  const input = await readInput();
  let inputData = {};
  try {
    inputData = JSON.parse(input);
  } catch (err) {
    inputData = {};
  }

  const stopHookActive = inputData.stop_hook_active === true;
  const transcriptPath = inputData.transcript_path;

  // Clean old attempts first
  let state = readState();
  cleanupOldAttempts(state);
  state = readState();

  // Get last output and check if task is completed
  const lastOutput = getLastOutput(transcriptPath);
  const taskCompleted = isTaskCompleted(lastOutput);

  // If stop_hook_active is not true or task is not completed, block
  if (!stopHookActive || !taskCompleted) {
    outputBlock('Continue');
    return;
  }

  // Add current attempt
  state = readState();
  addAttempt(state);

  // Check if should allow (threshold exceeded)
  state = readState();
  if (checkShouldBlock(state)) {
    // Allow the stop action (threshold exceeded)
    console.log(JSON.stringify({
      decision: undefined,
      suppressOutput: false,
      systemMessage: `✅ Stop allowed: stop_hook_active has been triggered more than ${MAX_ATTEMPTS} times within ${TIME_WINDOW}s.`
    }, null, 2));
    return;
  }

  // Block the stop action (default behavior)
  const currentCount = state.attempts.length;
  outputBlock(`Stop blocked: stop_hook_active attempts ${currentCount}.`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
