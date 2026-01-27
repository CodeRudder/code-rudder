# Code Rudder 安装指南

## 前置要求

### 必需环境
- **Node.js**: 16.0 或更高版本
- **npm**: 7.0 或更高版本
- **Claude Code CLI**: 最新版本

### 验证环境

```bash
# 检查 Node.js 版本
node --version

# 检查 npm 版本
npm --version

# 检查 Claude Code
claude --version
```

## 安装方法

### 步骤 1: 添加插件市场

在 Claude Code 中执行：

```bash
claude plugin marketplace add git@github.com:CodeRudder/code-rudder.git#github-market
```

### 步骤 2: 安装插件（项目级）

```bash
claude plugin install rudder --scope project
```

### 步骤 3: 启动claude
```bash
claude
```

### 步骤 4: 启动claude插件:rudder
在Claude中，执行slash command，启动rudder
```
/rudder:start
```

## 验证安装

### 检查插件状态

```bash
# 查看状态文件
cat .code-rudder/state.json

# 应该看到 "enabled": true
```

### 检查文档结构

```bash
# 检查 ai-docs 目录
ls ai-docs/

# 应该看到：
# PRD.md
# OPS.md
# PLAN.md
# CONTEXT.md
# ACCEPTANCE.md
# TEST-PLAN.md
```

## 配置

### 基本配置

插件不需要额外配置，开箱即用。

### 高级配置

#### 自定义 Hook 规则

编辑 `hooks/stop-hook-rules.md` 来自定义决策规则。

#### 添加自定义文档模板

在 `templates/` 目录下添加新的模板文件。

## 常见问题

### 问题 1: 安装失败

**症状**: `claude plugin install` 命令失败

**解决方案**:
1. 检查网络连接
2. 确认 GitHub 可访问
3. 尝试手动安装

### 问题 2: 插件无法启动

**症状**: `/rudder:start` 没有响应

**解决方案**:
1. 检查 Node.js 版本
2. 确认依赖已安装: `npm install`
3. 查看错误日志

### 问题 3: 文档未生成

**症状**: `ai-docs/` 目录为空

**解决方案**:
1. 检查文件权限
2. 确认当前目录有写权限

## 从插件市场升级

```bash
# 在 Claude Code 中
/plugin update code@code-rudder
```

## 从插件卸载

```bash
# 在 Claude Code 中（项目级卸载）
claude plugin uninstall rudder --scope project

# 移除插件市场
claude plugin marketplace remove code-rudder
```

## 下一步

安装完成后，建议：

1. 阅读 [README.md](README.md) 了解基本使用
2. 查看 [ai-docs/OPS.md](ai-docs/OPS.md) 了解操作说明
3. 根据项目需求自定义 Hook 规则
4. 运行测试验证功能

## 获取帮助

- 查看文档: [README.md](README.md)
- 提交问题: [GitHub Issues](https://github.com/CodeRudder/code-rudder/issues)
- 查看测试报告: `logs/test-reports/`
