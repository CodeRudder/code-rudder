# JLC AI编程机器人 - Code Rudder（代码舵手）
版本：1.0 | 发布日期: 20260126

## 简介
Code Rudder（代码舵手）是一款AI编程插件，通过Hook机制拦截StopHook等关键操作，注入【智能机器人法则】。插件可自主生成执行计划、动态决策下一步操作，自动维护多种本地记忆文件，实现任务全流程连续自动化处理，大幅提升编程效率与流程连贯性。

## 核心特性

1. **开发流程智能管控**：实时把控开发全流程，基于场景动态决策下一步行动，无需人工频繁介入。

2. **多维度本地记忆**：支持多种格式本地记忆文件存储，留存关键开发数据，保障任务衔接连贯性。

3. **计划驱动进度推进**：严格遵循预设工作计划分步执行，精准把控开发节奏，确保任务有序落地。

4. **自动化错误处理**：可自动识别开发过程中的潜在错误与Bug，并智能触发修复逻辑，降低问题排查成本。

5. **全链路测试保障**：内置严格的单元测试与集成测试机制，从代码片段到整体功能全面校验，提升代码可靠性。

6. **智能化问题排查**：具备清晰的问题排查思路与逻辑框架，高效定位根因，助力快速解决开发难题。

7. **标准化任务验收**：预设明确的任务完成检查标准，量化验收维度，确保输出成果符合预期。

## 本地记忆文件

| 名称 | PATH | 描述 |
|------|------|----------|
|项目概述| ai-docs/PRD.md | 项目需求概述 |
|常用操作| ai-docs/OPS.md | 包含启停服务/构建/测试等说明 |
|上下文 | ai-docs/CONTEXT.md | 长-中-短期记忆 |
|工作计划 | ai-docs/PLAN.md | 工作计划(任务)清单及进度 |
|验收报告 | ai-docs/ACCEPTANCE.md | 任务验收报告 |
|变更历史 | ai-docs/CHANGES.md | 功能版本变更历史 |
|BUG列表| ai-docs/BUGS.md | 自动记录发现的BUG列表|
|API清单| ai-docs/API.md | 自动整理的项目的API清单|
|知识库 | ai-docs/knowledges | 自动整理的项目知识库 |
|阶段总结| ai-docs/phases | 每个阶段完成后的总结报告 |
|分析报告| ai-docs/analysis-reports |问题分析报告|
|测试报告| ai-docs/test-reports | 测试报告|

## 快速开始

```bash
# 第一步：启动Claude Code
claude

# 第二步：添加插件市场
/plugin marketplace add https://github.com/CodeRudder/code-rudder

# 第三步：安装插件
/plugin install code-rudder@jlc-ai-coding

# 第四步：启动插件
/rudder start
```

## 使用指南

### 1. 基本命令

```bash
# 启动插件
/rudder start

# 停止插件
/rudder stop
```

### 2. 添加任务

在开发过程中，可以随时添加新任务并指定优先级：

```
- 添加P0任务：实现用户登录认证流程
- 添加P1计划：实现用户管理及RBAC授权
- 修复P0错误：修复登录页面响应超时问题
```

### 3. 工作流程

插件启动后会自动：
1. 创建必要的文档结构
2. 初始化状态文件
3. 应用Hook规则
4. 根据计划自动推进任务

每次StopHook触发时，插件会：
1. 检查当前任务状态
2. 评估是否满足验收标准
3. 决策下一步行动
4. 更新工作计划

### 4. 测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 查看测试覆盖率
npm run test:coverage
```

## 配置要求

### 必需环境
- Node.js 16+
- Claude Code CLI
- Jest (测试框架)

### 可选环境
- Playwright MCP (用于E2E测试)
- 数据库 (根据项目需要)

## 项目结构

```
code-rudder/
├── .claude-plugin/          # 插件配置
│   ├── plugin.json         # 插件元数据
│   └── marketplace.json    # 市场配置
├── hooks/                  # Hook脚本
│   ├── start-hook.js      # 启动Hook
│   ├── stop-hook.js       # 停止Hook
│   ├── hooks.json         # Hook配置
│   └── stop-hook-rules.md # Hook规则
├── scripts/                # 工具脚本
│   ├── start.js           # 启动脚本
│   └── stop.js            # 停止脚本
├── commands/               # 命令定义
│   └── rudder.md          # Rudder命令
├── tests/                 # 测试用例
│   ├── unit/             # 单元测试
│   └── integration/      # 集成测试
├── templates/            # 文档模板
└── package.json          # 项目配置
```

## 开发指南

### 添加新的Hook规则

编辑 `hooks/stop-hook-rules.md` 文件，添加新的决策规则。

### 扩展记忆文件类型

在 `scripts/start.js` 中添加新的文档模板和初始化逻辑。

### 自定义测试

在 `tests/` 目录下添加测试文件，插件会自动识别并运行。

## 版本记录

### v1.0.0 (2026-01-26)
- ✅ 实现StopHook和StartHook拦截机制
- ✅ 实现插件启停脚本
- ✅ 创建Hook规则文档系统
- ✅ 建立项目文档体系
- ✅ 实现单元测试和集成测试框架
- ✅ 完善插件配置和安装流程

## 常见问题

### Q: 插件启动后没有反应？
A: 检查 `.code-rudder/state.json` 文件是否存在，确保 `enabled` 字段为 `true`。

### Q: 如何重置插件状态？
A: 运行 `/rudder stop` 然后再次 `/rudder start` 即可重置。

### Q: 测试失败怎么办？
A: 查看测试报告 `logs/test-reports/` 下的详细日志，根据错误信息修复问题。

### Q: 如何自定义Hook规则？
A: 编辑 `hooks/stop-hook-rules.md` 文件，按照现有格式添加新规则。

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

## 联系方式

- 项目主页: https://github.com/CodeRudder/code-rudder
- 问题反馈: https://github.com/CodeRudder/code-rudder/issues
