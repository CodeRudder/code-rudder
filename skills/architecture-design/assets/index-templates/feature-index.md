---
feature_id: <FEATURE-ID>
feature_title: <Feature Title>
module: <module-id>
status: planned | in_design | in_development | testing | completed | deprecated
priority: P0 | P1 | P2 | P3
last_updated: <YYYY-MM-DD>

# Required context - what must be understood before implementing this feature
required_context:
  domain_models:
    - name: <ModelName>
      reason: "<Why must this model be understood?>"
      file: ../domain-models/<ModelName>.md

  apis:
    provides:  # APIs this feature provides
      - endpoint: <HTTP_METHOD> <path>
        file: ../apis/<api-name>.md
    depends_on:  # APIs this feature depends on
      - endpoint: <HTTP_METHOD> <path>
        module: <module-id>
        reason: "<Why is this API needed?>"

  process_flows:
    - name: <Flow Name>
      file: ../process-flows/<flow-name>.md

  shared_services:
    - name: <ServiceName>
      reason: "<Why is this service needed?>"
      location: <file-path>
---

# {Feature Title}

## 核心功能

> {One sentence summary of what this feature does}

## 详细说明

{Detailed description of the feature, its purpose, and how it fits into the overall system}

## 开发前必读上下文

### 领域模型

在实现此 feature 前，必须理解以下模型：

- **[ModelName](../domain-models/{ModelName}.md)** - {Brief description} ({Why is it needed?})

### API 设计

此 feature 提供的 API：

- **[HTTP_METHOD /path](../apis/{api-name}.md)** - {Brief description}

此 feature 依赖的 API：

- **[HTTP_METHOD /path](../../{module-id}/apis/{api-name}.md)** (from {module-id} module) - {Why is it needed?}

### 处理流程

必须理解以下业务流程：

- **[Flow Name](../process-flows/{flow-name}.md)** - {Brief description}

### 共享服务

此 feature 使用的服务：

- **ServiceName** (`{file-path}`) - {Why is it needed?}

## 验收标准

- [ ] {Acceptance criterion 1}
- [ ] {Acceptance criterion 2}
- [ ] {Acceptance criterion 3}
- [ ] {Acceptance criterion 4}

## 设计文档

| 类型 | 文档 | 说明 |
|------|------|------|
| 领域模型 | [{ModelName}.md](../domain-models/{ModelName}.md) | {Brief description} |
| API | [{api-name}.md](../apis/{api-name}.md) | {HTTP_METHOD} {path} |
| 流程 | [{flow-name}.md](../process-flows/{flow-name}.md) | {Flow description} |

## 实现文件

### Frontend

- `{file-path}` - {Description of file}
- `{file-path}` - {Description of file}

### Backend

- `{file-path}` - {Description of file}
- `{file-path}` - {Description of file}

### Tests

- `{file-path}` - {Description of file}
- `{file-path}` - {Description of file}

## 技术决策

### 为什么使用 {Technology/Approach}？

- ✅ {Benefit 1}
- ✅ {Benefit 2}
- ✅ {Benefit 3}

**缺点及应对**:
- ❌ {Drawback 1}
- ✅ 应对：{How to mitigate}

## 相关 Features

- **{FEATURE-ID}: {Feature Title}** - {How is it related?}
- **{FEATURE-ID}: {Feature Title}** - {How is it related?}

## 变更历史

| 日期 | 变更内容 | 影响范围 |
|------|----------|----------|
| <YYYY-MM-DD> | 初始设计 | - |

---

## Example (Delete this section in actual use)

---

feature_id: FEAT-USER-001
feature_title: 用户注册与登录
module: user-management
status: in_development
priority: P0
last_updated: 2026-02-17

required_context:
  domain_models:
    - name: User
      reason: "Core entity for registration and login"
      file: ../domain-models/User.md
    - name: UserRole
      reason: "Need to understand default role for new users"
      file: ../domain-models/UserRole.md

  apis:
    provides:
      - endpoint: POST /api/auth/register
        file: ../apis/register.md
      - endpoint: POST /api/auth/login
        file: ../apis/login.md
    depends_on: []  # This is a foundational feature

  process_flows:
    - name: User Registration Flow
      file: ../process-flows/user-registration.md
    - name: User Login Flow
      file: ../process-flows/user-login.md

  shared_services:
    - name: AuthService
      reason: "Handles password hashing and JWT generation"
      location: services/auth/AuthService.ts
    - name: LoggerService
      reason: "Logs authentication events"
      location: services/logger/LoggerService.ts
---

# 用户注册与登录

## 核心功能

> 提供邮箱注册和登录功能，支持JWT认证

## 详细说明

这是系统的基础功能，允许用户通过邮箱注册账号并登录。使用 JWT token 进行无状态认证，支持分布式部署。

## 开发前必读上下文

### 领域模型

在实现此 feature 前，必须理解以下模型：

- **[User](../domain-models/User.md)** - 用户实体，包含基本信息、角色和状态（核心实体，注册和登录的基础）
- **[UserRole](../domain-models/UserRole.md)** - 用户角色枚举（需要知道新用户的默认角色）

### API 设计

此 feature 提供的 API：

- **[POST /api/auth/register](../apis/register.md)** - 用户注册接口
- **[POST /api/auth/login](../apis/login.md)** - 用户登录接口

此 feature 依赖的 API：
- 无（这是基础功能）

### 处理流程

必须理解以下业务流程：

- **[用户注册流程](../process-flows/user-registration.md)** - 参数验证 → 邮箱检查 → 密码加密 → 创建用户 → 生成token
- **[用户登录流程](../process-flows/user-login.md)** - 参数验证 → 凭证检查 → 生成token

### 共享服务

此 feature 使用的服务：

- **AuthService** (`services/auth/AuthService.ts`) - 处理密码加密和JWT生成
- **LoggerService** (`services/logger/LoggerService.ts`) - 记录认证事件日志

## 验收标准

- [ ] 注册成功返回JWT token
- [ ] 登录成功返回JWT token
- [ ] 错误提示友好（不暴露内部信息）
- [ ] 密码加密存储（不是明文）
- [ ] 新用户默认角色为USER
- [ ] 限流保护（10次/分钟）

## 设计文档

| 类型 | 文档 | 说明 |
|------|------|------|
| 领域模型 | [User.md](../domain-models/User.md) | 用户实体定义 |
| API | [register.md](../apis/register.md) | POST /api/auth/register |
| API | [login.md](../apis/login.md) | POST /api/auth/login |
| 流程 | [user-registration.md](../process-flows/user-registration.md) | 注册流程 |
| 流程 | [user-login.md](../process-flows/user-login.md) | 登录流程 |

## 实现文件

### Frontend

- `src/pages/Login.tsx` - 登录页面
- `src/pages/Register.tsx` - 注册页面
- `src/components/AuthForm.tsx` - 认证表单组件

### Backend

- `src/controllers/AuthController.ts` - 认证控制器
- `src/services/AuthService.ts` - 认证服务
- `src/middlewares/AuthMiddleware.ts` - JWT验证中间件

### Tests

- `tests/auth/register.spec.ts` - 注册测试
- `tests/auth/login.spec.ts` - 登录测试

## 技术决策

### 为什么使用 JWT？

- ✅ 无状态，易于横向扩展
- ✅ 不需要在服务端存储session
- ✅ 支持跨服务认证

**缺点及应对**:
- ❌ 无法主动让token失效
- ✅ 应对：敏感操作需要二次验证

### 为什么使用 bcrypt？

- ✅ 自适应成本因子，可以随硬件性能调整
- ✅ 内置salt，防止彩虹表攻击
- ✅ 业界标准，经过充分验证

## 相关 Features

- **FEAT-USER-002: 权限管理** - 依赖此feature的用户角色
- **FEAT-MSG-001: 消息中心** - 依赖此feature的用户信息

## 变更历史

| 日期 | 变更内容 | 影响范围 |
|------|----------|----------|
| 2026-02-17 | 初始设计 | - |
