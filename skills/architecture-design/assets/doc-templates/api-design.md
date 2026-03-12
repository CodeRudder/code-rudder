---
api_id: <HTTP_METHOD> <path>
module: <module-id>
feature: <FEATURE-ID>
last_updated: <YYYY-MM-DD>
calls_services:
  - <ServiceName.method>
  - <ServiceName.method>
uses_models:
  - <ModelName>
  - <ModelName>
called_by:
  - Frontend: <file-path>
  - Backend: <file-path>
  - External: <description>
---

# {API Title}

## 基本信息

| 属性 | 值 |
|------|-----|
| 端点 | `<path>` |
| 方法 | `<HTTP_METHOD>` |
| 需要认证 | ✓ 是 / ✗ 否 |
| 限流 | `<rate limit>` |
| 超时 | `<timeout>` |

## 请求

### Headers

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | ✓ | application/json |
| Authorization | string | ✓/✗ | Bearer {token} (如果需要认证) |

### Path Parameters

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `<param_name>` | <type> | ✓ | <description> |

### Query Parameters

| 参数 | 类型 | 必填 | 说明 | 示例 |
|------|------|------|------|------|
| `<param_name>` | <type> | ✓/✗ | <description> | <example> |

### Body

```json
{
  "<field_name>": "<value>",      // <type>, 必填/可选, <description>
  "<field_name>": "<value>"       // <type>, 必填/可选, <description>
}
```

**字段说明**:
- `<field_name>` (<type>, 必填/可选): <description>
  - 约束: <constraints>
  - 示例: `<example_value>`

## 响应

### 成功响应 (<status_code> <status_text>)

```json
{
  "success": true,
  "data": {
    "<field_name>": "<value>",
    "<field_name>": "<value>"
  }
}
```

**响应字段**:
- `success` (boolean): 请求是否成功
- `data` (object): 响应数据
  - `<field_name>` (<type>): <description>

### 错误响应

#### <status_code> <status_text> - <error_scenario>

**触发场景**:
- <scenario 1>
- <scenario 2>

```json
{
  "success": false,
  "error": "<error_message>",
  "code": "<error_code>"
}
```

#### 400 Bad Request - 参数错误

**触发场景**:
- 参数格式错误
- 必填参数缺失
- 参数值不符合约束

```json
{
  "success": false,
  "error": "Invalid parameter: <parameter_name>",
  "code": "INVALID_PARAMETER"
}
```

#### 401 Unauthorized - 未认证

**触发场景**:
- 缺少 Authorization header
- Token 无效或已过期

```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

#### 403 Forbidden - 无权限

**触发场景**:
- 用户角色权限不足

```json
{
  "success": false,
  "error": "Permission denied",
  "code": "FORBIDDEN"
}
```

#### 404 Not Found - 资源不存在

**触发场景**:
- 请求的资源不存在

```json
{
  "success": false,
  "error": "Resource not found",
  "code": "NOT_FOUND"
}
```

#### 409 Conflict - 资源冲突

**触发场景**:
- 资源已存在（如邮箱已注册）

```json
{
  "success": false,
  "error": "Resource already exists",
  "code": "CONFLICT"
}
```

#### 500 Internal Server Error - 服务器错误

**触发场景**:
- 数据库错误
- 内部服务异常

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## 处理流程

1. **参数验证** → <validation description>
2. **权限检查** → <permission check description>
3. **业务处理** → <business logic description>
4. **数据持久化** → <persistence description>
5. **返回响应** → <response description>

## 依赖关系

### 调用的服务

- **<ServiceName>.<method>** - <why is this service called?>
- **<ServiceName>.<method>** - <why is this service called?>

### 使用的模型

- **<ModelName>** - <how is this model used?>
- **<ModelName>** - <how is this model used?>

### 被调用方

- **Frontend**: `<file-path>` - <description>
- **Backend**: `<file-path>` - <description>
- **External**: <description>

## 副作用

- ✅ <side effect 1>
- ✅ <side effect 2>

## 测试要点

### 正常场景

- [ ] <test case 1>
- [ ] <test case 2>

### 边界条件

- [ ] <edge case 1>
- [ ] <edge case 2>

### 错误场景

- [ ] <error scenario 1>
- [ ] <error scenario 2>

## 性能要求

- 响应时间: < <X>ms (95th percentile)
- 并发支持: <X> requests/second

## 变更历史

| 版本 | 日期 | 变更内容 | 破坏性变更 | 影响范围 |
|------|------|----------|-----------|----------|
| 1.0.0 | <YYYY-MM-DD> | 初始版本 | ❌ 否 | - |

---

## Example (Delete this section in actual use)

---

api_id: POST /api/auth/register
module: user-management
feature: FEAT-USER-001
last_updated: 2026-02-17
calls_services:
  - UserService.checkEmailExists
  - AuthService.hashPassword
  - UserService.create
  - AuthService.generateToken
  - LoggerService.info
uses_models:
  - User
  - UserRole
called_by:
  - Frontend: src/pages/Register.tsx
---

# 用户注册接口

## 基本信息

| 属性 | 值 |
|------|-----|
| 端点 | `/api/auth/register` |
| 方法 | POST |
| 需要认证 | ✗ 否 |
| 限流 | 10次/分钟 |
| 超时 | 30秒 |

## 请求

### Headers

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| Content-Type | string | ✓ | application/json |

### Body

```json
{
  "email": "user@example.com",      // string, 必填, 用户邮箱
  "password": "Password123"         // string, 必填, 用户密码
}
```

**字段说明**:
- `email` (string, 必填): 用户邮箱，用于登录
  - 约束: 必须是有效的邮箱格式（符合RFC 5322标准）
  - 示例: `user@example.com`

- `password` (string, 必填): 用户密码
  - 约束: 至少8位，最多32位，必须包含数字和字母
  - 示例: `Password123`

## 响应

### 成功响应 (201 Created)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "role": "USER",
      "status": "ACTIVE",
      "created_at": "2026-02-17T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJyb2xlIjoiVVNFUiIsImlhdCI6MTczOTc4MzQwMH0.XYZ..."
  }
}
```

**响应字段**:
- `success` (boolean): 请求是否成功
- `data` (object): 响应数据
  - `user` (User): 创建的用户对象（不包含password_hash字段）
  - `token` (string): JWT认证token，有效期7天

### 错误响应

#### 400 Bad Request - 参数错误

**触发场景**:
- 邮箱格式错误
- 密码强度不足（少于8位或不包含数字/字母）
- 必填参数缺失

```json
{
  "success": false,
  "error": "Invalid email format",
  "code": "INVALID_PARAMETER"
}
```

#### 409 Conflict - 邮箱已注册

**触发场景**:
- 邮箱已被其他用户注册

```json
{
  "success": false,
  "error": "Email already registered",
  "code": "CONFLICT"
}
```

#### 500 Internal Server Error - 服务器错误

**触发场景**:
- 数据库连接失败
- bcrypt加密失败

```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## 处理流程

1. **参数验证** → 验证邮箱格式和密码强度
2. **唯一性检查** → 查询数据库，确保邮箱未注册
3. **密码加密** → 使用bcrypt加密密码（salt rounds: 10）
4. **创建用户** → 写入数据库，设置默认角色USER和状态ACTIVE
5. **生成Token** → 生成JWT token（有效期7天）
6. **返回响应** → 返回用户信息和token

## 依赖关系

### 调用的服务

- **UserService.checkEmailExists** - 检查邮箱是否已注册
- **AuthService.hashPassword** - 使用bcrypt加密密码
- **UserService.create** - 在数据库中创建用户记录
- **AuthService.generateToken** - 生成JWT认证token
- **LoggerService.info** - 记录用户注册日志

### 使用的模型

- **User** - 创建用户记录，设置默认字段值
- **UserRole** - 确定新用户的默认角色（USER）

### 被调用方

- **Frontend**: `src/pages/Register.tsx` - 注册页面调用此API

## 副作用

- ✅ 在 `users` 表中创建新记录
- ✅ 发送欢迎邮件（通过事件队列异步触发，失败不影响注册流程）

## 测试要点

### 正常场景

- [ ] 有效邮箱和密码注册成功，返回201和token
- [ ] 密码已加密存储（不是明文）
- [ ] 新用户角色默认为USER
- [ ] 新用户状态默认为ACTIVE
- [ ] 响应中不包含password_hash字段

### 边界条件

- [ ] 邮箱格式刚好符合要求
- [ ] 密码刚好8位
- [ ] 密码刚好32位

### 错误场景

- [ ] 邮箱格式错误返回400
- [ ] 密码少于8位返回400
- [ ] 密码超过32位返回400
- [ ] 密码不包含数字返回400
- [ ] 密码不包含字母返回400
- [ ] 邮箱已注册返回409
- [ ] 数据库不可用返回500

## 性能要求

- 响应时间: < 300ms (95th percentile)
- 并发支持: 100 requests/second

## 变更历史

| 版本 | 日期 | 变更内容 | 破坏性变更 | 影响范围 |
|------|------|----------|-----------|----------|
| 1.0.0 | 2026-02-15 | 初始版本 | ❌ 否 | - |
