#!/usr/bin/env node

/**
 * PreToolUse Hook - 在工具调用前拦截
 *
 * 功能：
 * 1. 拦截Edit/Write工具，检查文件路径
 * 2. 验证代码修改内容
 * 3. 执行代码质量检查
 *
 * 输入（stdin JSON）：
 * {
 *   "tool_name": "Edit|Write|Read|...",
 *   "tool_input": { ... },
 *   "cwd": "...",
 *   "session_id": "...",
 *   ...
 * }
 *
 * 输出：
 * - 退出代码 0: 允许操作
 * - 退出代码 2: 阻止操作，stderr显示原因
 * - JSON输出: 高级控制
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 敏感文件列表（不可修改）
  sensitiveFiles: [
    '.env',
    '.env.local',
    '.env.production',
    '.git',
    'node_modules',
    '.claude/settings.local.json',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ],

  // 敏感文件模式
  sensitivePatterns: [
    /[\/\\]\.git[\/\\]/,  // 支持 Unix (/) 和 Windows (\) 路径分隔符
    /[\/\\]node_modules[\/\\]/,
    /\.env$/,
    /-lock\.(json|yaml)$/
  ],

  // 规则文件路径
  rulesFile: path.join(__dirname, 'pre-tool-hook-rules.md')
};

/**
 * 检查文件路径是否敏感
 * @param {string} filePath - 文件路径
 * @returns {Object} { isSensitive: boolean, reason: string }
 */
function checkSensitivePath(filePath) {
  if (!filePath) {
    return { isSensitive: false, reason: '' };
  }

  // 检查敏感文件名
  const fileName = path.basename(filePath);
  if (CONFIG.sensitiveFiles.includes(fileName)) {
    return {
      isSensitive: true,
      reason: `文件 "${fileName}" 是敏感文件，不允许修改`
    };
  }

  // 检查敏感路径模式
  for (const pattern of CONFIG.sensitivePatterns) {
    if (pattern.test(filePath)) {
      return {
        isSensitive: true,
        reason: `文件路径 "${filePath}" 匹配敏感模式，不允许修改`
      };
    }
  }

  // 检查路径中是否包含敏感目录（同时支持 / 和 \ 分隔符）
  const pathParts = filePath.split(/[\/\\]/);  // 使用正则分割，同时匹配 / 和 \
  for (const part of pathParts) {
    if (CONFIG.sensitiveFiles.includes(part)) {
      return {
        isSensitive: true,
        reason: `路径包含敏感目录 "${part}"，不允许修改`
      };
    }
  }

  return { isSensitive: false, reason: '' };
}

/**
 * 验证Edit/Write操作的代码内容
 * @param {string} content - 文件内容
 * @param {string} filePath - 文件路径
 * @returns {Object} { isValid: boolean, warnings: string[] }
 */
function validateCodeContent(content, filePath) {
  const warnings = [];

  if (!content || content.length < 10) {
    return { isValid: true, warnings: [] };
  }

  // 检查是否包含console.log（生产代码中不应该有）
  const ext = path.extname(filePath).toLowerCase();
  if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
    if (content.includes('console.log') && !filePath.includes('test')) {
      warnings.push('代码中包含console.log，生产代码应该移除');
    }

    // 检查是否有debugger语句
    if (content.includes('debugger')) {
      warnings.push('代码中包含debugger语句，请移除');
    }

    // 检查是否有TODO注释
    if (content.includes('// TODO') || content.includes('//TODO')) {
      warnings.push('代码中包含TODO注释，请处理或创建issue');
    }
  }

  // 检查JSON文件是否有效
  if (ext === '.json') {
    try {
      JSON.parse(content);
    } catch (err) {
      return {
        isValid: false,
        warnings: [`JSON文件格式错误: ${err.message}`]
      };
    }
  }

  return { isValid: true, warnings };
}

/**
 * 输出阻塞响应
 * @param {string} reason - 阻塞原因
 */
function outputBlock(reason) {
  const response = {
    decision: "block",
    reason: reason,
    suppressOutput: false
  };
  console.log(JSON.stringify(response, null, 2));
}

/**
 * 输出警告响应
 * @param {string[]} warnings - 警告列表
 */
function outputWarnings(warnings) {
  if (warnings.length === 0) {
    return;
  }

  const response = {
    decision: "allow",
    warnings: warnings,
    suppressOutput: false
  };
  console.log(JSON.stringify(response, null, 2));
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
      const filePath = toolInput.file_path || '';

      // 只处理Edit和Write工具
      if (!['Edit', 'Write'].includes(toolName)) {
        process.exit(0); // 允许其他工具
      }

      // 检查敏感文件路径
      const pathCheck = checkSensitivePath(filePath);
      if (pathCheck.isSensitive) {
        outputBlock(pathCheck.reason);
        process.exit(2); // 退出代码2表示阻止操作
      }

      // 如果有内容，验证代码质量
      let hasWarnings = false;
      if (toolInput.new_content || toolInput.content) {
        const content = toolInput.new_content || toolInput.content || '';
        const validation = validateCodeContent(content, filePath);

        if (!validation.isValid) {
          outputBlock(validation.warnings.join('\n'));
          process.exit(2);
        }

        if (validation.warnings.length > 0) {
          outputWarnings(validation.warnings);
          hasWarnings = true;
        }
      }

      // 允许操作
      process.exit(0);

    } catch (err) {
      console.error(`PreToolHook Error: ${err.message}`);
      process.exit(1); // 其他错误表示非阻塞错误
    }
  });
}

// 启动处理
main();
