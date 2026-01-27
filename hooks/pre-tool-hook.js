#!/usr/bin/env node

/**
 * PreToolUse Hook - 在工具调用前拦截
 *
 * 功能：拦截危险的命令操作，保护系统安全
 *
 * 输入（stdin JSON）：
 * {
 *   "tool_name": "Edit|Write|Read|Bash...",
 *   "tool_input": { ... },
 *   "cwd": "...",
 *   "session_id": "...",
 *   ...
 * }
 *
 * 输出：
 * - 退出代码 0: 允许操作
 * - JSON输出: 使用permissionDecision控制是否允许操作
 */

const { createLogger } = require('./utils/logger');

// 创建logger实例（silent模式避免干扰JSON输出）
const logger = createLogger({
  context: 'PreToolHook',
  logLevel: process.env.LOG_LEVEL || 'INFO',
  silent: true  // Hook脚本必须使用silent模式
});

// 危险命令模式列表
const DANGEROUS_COMMANDS = [
  // 删除命令
  /\brm\s+-rf?\s+[\/~]/i,                    // rm -rf / 或 rm -rf ~
  /\brm\s+-rf?\s+\.\./i,                     // rm -rf ../
  /\brm\s+-rf?\s+--no-preserve-root\s+\//i,  // rm -rf --no-preserve-root /
  /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f[a-zA-Z]*\s+\//i,  // rm -fr /, rm -rf / 等变体（参数组合）
  /\brm\s+-[a-zA-Z]*f[a-zA-Z]*r[a-zA-Z]*\s+\//i,  // rm -f -r / 等变体
  /\brm\s+(?:-[a-zA-Z]+\s+)+[\/~]/i,         // rm -r -f / 等多参数变体

  // 磁盘格式化
  /\bmkfs\./i,                                // mkfs.ext4, mkfs.xfs 等
  /\bmkfs\s+/i,                               // mkfs 命令

  // 磁盘写入
  /\bdd\s+if=/i,                              // dd 命令写入
  /\bdd\s+of=/i,                              // dd 命令输出到磁盘

  // 分区操作
  /\bfdisk\s+/i,
  /\bparted\s+/i,
  /\bpartprobe\s+/i,

  // 强制杀进程
  /\bkill\s+-9\s+1\b/i,                       // kill -9 1 (杀死init进程)
  /\bkill\s+-9\s+-1\b/i,                      // kill -9 -1 (杀死所有进程)

  // 系统关机/重启
  /\bshutdown\s+(-h\s+)?now\b/i,
  /\bpoweroff\b/i,
  /\breboot\s*-f\b/i,
  /\binit\s+0\b/i,
  /\bhalt\b/i,

  // Fork炸弹 - 多种模式
  /:\(\)\{\s*:\|:\&\s*\}\s*;/i,               // :(){ :|: & };:
  /\w\(\)\{\s*\w\|\w\&\s*\}\s*;/i,            // 变体: func(){ func|func & };:
];

/**
 * 检查命令是否危险
 * @param {string} command - 要执行的命令
 * @returns {Object} { isDangerous: boolean, reason: string }
 */
function checkDangerousCommand(command) {
  if (!command || typeof command !== 'string') {
    return { isDangerous: false, reason: '' };
  }

  // 移除命令前后的空白字符
  const cmd = command.trim();

  // 检查是否匹配任何危险模式
  for (const pattern of DANGEROUS_COMMANDS) {
    if (pattern.test(cmd)) {
      return {
        isDangerous: true,
        reason: `检测到危险命令: 该命令可能对系统造成严重破坏`
      };
    }
  }

  // 检查是否包含多个危险的删除操作
  const rmCount = (cmd.match(/\brm\b/g) || []).length;
  if (rmCount >= 3) {
    return {
      isDangerous: true,
      reason: `检测到多个连续的删除命令，可能存在风险`
    };
  }

  return { isDangerous: false, reason: '' };
}

/**
 * 输出阻塞响应
 * @param {string} reason - 阻塞原因
 */
function outputBlock(reason) {
  const response = {
    "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": reason
    }
  };
  console.log(JSON.stringify(response));
}

/**
 * 主处理函数
 */
function main() {
  let inputData = '';

  process.stdin.on('data', (chunk) => {
    inputData += chunk;
  });

  process.stdin.on('end', () => {
    try {
      // 解析输入
      const input = JSON.parse(inputData || '{}');
      const toolName = input.tool_name || '';
      const toolInput = input.tool_input || {};

      logger.debug(`PreToolHook: ${toolName}`);

      // 检查Bash工具的命令
      if (toolName === 'Bash') {
        const command = toolInput.command || '';

        if (command) {
          logger.debug(`Checking command: ${command.substring(0, 100)}...`);

          // 检查是否为危险命令
          const dangerCheck = checkDangerousCommand(command);
          if (dangerCheck.isDangerous) {
            logger.warn(`Blocked dangerous command: ${command.substring(0, 100)}`);
            outputBlock(dangerCheck.reason);
            process.exit(0); // JSON输出时使用退出码0
          }
        }
      }

      // 允许所有操作
      process.exit(0);

    } catch (err) {
      logger.error(`PreToolHook error: ${err.message}`);
      process.exit(1);
    }
  });
}

// 启动处理
main();
