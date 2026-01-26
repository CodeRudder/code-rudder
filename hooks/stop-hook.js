#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./utils/logger');

// 创建logger实例（silent模式避免干扰JSON输出）
const logger = createLogger({
  context: 'StopHook',
  logLevel: process.env.LOG_LEVEL || 'INFO',
  silent: true  // Hook脚本必须使用silent模式
});

// Stop Hook - Monitors stop_hook_active property
// Default behavior: block stop (block: true)
// If stop_hook_active is true more than 5 times within 5 minutes, allow stop (block: false)

const CURRENT_TIME = Math.floor(Date.now() / 1000);
const TIME_WINDOW = 300; // 5 minutes in seconds
const MAX_ATTEMPTS = 5;

// Get project directory from environment or use current working directory
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CODE_RUDDER_DIR = path.join(PROJECT_DIR, '.code-rudder');
const STATE_FILE = path.join(CODE_RUDDER_DIR, 'state.json');

// Get plugin root from environment or use current working directory
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || process.cwd();
const BLOCK_REASON_FILE = path.join(PLUGIN_ROOT, 'hooks', 'stop-hook-rules.md');

// Create .code-rudder directory if it doesn't exist
if (!fs.existsSync(CODE_RUDDER_DIR)) {
    fs.mkdirSync(CODE_RUDDER_DIR, { recursive: true });
}

// Read JSON input from stdin
let inputData = '';
process.stdin.on('data', (chunk) => {
    inputData += chunk;
});

process.stdin.on('end', () => {
    try {
        logger.debug('StopHook triggered');

        // Check if enabled in state.json
        try {
            const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
            const state = JSON.parse(stateContent);
            if (state.enabled === false) {
                // Don't block, allow to stop
                logger.info('Hook disabled, allowing stop');
                process.exit(0);
            }
        } catch (err) {
            // If state file doesn't exist or can't be read, continue normally
            logger.debug(`State file check failed: ${err.message}`);
        }

        const input = JSON.parse(inputData || '{}');
        const stopHookActive = input.stop_hook_active === true;
        const transcriptPath = input.transcript_path || '';

        logger.debug(`stopHookActive: ${stopHookActive}, transcriptPath: ${transcriptPath}`);

        // Function to get last assistant output
        function getLastOutput() {
            if (!transcriptPath) {
                return '';
            }

            try {
                const content = fs.readFileSync(transcriptPath, 'utf8');
                const lines = content.split('\n').slice(-10);
                const lastAssistantLine = [...lines].reverse().find(line =>
                    line.includes('"role":"assistant"')
                );

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

        // Function to check if task is completed
        function isTaskCompleted() {
            const lastOutput = getLastOutput();
            return lastOutput.includes('STOPPED:TASK_COMPLETED') ||
                   lastOutput.includes('STOPPED:NO_TASKS');
        }

        // Function to initialize state file
        function initStateFile() {
            fs.writeFileSync(STATE_FILE, JSON.stringify({ enabled: true, attempts: [] }, null, 2));
        }

        // Initialize state file if it doesn't exist
        if (!fs.existsSync(STATE_FILE)) {
            logger.debug('Initializing state file');
            initStateFile();
        }

        // Check if file is valid JSON, if not, reinitialize
        try {
            const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
            JSON.parse(stateContent);
        } catch (err) {
            logger.warn(`State file corrupted, reinitializing: ${err.message}`);
            initStateFile();
        }

        // Function to check if should block
        function checkShouldBlock() {
            try {
                const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
                const state = JSON.parse(stateContent);
                const attempts = state.attempts || [];

                // Count attempts within time window
                const count = attempts.filter(timestamp => {
                    const elapsed = CURRENT_TIME - timestamp;
                    return elapsed < TIME_WINDOW;
                }).length;

                return count >= MAX_ATTEMPTS;
            } catch (err) {
                return false;
            }
        }

        // Function to add current attempt
        function addAttempt() {
            try {
                let stateContent = fs.readFileSync(STATE_FILE, 'utf8');
                let state;

                try {
                    state = JSON.parse(stateContent);
                } catch (err) {
                    initStateFile();
                    state = { enabled: true, attempts: [] };
                }

                state.attempts = state.attempts || [];
                state.attempts.push(CURRENT_TIME);
                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            } catch (err) {
                initStateFile();
            }
        }

        // Function to clean old attempts
        function cleanupOldAttempts() {
            try {
                let stateContent = fs.readFileSync(STATE_FILE, 'utf8');
                let state;

                try {
                    state = JSON.parse(stateContent);
                } catch (err) {
                    initStateFile();
                    return;
                }

                state.attempts = (state.attempts || []).filter(timestamp => {
                    return timestamp > (CURRENT_TIME - TIME_WINDOW);
                });

                fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
            } catch (err) {
                initStateFile();
            }
        }

        // Function to output block response
        function outputBlock(message, reasonFile) {
            const reason = `${message}\n\nMUST check reason file carefully: ${reasonFile}`;
            const result = {
                decision: "block",
                reason: reason,
                suppressOutput: false
            };
            console.log(JSON.stringify(result, null, 2));
        }

        // Clean old attempts first
        cleanupOldAttempts();

        // Check if task is completed
        const taskCompleted = isTaskCompleted();

        // Add current attempt
        addAttempt();

        // Check if should allow (more than threshold)
        const shouldAllow = checkShouldBlock();

        // If task is completed, check attempts to decide
        if (taskCompleted) {
            logger.info('Task completed detected');
            if (shouldAllow) {
                // Task completed and threshold exceeded - allow stop
                logger.info('Task completed and threshold exceeded, allowing stop');
                process.exit(0);
            }
            // Task completed but threshold not reached - block with attempt count
            const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
            const state = JSON.parse(stateContent);
            const currentCount = state.attempts ? state.attempts.length : 0;
            logger.info(`Task completed but threshold not reached (${currentCount}/${MAX_ATTEMPTS}), blocking`);
            outputBlock(`Task completed. Stop blocked: stop_hook_active attempts ${currentCount}/${MAX_ATTEMPTS}.`, BLOCK_REASON_FILE);
            process.exit(0);
        }

        // Task not completed - block immediately
        if (!stopHookActive) {
            logger.debug('stopHookActive is false, blocking with Continue');
            outputBlock("Continue", BLOCK_REASON_FILE);
            process.exit(0);
        }

        // stopHookActive is true but task not completed - block with attempt count
        const stateContent = fs.readFileSync(STATE_FILE, 'utf8');
        const state = JSON.parse(stateContent);
        const currentCount = state.attempts ? state.attempts.length : 0;
        outputBlock(`Stop blocked: stop_hook_active attempts ${currentCount}/${MAX_ATTEMPTS}.`, BLOCK_REASON_FILE);

        process.exit(0);
    } catch (err) {
        logger.error(`StopHook error: ${err.message}`);
        console.error('Error:', err.message);
        process.exit(1);
    }
});
