# JLC AI编程机器人 - Code Rudder（代码舵手） 
版本：1.0 | 发布日期: 20260126

## 简介
Code Rudder（代码舵手） 是一款AI编程插件，通过Hook机制拦截StopHook等关键操作，注入【智能机器人法则】。插件可自主生成执行计划、动态决策下一步操作，自动维护多种本地记忆文件，实现任务全流程连续自动化处理，大幅提升编程效率与流程连贯性。

## 核心特性

1. 开发流程智能管控：实时把控开发全流程，基于场景动态决策下一步行动，无需人工频繁介入。

2. 多维度本地记忆：支持多种格式本地记忆文件存储，留存关键开发数据，保障任务衔接连贯性。

3. 计划驱动进度推进：严格遵循预设工作计划分步执行，精准把控开发节奏，确保任务有序落地。

4. 自动化错误处理：可自动识别开发过程中的潜在错误与Bug，并智能触发修复逻辑，降低问题排查成本。

5. 全链路测试保障：内置严格的单元测试与集成测试机制，从代码片段到整体功能全面校验，提升代码可靠性。

6. 智能化问题排查：具备清晰的问题排查思路与逻辑框架，高效定位根因，助力快速解决开发难题。

7. 标准化任务验收：预设明确的任务完成检查标准，量化验收维度，确保输出成果符合预期。

## 本地记忆文件

| 名称 | PATH | 描述 |
|------|------|----------|
|项目概述| ai-docs/PRD.md | 项目需求概述。**注意**: 需要根据项目实际情况填写，尽可能简洁清晰，600字以内。 |
|常用操作| ai-docs/OPS.md | 包含启停服务/构建/检查API/数据库/测试/查看日志等说明。**注意**: 需要根据项目实际情况调整，规范AI执行命令。 |
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

## 安装&配置
1、将插件解压到项目.claude目录下：

```
.claude/code-rudder
├── README.md
├── start-hook.sh
├── state
│   └── stop-hook-state.json
├── stop-hook-rules.md
├── stop-hook.sh
└── templates
    ├── OPS.md
    └── PRD.md
```

2、在项目claude配置文件(.claude/settings.local.json)，添加Hook配置：

Mac/Linux: 
```
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/code-rudder/start-hook.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PROJECT_DIR}/.claude/code-rudder/stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```

Windows:
```
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "node D:/your-project-path/.claude/code-rudder/start-hook.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "node D:/your-project-path/.claude/code-rudder/stop-hook.sh"
          }
        ]
      }
    ]
  }
}
```


3、复制模版文档
```
mkdir ai-docs
cp .claude/code-rudder/templates/*.md ai-docs
```

4、根据提示填写项目需求 [ai-docs/PRD.md]


5、启动claude
建议开启 bypassPermissions 模式
```
claude --dangerously-skip-permissions
```

6、生成工作计划和OPS.md
在claude code 输入：
请按要求生成 ai-docs/PLAN.md 和 OPS.md


## 使用指南

1. **必须**: 配置好数据库、playwright mcp 等必须的开发及测试环境，让AI可以自动执行单元测试及集成测试，才能形成闭环，不断迭代开发。
2. 在claude code执行过程中，可以输入添加新的任务，需要指定不同优先级
 - 添加P0任务：实现用户登录认证流程
 - 添加P1计划：实现用户管理及RBAC授权
 - 修复P0错误：修复[projects-details-branch]页面分支状态异常，ai/test-nuxt-4项目的extra分支没有自动清理，git同步时没有自动同步已删除分支到目标仓库的。


## 版本记录
20260126: 发布1.0
