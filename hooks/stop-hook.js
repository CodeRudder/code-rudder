#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createLogger } = require('./utils/logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const ATTEMPT_TIME_WINDOW_SECONDS = 300; // 5 minutes in seconds
const MAX_ATTEMPT_THRESHOLD = 5;
const ABNORMAL_EXIT_THRESHOLD = 10; // 异常退出阈值：5分钟内连续停止10次
const ERROR_TIME_WINDOW_SECONDS = 600; // 10 minutes in seconds
const MAX_ERROR_ATTEMPT_THRESHOLD = 20;
const TRANSCRIPT_LINE_COUNT = 10;

// Get project directory from environment or use current working directory
const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const CODE_RUDDER_DIR = path.join(PROJECT_DIR, '.code-rudder');
const STATE_FILE = path.join(CODE_RUDDER_DIR, 'state.json');

// Get plugin root from environment or use current working directory
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || process.cwd();
const BLOCK_REASON_FILE = path.join(PLUGIN_ROOT, 'hooks', 'stop-hook-rules.md');

// 创建logger实例（silent模式避免干扰JSON输出）
const logger = createLogger({
  context: 'StopHook',
  logLevel: process.env.LOG_LEVEL || 'INFO',
  silent: true  // Hook脚本必须使用silent模式
});

// ============================================================================
// HELPER FUNCTIONS - Transcript Operations
// ============================================================================

/**
 * Get last assistant message object from transcript
 * @param {string} transcriptPath - Path to transcript file
 * @returns {object|null} Parsed message object or null
 */
function getLastAssistantMessage(transcriptPath) {
    if (!transcriptPath) {
        return null;
    }

    try {
        const content = fs.readFileSync(transcriptPath, 'utf8');
        // 获取最后10行内容
        // 如果文件内容少于10行，slice(-10)会返回所有行，不会报错
        // 例如：只有3行时，返回全部3行；有100行时，返回最后10行
        const lines = content.split('\n').slice(-TRANSCRIPT_LINE_COUNT);
        // 从后往前查找最后一条assistant消息
        const lastAssistantLine = [...lines].reverse().find(line =>
            line.includes('"role":"assistant"')
        );

        if (!lastAssistantLine) {
            return null;
        }

        return JSON.parse(lastAssistantLine);
    } catch (err) {
        return null;
    }
}

/**
 * Get last assistant output text from message
 * @param {string} transcriptPath - Path to transcript file
 * @returns {string} Text content or empty string
 */
function getLastAssistantOutputText(transcriptPath) {
    const message = getLastAssistantMessage(transcriptPath);
    if (!message || !message.message || !message.message.content) {
        return '';
    }

    try {
        return message.message.content
            .filter(item => item.type === 'text')
            .map(item => item.text)
            .join('\n');
    } catch (err) {
        return '';
    }
}

// ============================================================================
// HELPER FUNCTIONS - State Checks
// ============================================================================

/**
 * Check if task is completed based on output
 * @param {string} transcriptPath - Path to transcript file
 * @returns {boolean} True if task is completed
 */
function isTaskCompleted(transcriptPath) {
    const lastOutput = getLastAssistantOutputText(transcriptPath);
    return lastOutput.includes('STOPPED:TASK_COMPLETED') ||
           lastOutput.includes('STOPPED:NO_TASKS');
}

/**
 * Check if last output is an API error
 * Uses message metadata to determine if this is an API error
 * Special case: ignores 'API Error: 504' errors
 * @param {string} transcriptPath - Path to transcript file
 * @returns {boolean} True if last output is an API error
 */
function isLastOutputAnApiError(transcriptPath) {
    const message = getLastAssistantMessage(transcriptPath);
    if (!message) {
        return false;
    }

    // If not marked as API error message, return false
    if (message.isApiErrorMessage === false) {
        return false;
    }

    // Extract text content from message
    if (!message.message || !message.message.content) {
        return false;
    }

    const textContent = message.message.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n')
        .trim();

    if (!textContent) {
        return false;
    }

    // Special case: ignore 504 Gateway Timeout errors
    if (textContent.toLowerCase().startsWith('api error: 504')) {
        return false;
    }

    return true;
}

// ============================================================================
// HELPER FUNCTIONS - State File Management
// ============================================================================

/**
 * Initialize state file with default structure
 */
function initializeStateFile() {
    const initialState = {
        enabled: true,
        attempts: [],
        error_attempts: []
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(initialState, null, 2));
}

/**
 * Read and parse state file
 * @returns {object|null} Parsed state or null on error
 */
function readStateFromFile() {
    try {
        const content = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(content);
    } catch (err) {
        return null;
    }
}

/**
 * Write state to file
 * @param {object} state - State object to write
 */
function writeStateToFile(state) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

/**
 * Ensure state file exists and is valid
 */
function ensureStateFileExists() {
    // Create .code-rudder directory if it doesn't exist
    if (!fs.existsSync(CODE_RUDDER_DIR)) {
        fs.mkdirSync(CODE_RUDDER_DIR, { recursive: true });
    }

    // Initialize state file if it doesn't exist
    if (!fs.existsSync(STATE_FILE)) {
        logger.debug('Initializing state file');
        initializeStateFile();
        return;
    }

    // Check if file is valid JSON, if not, reinitialize
    try {
        const content = fs.readFileSync(STATE_FILE, 'utf8');
        JSON.parse(content);
    } catch (err) {
        logger.warn(`State file corrupted, reinitializing: ${err.message}`);
        initializeStateFile();
    }
}

/**
 * Check if hook is enabled
 * @returns {boolean} True if hook is enabled
 */
function isHookEnabled() {
    const state = readStateFromFile();
    return state && state.enabled !== false;
}

// ============================================================================
// HELPER FUNCTIONS - Attempt Tracking
// ============================================================================

/**
 * Count attempts within time window
 * @param {number[]} attempts - Array of timestamps
 * @param {number} timeWindowSeconds - Time window in seconds
 * @returns {number} Count of attempts within window
 */
function countAttemptsWithinWindow(attempts, timeWindowSeconds) {
    const currentTime = Math.floor(Date.now() / 1000);
    return attempts.filter(timestamp => {
        const elapsed = currentTime - timestamp;
        return elapsed < timeWindowSeconds;
    }).length;
}

/**
 * Generic function to check if attempt threshold is reached
 * @param {string} attemptKey - Key in state for attempt array (e.g., 'attempts', 'error_attempts')
 * @param {number} timeWindowSeconds - Time window in seconds
 * @param {number} threshold - Threshold value
 * @returns {boolean} True if threshold is reached
 */
function isAttemptThresholdReached(attemptKey, timeWindowSeconds, threshold) {
    const state = readStateFromFile();
    if (!state) {
        return false;
    }

    const attempts = state[attemptKey] || [];
    const count = countAttemptsWithinWindow(attempts, timeWindowSeconds);
    return count >= threshold;
}

/**
 * Check if normal attempt threshold is reached
 * @returns {boolean} True if threshold is reached
 */
function isNormalAttemptThresholdReached() {
    return isAttemptThresholdReached('attempts', ATTEMPT_TIME_WINDOW_SECONDS, MAX_ATTEMPT_THRESHOLD);
}

/**
 * Check if error attempt threshold is reached
 * @returns {boolean} True if error threshold is reached
 */
function isErrorAttemptThresholdReached() {
    return isAttemptThresholdReached('error_attempts', ERROR_TIME_WINDOW_SECONDS, MAX_ERROR_ATTEMPT_THRESHOLD);
}

/**
 * Check if abnormal exit threshold is reached
 * 当用户频繁尝试停止时（5分钟内10次），认为可能是异常情况，允许退出
 * @returns {boolean} True if abnormal exit threshold is reached
 */
function isAbnormalExitThresholdReached() {
    return isAttemptThresholdReached('attempts', ATTEMPT_TIME_WINDOW_SECONDS, ABNORMAL_EXIT_THRESHOLD);
}

/**
 * Generic function to record attempt timestamp
 * @param {string} attemptKey - Key in state for attempt array (e.g., 'attempts', 'error_attempts')
 */
function recordAttemptTimestamp(attemptKey) {
    const currentTime = Math.floor(Date.now() / 1000);
    let state = readStateFromFile();

    if (!state) {
        initializeStateFile();
        state = { enabled: true, attempts: [], error_attempts: [] };
    }

    state[attemptKey] = state[attemptKey] || [];
    state[attemptKey].push(currentTime);
    writeStateToFile(state);
}

/**
 * Record normal attempt
 */
function recordNormalAttempt() {
    recordAttemptTimestamp('attempts');
}

/**
 * Record error attempt
 */
function recordErrorAttempt() {
    recordAttemptTimestamp('error_attempts');
}

/**
 * Generic function to remove old attempts outside time window
 * @param {string} attemptKey - Key in state for attempt array (e.g., 'attempts', 'error_attempts')
 * @param {number} timeWindowSeconds - Time window in seconds
 */
function removeOldAttempts(attemptKey, timeWindowSeconds) {
    const currentTime = Math.floor(Date.now() / 1000);
    let state = readStateFromFile();

    if (!state) {
        initializeStateFile();
        return;
    }

    state[attemptKey] = (state[attemptKey] || []).filter(timestamp => {
        return timestamp > (currentTime - timeWindowSeconds);
    });

    writeStateToFile(state);
}

/**
 * Remove old normal attempts outside time window
 */
function removeOldNormalAttempts() {
    removeOldAttempts('attempts', ATTEMPT_TIME_WINDOW_SECONDS);
}

/**
 * Remove old error attempts outside time window
 */
function removeOldErrorAttempts() {
    removeOldAttempts('error_attempts', ERROR_TIME_WINDOW_SECONDS);
}

// ============================================================================
// HELPER FUNCTIONS - Output
// ============================================================================

/**
 * Output block decision to stdout
 * @param {string} message - Block message
 * @param {string} reasonFile - Path to reason file
 */
function outputBlockDecision(message, reasonFile) {
    const reason = `${message}\n\nMUST check reason file carefully: ${reasonFile}`;
    const result = {
        decision: "block",
        reason: reason,
        suppressOutput: false
    };
    console.log(JSON.stringify(result, null, 2));
}

/**
 * Get current attempt count from state
 * @returns {number} Current attempt count
 */
function getCurrentAttemptCount() {
    const state = readStateFromFile();
    return state && state.attempts ? state.attempts.length : 0;
}

// ============================================================================
// MAIN LOGIC
// ============================================================================

/**
 * Process stop hook logic
 * @param {object} input - Parsed input data
 */
function processStopHook(input) {
    const stopHookActive = input.stop_hook_active === true;
    const transcriptPath = input.transcript_path || '';

    logger.debug(`stopHookActive: ${stopHookActive}, transcriptPath: ${transcriptPath}`);

    // Clean old attempts first
    removeOldNormalAttempts();
    removeOldErrorAttempts();

    // Check if task is completed
    const taskCompleted = isTaskCompleted(transcriptPath);

    // Check if last output is an error
    const lastOutputIsError = isLastOutputAnApiError(transcriptPath);
    if (lastOutputIsError) {
        logger.info('Last output is an error, recording error attempt');
        recordErrorAttempt();
    }

    // Add current attempt
    recordNormalAttempt();

    // Check if should allow by error count (more than threshold)
    const hasExceededErrorThreshold = isErrorAttemptThresholdReached();
    if (hasExceededErrorThreshold) {
        logger.info(`Error threshold exceeded (${MAX_ERROR_ATTEMPT_THRESHOLD} errors in ${ERROR_TIME_WINDOW_SECONDS}s), allowing stop`);
        process.exit(0);
    }

    // Check if should allow by abnormal exit count (frequent stop attempts)
    const hasExceededAbnormalExitThreshold = isAbnormalExitThresholdReached();
    if (hasExceededAbnormalExitThreshold) {
        logger.info(`Abnormal exit threshold exceeded (${ABNORMAL_EXIT_THRESHOLD} stops in ${ATTEMPT_TIME_WINDOW_SECONDS}s), allowing stop`);
        process.exit(0);
    }

    // Check if should allow (more than threshold)
    const hasExceededAttemptThreshold = isNormalAttemptThresholdReached();

    // If task is completed, check attempts to decide
    if (taskCompleted) {
        logger.info('Task completed detected');
        if (hasExceededAttemptThreshold) {
            // Task completed and threshold exceeded - allow stop
            logger.info('Task completed and threshold exceeded, allowing stop');
            process.exit(0);
        }
        // Task completed but threshold not reached - block with attempt count
        const currentCount = getCurrentAttemptCount();
        logger.info(`Task completed but threshold not reached (${currentCount}/${MAX_ATTEMPT_THRESHOLD}), blocking`);
        outputBlockDecision(`Task completed. Stop blocked: stop_hook_active attempts ${currentCount}/${MAX_ATTEMPT_THRESHOLD}.`, BLOCK_REASON_FILE);
        process.exit(0);
    }

    // Task not completed - block immediately
    if (!stopHookActive) {
        logger.debug('stopHookActive is false, blocking with Continue');
        outputBlockDecision("Continue", BLOCK_REASON_FILE);
        process.exit(0);
    }

    // stopHookActive is true but task not completed - block with attempt count
    const currentCount = getCurrentAttemptCount();
    outputBlockDecision(`Stop blocked: stop_hook_active attempts ${currentCount}/${MAX_ATTEMPT_THRESHOLD}.`, BLOCK_REASON_FILE);
    process.exit(0);
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Read JSON input from stdin
let inputData = '';
process.stdin.on('data', (chunk) => {
    inputData += chunk;
});

process.stdin.on('end', () => {
    try {
        logger.debug('StopHook triggered');

        // Ensure state file exists and is valid
        ensureStateFileExists();

        // Check if enabled in state.json
        if (!isHookEnabled()) {
            logger.info('Hook disabled, allowing stop');
            process.exit(0);
        }

        // Parse input
        const input = JSON.parse(inputData || '{}');

        // Process stop hook
        processStopHook(input);

    } catch (err) {
        logger.error(`StopHook error: ${err.message}`);
        console.error('Error:', err.message);
        process.exit(1);
    }
});
