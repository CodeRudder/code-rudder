# 测试计划

## 测试概述
本测试计划覆盖Code Rudder插件的核心功能，包括Hook机制、插件管理、文档系统和命令系统。

## 1. 单元测试

### 1.1 Hook脚本测试
- 测试文件: `tests/hooks/stop-hook.test.js`
- 测试内容:
  - StartHook启动功能
  - StopHook拦截功能
  - 状态文件读写
  - Hook规则加载
- 测试工具: Mocha/Jest
- 覆盖率目标: 80%+

### 1.2 启停脚本测试
- 测试文件: `tests/scripts/start-stop.test.js`
- 测试内容:
  - start.js启动脚本
  - stop.js停止脚本
  - 状态切换逻辑
  - 错误处理
- 测试工具: Mocha/Jest
- 覆盖率目标: 80%+

### 1.3 工具函数测试
- 测试文件: `tests/utils/file-ops.test.js`
- 测试内容:
  - 文件读写操作
  - JSON解析
  - 路径处理
- 测试工具: Mocha/Jest
- 覆盖率目标: 90%+

## 2. 接口测试

### 2.1 命令接口测试
- 测试内容:
  - /rudder start命令执行
  - /rudder stop命令执行
  - 命令参数解析
  - 命令返回值验证
- 测试工具: 手动测试 + 脚本
- RT要求: < 500ms

### 2.2 Hook接口测试
- 测试内容:
  - StartHook触发时机
  - StopHook拦截时机
  - Hook反馈机制
  - Hook规则应用
- 测试工具: 手动测试
- RT要求: < 1s

## 3. 集成测试

### 3.1 插件启动流程测试
- 测试场景:
  - 执行/rudder start命令
  - 验证状态文件创建/更新
  - 验证Hook规则加载
  - 验证文档结构完整性
- 测试工具: Playwright MCP + 手动测试
- 测试文件: `tests/integration/start-flow.test.js`

### 3.2 插件停止流程测试
- 测试场景:
  - 执行/rudder stop命令
  - 验证状态文件更新
  - 验证Hook规则应用
  - 验证决策流程
- 测试工具: Playwright MCP + 手动测试
- 测试文件: `tests/integration/stop-flow.test.js`

### 3.3 文档自动生成测试
- 测试场景:
  - 验证PRD.md自动创建
  - 验证PLAN.md自动更新
  - 验证CONTEXT.md自动维护
  - 验证ACCEPTANCE.md自动更新
- 测试工具: 文件检查 + 内容验证
- 测试文件: `tests/integration/docs-auto.test.js`

### 3.4 完整开发流程测试
- 测试场景:
  - 启动插件
  - 添加任务到计划
  - 执行开发任务
  - 自动测试验证
  - 验收检查
  - 停止插件
- 测试工具: 端到端测试
- 测试文件: `tests/e2e/full-dev-flow.test.js`

## 4. 测试执行计划

### 4.1 测试优先级
1. P0: 核心Hook机制和启停功能
2. P1: 文档管理和命令系统
3. P2: 测试自动化和覆盖率
4. P3: 高级功能和优化

### 4.2 测试执行顺序
1. 单元测试 (先测试基础功能)
2. 接口测试 (测试命令和Hook)
3. 集成测试 (测试完整流程)
4. E2E测试 (测试端到端场景)

### 4.3 测试环境要求
- Node.js环境
- Claude Code环境
- Playwright MCP配置
- 测试日志目录: logs/tests/

### 4.4 测试并发设置
- 最大并发线程数: 2
- 测试超时时间: 30s per test
- 重试次数: 1次 (针对flaky test)

## 5. 测试报告

### 5.1 报告内容
- 测试执行时间
- 测试用例总数
- 通过/失败数量
- 测试覆盖率
- 失败用例详情
- 错误日志

### 5.2 报告位置
- 单元测试报告: `logs/test-reports/unit-test-report.txt`
- 集成测试报告: `logs/test-reports/integration-test-report.txt`
- E2E测试报告: `logs/test-reports/e2e-test-report.txt`

### 5.3 报告更新频率
- 每次测试执行后自动更新
- 阶段性任务完成后生成完整报告

## 6. 测试验收标准

### 6.1 功能验收
- 所有P0/P1功能100%实现
- 核心业务流程无阻塞问题
- 错误处理机制完善

### 6.2 质量验收
- 核心代码单元测试覆盖率 > 80%
- 普通代码单元测试覆盖率 > 40%
- 所有测试用例100%通过
- 无跳过的测试用例

### 6.3 性能验收
- Hook响应时间 < 1s
- 命令执行时间 < 500ms
- 文档更新时间 < 2s

### 6.4 稳定性验收
- E2E测试连续3次通过
- 无flaky test问题
- 错误日志无严重错误
