#!/usr/bin/env node

/**
 * Log Viewer Script
 *
 * 用途：查看Code Rudder Hook日志
 *
 * 使用方法：
 * node scripts/view-logs.js              # 查看最近100行
 * node scripts/view-logs.js -n 50        # 查看最近50行
 * node scripts/view-logs.js --tail       # 持续监控日志
 * node scripts/view-logs.js --error      # 只看错误日志
 * node scripts/view-logs.js --clear      # 清空日志文件
 */

const fs = require('fs');
const path = require('path');

// 日志文件路径
const LOG_FILE = path.join(process.cwd(), '.code-rudder', 'logs', 'hooks.log');

// 解析命令行参数
function parseArgs(args) {
  const options = {
    lines: 100,
    tail: false,
    filter: null,
    clear: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '-n':
        options.lines = parseInt(args[++i], 10);
        break;
      case '--tail':
        options.tail = true;
        break;
      case '--error':
        options.filter = 'ERROR';
        break;
      case '--warn':
        options.filter = 'WARN';
        break;
      case '--info':
        options.filter = 'INFO';
        break;
      case '--debug':
        options.filter = 'DEBUG';
        break;
      case '--clear':
        options.clear = true;
        break;
      case '-h':
      case '--help':
        printHelp();
        process.exit(0);
    }
  }

  return options;
}

/**
 * 打印帮助信息
 */
function printHelp() {
  console.log(`
Code Rudder Log Viewer

Usage:
  node scripts/view-logs.js [options]

Options:
  -n <number>     Number of lines to show (default: 100)
  --tail          Continuously monitor log file
  --error         Show only ERROR logs
  --warn          Show only WARN logs
  --info          Show only INFO logs
  --debug         Show only DEBUG logs
  --clear         Clear log file
  -h, --help      Show this help message

Examples:
  node scripts/view-logs.js              # Show last 100 lines
  node scripts/view-logs.js -n 50        # Show last 50 lines
  node scripts/view-logs.js --tail       # Continuously monitor
  node scripts/view-logs.js --error      # Show only errors
  node scripts/view-logs.js --clear      # Clear log file
  `);
}

/**
 * 读取日志文件
 * @param {number} lines - 读取的行数
 * @param {string} filter - 过滤级别
 * @returns {string[]} 日志行数组
 */
function readLogFile(lines, filter) {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`Log file not found: ${LOG_FILE}`);
    process.exit(0);
  }

  const content = fs.readFileSync(LOG_FILE, 'utf8');
  let logLines = content.split('\n').filter(line => line.trim());

  // 应用过滤器
  if (filter) {
    logLines = logLines.filter(line => line.includes(`[${filter}]`));
  }

  // 获取最后N行
  if (logLines.length > lines) {
    logLines = logLines.slice(-lines);
  }

  return logLines;
}

/**
 * 持续监控日志文件
 * @param {string} filter - 过滤级别
 */
function tailLogFile(filter) {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`Log file not found: ${LOG_FILE}`);
    process.exit(0);
  }

  let lastSize = fs.statSync(LOG_FILE).size;

  console.log(`Monitoring log file: ${LOG_FILE}`);
  console.log('Press Ctrl+C to stop\n');

  setInterval(() => {
    try {
      const stats = fs.statSync(LOG_FILE);

      if (stats.size > lastSize) {
        // 读取新增内容
        const fd = fs.openSync(LOG_FILE, 'r');
        const buffer = Buffer.alloc(stats.size - lastSize);
        fs.readSync(fd, buffer, 0, buffer.length, lastSize);
        fs.closeSync(fd);

        let newLines = buffer.toString('utf8').split('\n').filter(line => line.trim());

        // 应用过滤器
        if (filter) {
          newLines = newLines.filter(line => line.includes(`[${filter}]`));
        }

        // 输出新行
        newLines.forEach(line => {
          console.log(line);
        });

        lastSize = stats.size;
      }
    } catch (err) {
      console.error(`Error reading log file: ${err.message}`);
    }
  }, 1000); // 每秒检查一次
}

/**
 * 清空日志文件
 */
function clearLogFile() {
  if (!fs.existsSync(LOG_FILE)) {
    console.log(`Log file not found: ${LOG_FILE}`);
    process.exit(0);
  }

  try {
    fs.writeFileSync(LOG_FILE, '');
    console.log(`Log file cleared: ${LOG_FILE}`);
  } catch (err) {
    console.error(`Failed to clear log file: ${err.message}`);
    process.exit(1);
  }
}

/**
 * 主函数
 */
function main() {
  const options = parseArgs(process.argv.slice(2));

  // 处理清空日志
  if (options.clear) {
    clearLogFile();
    return;
  }

  // 处理持续监控
  if (options.tail) {
    tailLogFile(options.filter);
    return;
  }

  // 正常读取日志
  const logLines = readLogFile(options.lines, options.filter);

  if (logLines.length === 0) {
    console.log('No log entries found.');
    return;
  }

  // 输出日志
  logLines.forEach(line => {
    console.log(line);
  });

  console.log(`\nShowing ${logLines.length} ${options.filter ? options.filter : ''} log entries`);
  console.log(`Log file: ${LOG_FILE}`);
}

// 运行
if (require.main === module) {
  main();
}

module.exports = {
  readLogFile,
  tailLogFile,
  clearLogFile
};
