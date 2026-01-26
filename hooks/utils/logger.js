#!/usr/bin/env node

/**
 * Logger Utility for Code Rudder Hooks
 *
 * 功能：
 * - 多级别日志（DEBUG, INFO, WARN, ERROR）
 * - 环境变量控制日志级别（LOG_LEVEL）
 * - 日志文件轮转
 * - 彩色终端输出
 * - 时间戳记录
 */

const fs = require('fs');
const path = require('path');

// 日志级别配置
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// ANSI颜色代码（用于终端输出）
const COLORS = {
  DEBUG: '\x1b[36m',    // Cyan
  INFO: '\x1b[32m',     // Green
  WARN: '\x1b[33m',     // Yellow
  ERROR: '\x1b[31m',    // Red
  RESET: '\x1b[0m'
};

class Logger {
  constructor(options = {}) {
    this.context = options.context || 'Hook';
    // 优先使用传入的logLevel，否则使用环境变量，最后默认INFO
    this.logLevel = this.parseLogLevel(options.logLevel || process.env.LOG_LEVEL || 'INFO');
    this.logFile = options.logFile || this.getDefaultLogFile();
    this.enableConsole = options.enableConsole !== false;
    this.enableFile = options.enableFile !== false;
    this.silent = options.silent === true;  // Silent mode for hooks

    // 创建日志目录
    if (this.enableFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * 解析日志级别
   * @param {string} level - 日志级别字符串
   * @returns {number} 日志级别数字
   */
  parseLogLevel(level) {
    const upperLevel = level.toUpperCase();
    return LOG_LEVELS[upperLevel] !== undefined ? LOG_LEVELS[upperLevel] : LOG_LEVELS.INFO;
  }

  /**
   * 获取默认日志文件路径
   * @returns {string} 日志文件路径
   */
  getDefaultLogFile() {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    return path.join(projectDir, '.code-rudder', 'logs', 'hooks.log');
  }

  /**
   * 格式化时间戳
   * @returns {string} ISO时间戳
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * 格式化日志消息
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @returns {string} 格式化后的消息
   */
  formatMessage(level, message) {
    return `[${this.getTimestamp()}] [${level}] [${this.context}] ${message}`;
  }

  /**
   * 写入日志文件
   * @param {string} formattedMessage - 格式化后的消息
   */
  writeToFile(formattedMessage) {
    if (!this.enableFile) {
      return;
    }

    try {
      // 检查日志文件大小，如果超过1MB则轮转
      if (fs.existsSync(this.logFile)) {
        const stats = fs.statSync(this.logFile);
        if (stats.size > 1024 * 1024) { // 1MB
          this.rotateLogFile();
        }
      }

      // 追加写入日志
      fs.appendFileSync(this.logFile, formattedMessage + '\n');
    } catch (err) {
      // 如果写入失败，输出到stderr
      console.error(`Failed to write to log file: ${err.message}`);
    }
  }

  /**
   * 轮转日志文件
   */
  rotateLogFile() {
    try {
      const backupPath = this.logFile + '.backup';
      // 删除旧的备份文件
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }
      // 重命名当前日志文件为备份
      fs.renameSync(this.logFile, backupPath);
    } catch (err) {
      console.error(`Failed to rotate log file: ${err.message}`);
    }
  }

  /**
   * 输出到终端（带颜色）
   * @param {string} level - 日志级别
   * @param {string} formattedMessage - 格式化后的消息
   */
  writeToConsole(level, formattedMessage) {
    if (!this.enableConsole) {
      return;
    }

    // 如果是Hook模式（silent=true），不输出到控制台避免干扰JSON
    if (this.silent) {
      return;
    }

    const color = COLORS[level] || COLORS.RESET;
    console.log(`${color}${formattedMessage}${COLORS.RESET}`);
  }

  /**
   * 记录日志
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   */
  log(level, message) {
    const levelNum = LOG_LEVELS[level];

    // 只记录高于或等于当前日志级别的消息
    if (levelNum < this.logLevel) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);

    // 输出到终端
    this.writeToConsole(level, formattedMessage);

    // 写入文件
    this.writeToFile(formattedMessage);
  }

  /**
   * DEBUG级别日志
   * @param {string} message - 日志消息
   */
  debug(message) {
    this.log('DEBUG', message);
  }

  /**
   * INFO级别日志
   * @param {string} message - 日志消息
   */
  info(message) {
    this.log('INFO', message);
  }

  /**
   * WARN级别日志
   * @param {string} message - 日志消息
   */
  warn(message) {
    this.log('WARN', message);
  }

  /**
   * ERROR级别日志
   * @param {string} message - 日志消息
   */
  error(message) {
    this.log('ERROR', message);
  }

  /**
   * 记录对象（JSON格式）
   * @param {string} level - 日志级别
   * @param {string} message - 日志消息
   * @param {Object} obj - 要记录的对象
   */
  logObject(level, message, obj) {
    const objStr = JSON.stringify(obj, null, 2);
    this.log(level, `${message}\n${objStr}`);
  }
}

/**
 * 创建Logger实例
 * @param {Object} options - 配置选项
 * @returns {Logger} Logger实例
 */
function createLogger(options) {
  return new Logger(options);
}

module.exports = {
  Logger,
  createLogger,
  LOG_LEVELS
};
