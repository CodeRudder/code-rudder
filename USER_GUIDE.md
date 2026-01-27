# Code Rudder 新手使用手册

欢迎使用 Code Rudder（代码舵手）！本手册将帮助你从零开始安装和使用这款 AI 编程助手。

## 目录

1. [什么是 Code Rudder](#什么是-code-rudder)
2. [安装 Claude Code](#安装-claude-code)
3. [安装 Code Rudder 插件](#安装-code-rudder-插件)
4. [日常使用](#日常使用)
5. [常见问题](#常见问题)

---

## 什么是 Code Rudder

Code Rudder 是 Claude Code 的插件，它像一个智能助手，帮助你：

- 📋 自动管理开发计划和任务
- 🧠 记住项目的重要信息
- 🤖 自动决定下一步该做什么
- 📝 自动生成项目文档
- 🐛 自动发现和修复 Bug

想象一下：你只需要告诉 AI 要做什么，它会自动规划、执行、测试，并记录整个过程。这就是 Code Rudder 的魅力！

---

## 安装 Claude Code

在安装 Code Rudder 之前，你需要先安装 Claude Code。

### 第一步：检查系统环境

打开终端（Terminal），依次运行以下命令检查环境：

```bash
# 检查 Node.js 版本（需要 16.0 或更高）
node --version

# 检查 npm 版本（需要 7.0 或更高）
npm --version
```

**如果显示版本号**：太好了！继续下一步。

**如果显示"命令未找到"**：你需要先安装 Node.js。

#### 安装 Node.js

**Mac 用户**：
```bash
# 使用 Homebrew 安装
brew install node
```

**Windows 用户**：
1. 访问 https://nodejs.org/
2. 下载并安装 LTS 版本
3. 重启命令行窗口

**Linux 用户**：
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL
sudo yum install nodejs npm
```

### 第二步：安装 Claude Code

Claude Code 是 Anthropic 官方提供的 AI 编程命令行工具。

**安装命令**：
```bash
npm install -g @anthropic-ai/claude-code
```

**验证安装**：
```bash
claude --version
```

如果显示版本号，说明安装成功！

### 第三步：配置Claude认证凭据
首次使用，需要配置Claude的认证凭据。

方式一：
```bash
# 这里以智谱大模型为例
export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"

export ANTHROPIC_AUTH_TOKEN="xxxxx"
```


方式二：
```bash
claude login
```

1. 终端会显示一个链接
2. 在浏览器中打开该链接
3. 使用你的 Anthropic 账号登录
4. 授权后返回终端

**提示**：如果你还没有 Anthropic 账号，需要先到 https://console.anthropic.com/ 注册。

---

## 安装 Code Rudder 插件

现在开始安装 Code Rudder 插件！

### 第一步：添加插件市场

在终端中运行：

```bash
claude plugin marketplace add git@github.com:CodeRudder/code-rudder.git
```

这个命令将 Code Rudder 的插件市场添加到你的系统中。

### 第二步：安装插件

进入你的项目目录，然后运行：

```bash
# 进入项目目录
cd /path/to/your/project

# 安装插件（项目级）
claude plugin install rudder --scope project
```

**什么是项目级安装？**
- 项目级安装：只对当前项目生效
- 推荐使用项目级安装，不同项目可以有不同的配置

### 第三步：启动 Claude

```bash
# 启动 Claude Code
claude

# 要完全释放rudder，需要开启yolo模式
claude --dangerously-skip-permissions
```

启动后，你会看到 Claude 的欢迎信息。

### 第四步：启动 Code Rudder 插件

在 Claude 的对话界面中，输入以下命令：

```
/rudder:start
```

等待几秒钟，你会看到插件启动成功的提示。

### 第五步：添加任务
启动rudder后，跟Claude对话，例如集成微信支付。
rudder会自动拆解需求并创建相关文档。

---

## 日常使用

### 基本命令

```bash
# 启动插件
/rudder:start

# 停止插件
/rudder:stop
```

### 添加任务

在开发过程中，你可以随时添加新任务。使用时需要指定优先级：

**优先级说明**：
- **P0**：最高优先级，需要立即处理（如：严重 Bug、核心功能）
- **P1**：高优先级，重要但不紧急（如：重要功能）
- **P2**：中优先级，常规任务（如：优化改进）
- **P3**：低优先级，可以延后（如：文档完善、小优化）

**添加任务示例**：

```
- 添加P0任务：实现用户登录认证流程
- 添加P1计划：实现用户管理及RBAC授权
- 修复P0错误：修复登录页面响应超时问题
- 添加P2任务：优化数据库查询性能
```

### 插件如何帮助你

#### 1. 自动任务管理

插件会自动：
- 跟踪任务进度
- 根据优先级排序任务
- 检查任务是否完成
- 决定下一步做什么

#### 2. 自动生成文档

插件会在 `ai-docs/` 目录下维护多种文档：

| 文档 | 用途 |
|------|------|
| PRD.md | 项目需求文档 |
| PLAN.md | 工作计划和任务清单 |
| OPS.md | 操作指南（启动、构建、测试等） |
| CONTEXT.md | 项目上下文和记忆 |
| ACCEPTANCE.md | 任务验收报告 |
| BUGS.md | 发现的 Bug 列表 |
| API.md | 项目的 API 清单 |

#### 3. 自动测试和验收

当你完成一个任务后，插件会：
- 自动运行测试
- 检查是否达到验收标准
- 记录测试结果
- 发现问题会自动修复或报告

### 典型工作流程

1. **开发过程中**
   - 告诉 Claude 你要做什么
   - Claude 会自动更新计划
   - 插件会记录进度和发现

2. **遇到问题**
   - 插件会自动诊断
   - 尝试自动修复
   - 记录到 BUGS.md

3. **完成任务**
   - 插件会自动测试
   - 更新验收报告
   - 开始下一个任务

---

## 常见问题

### Q1: Claude Code 安装失败

**症状**：`npm install` 时报错

**解决方案**：

1. 检查网络连接
   ```bash
   ping registry.npmjs.org
   ```

2. 尝试使用国内镜像（中国大陆用户）
   ```bash
   npm config set registry https://registry.npmmirror.com
   npm install -g @anthropic-ai/claude-code
   ```

3. 清除 npm 缓存
   ```bash
   npm cache clean --force
   npm install -g @anthropic-ai/claude-code
   ```

### Q2: 插件安装失败

**症状**：`claude plugin install` 命令失败

**解决方案**：

1. 检查 GitHub 是否可访问
   ```bash
   ssh -T git@github.com
   ```

2. 如果 GitHub 连接失败，配置 SSH 代理或使用 HTTPS

3. 确认 Claude Code 版本
   ```bash
   claude --version
   # 如果版本过低，更新到最新版
   npm update -g @anthropic-ai/claude-code
   ```

### Q3: 插件启动无响应

**症状**：输入 `/rudder:start` 后没有反应

**解决方案**：

1. 检查 Node.js 版本
   ```bash
   node --version  # 应该是 16.0 或更高
   ```

2. 确认插件已安装
   ```bash
   claude plugin list
   ```

3. 查看错误日志
   ```bash
   cat .code-rudder/logs/error.log
   ```

4. 尝试重启
   ```bash
   /rudder:stop
   /rudder:start
   ```

### Q4: 文档没有自动生成

**症状**：`ai-docs/` 目录为空或缺少文件

**解决方案**：

1. 检查目录权限
   ```bash
   ls -la ai-docs/
   ```

2. 手动复制模板
   ```bash
   mkdir -p ai-docs
   cp .claude/code-rudder/templates/*.md ai-docs/
   ```

3. 检查插件状态
   ```bash
   cat .code-rudder/state.json
   # 应该看到 "enabled": true
   ```

### Q5: 如何重置插件

如果遇到问题需要重置：

```bash
# 停止插件
/rudder:stop

# 删除状态文件
rm -rf .code-rudder/

# 重新启动
/rudder:start
```

### Q6: 如何更新插件

```bash
claude plugin update rudder@code-rudder
```

### Q7: 如何卸载插件

```bash
# 停止插件
/rudder:stop

# 卸载插件
claude plugin uninstall rudder --scope project

# 移除插件市场
claude plugin marketplace remove code-rudder

# 删除相关文件（可选）
rm -rf .code-rudder/
rm -rf ai-docs/
```

### Q8: 插件支持哪些项目类型

Code Rudder 是通用的 AI 编程助手，支持：

- Web 前端项目（Vue、React、Angular 等）
- 后端项目（Node.js、Python、Java 等）
- 全栈项目
- 移动应用（React Native、Flutter 等）
- 桌面应用

只要是 Claude Code 支持的项目类型，Code Rudder 都能辅助！

### Q9: 可以在团队中使用吗

完全可以！建议：

1. **每个成员独立安装**
   - 每人安装自己的 Claude Code
   - 每人安装 Code Rudder 插件

2. **共享项目文档**
   - 将 `ai-docs/` 加入 Git 仓库
   - 团队成员共享计划和进度

3. **统一配置**
   - 将项目级的插件配置提交到 Git
   - 新成员克隆项目后直接使用

---

**祝你在 AI 辅助编程的世界里玩得开心！** 🚀
