---
model_name: <ModelName>
module: <module-id>
last_updated: <YYYY-MM-DD>
used_by_features:
  - <FEATURE-ID-001>
  - <FEATURE-ID-002>
shared_with_modules:
  - <other-module-id>  # Optional: if used by other modules
---

# {ModelName} {模型中文名}

## 概述

{Brief description of what this model represents and its purpose in the system}

## 字段定义

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| <field_name> | <type> | ✓/✗ | <description> | <constraints> |
| <field_name> | <type> | ✓/✗ | <description> | <constraints> |

**字段约束说明**:
- `<constraint_1>`: {Description}
- `<constraint_2>`: {Description}

## 业务规则

- ✅ {Business rule 1}
- ✅ {Business rule 2}
- ✅ {Business rule 3}

## 使用场景

### {FEATURE-ID-001}: {Feature Title}

{How is this model used in this feature?}

- {Usage 1}
- {Usage 2}

### {FEATURE-ID-002}: {Feature Title}

{How is this model used in this feature?}

- {Usage 1}

## 数据库映射

**表名**: `<table_name>`

**字段映射**:
- `<field_name>` → `<column_name>` (<column_type>)

**索引**:
- `<index_name>` on `<fields>` - {Purpose}
  - Example: `idx_email` on `email` (unique) - Fast email lookup

**约束**:
- `<constraint_type>`: {Description}
  - Example: `UNIQUE` on `email` - Prevent duplicate registrations

## 关联模型

- **{RelatedModel1}**: {Relationship description}
  - Type: one-to-one | one-to-many | many-to-many
  - Foreign key: `<field_name>`

- **{RelatedModel2}**: {Relationship description}
  - Type: one-to-one | one-to-many | many-to-many
  - Foreign key: `<field_name>`

## 状态流转

{If the model has status/state fields, describe the state transitions}

```
初始状态 → 中间状态 → 最终状态
```

**状态说明**:
- `STATUS_1`: {Description}
- `STATUS_2`: {Description}

**转换规则**:
- STATUS_1 → STATUS_2: {When does this happen?}
- STATUS_2 → STATUS_3: {When does this happen?}

## 数据示例

```json
{
  "id": "<example-id>",
  "field1": "<example-value>",
  "field2": "<example-value>",
  "created_at": "<timestamp>"
}
```

## 变更历史

| 版本 | 日期 | 变更内容 | 破坏性变更 | 影响范围 |
|------|------|----------|-----------|----------|
| 1.0.0 | <YYYY-MM-DD> | 初始版本 | ❌ 否 | - |

---

## Example (Delete this section in actual use)

---

model_name: User
module: user-management
last_updated: 2026-02-17
used_by_features:
  - FEAT-USER-001
  - FEAT-USER-002
  - FEAT-MSG-001
shared_with_modules:
  - message-center
---

# User 用户实体

## 概述

用户实体是系统的核心模型，存储用户基本信息、角色和状态。支持用户注册、登录、权限管理等功能。

## 字段定义

| 字段名 | 类型 | 必填 | 说明 | 约束 |
|--------|------|------|------|------|
| id | string | ✓ | 用户唯一ID | UUID格式，36字符 |
| email | string | ✓ | 登录邮箱 | 邮箱格式，唯一，最大255字符 |
| password_hash | string | ✓ | 密码哈希值 | bcrypt加密，60字符 |
| role | UserRole | ✓ | 用户角色 | 枚举：ADMIN, USER, GUEST，默认USER |
| status | UserStatus | ✓ | 账号状态 | 枚举：ACTIVE, INACTIVE, DELETED，默认ACTIVE |
| phone | string | ✗ | 手机号 | 11位数字，可选 |
| created_at | Date | ✓ | 创建时间 | ISO 8601格式，自动生成 |
| updated_at | Date | ✓ | 更新时间 | ISO 8601格式，自动更新 |

**字段约束说明**:
- `email`: 必须是有效的邮箱格式（符合RFC 5322标准）
- `password_hash`: 原始密码必须至少8位，包含数字和字母
- `phone`: 如果提供，必须是11位数字

## 业务规则

- ✅ 邮箱必须唯一，不能重复注册
- ✅ 密码必须至少8位，包含数字和字母
- ✅ 新注册用户默认角色为 USER
- ✅ 删除用户时不物理删除，将 status 设为 DELETED
- ✅ 手机号可选，但一旦填写必须唯一

## 使用场景

### FEAT-USER-001: 用户注册与登录

- 注册时创建用户记录（设置默认角色USER和状态ACTIVE）
- 登录时验证邮箱和密码（检查status必须为ACTIVE）
- 登录成功后返回用户信息（排除password_hash字段）

### FEAT-USER-002: 权限管理

- 根据 role 字段判断用户权限
- 管理员可以修改其他用户的 role
- 检查用户 status 确保账号可用

### FEAT-MSG-001: 消息显示

- 显示消息发送者的用户信息（关联 user_id）
- 只查询必要字段（id, email, role）以优化性能

## 数据库映射

**表名**: `users`

**字段映射**:
- `id` → `id` (VARCHAR(36), PRIMARY KEY)
- `email` → `email` (VARCHAR(255), NOT NULL)
- `password_hash` → `password_hash` (VARCHAR(60), NOT NULL)
- `role` → `role` (ENUM('ADMIN', 'USER', 'GUEST'), NOT NULL, DEFAULT 'USER')
- `status` → `status` (ENUM('ACTIVE', 'INACTIVE', 'DELETED'), NOT NULL, DEFAULT 'ACTIVE')
- `phone` → `phone` (VARCHAR(11), NULL)
- `created_at` → `created_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` → `updated_at` (TIMESTAMP, NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

**索引**:
- `idx_email` on `email` (UNIQUE) - 快速查找邮箱，防止重复注册
- `idx_role_status` on `role, status` - 按角色和状态筛选用户
- `idx_phone` on `phone` (UNIQUE) - 确保手机号唯一

**约束**:
- `UNIQUE` on `email` - 邮箱唯一约束
- `UNIQUE` on `phone` - 手机号唯一约束（如果提供）
- `CHECK` on `role` - 角色必须是有效枚举值
- `CHECK` on `status` - 状态必须是有效枚举值

## 关联模型

- **Message**: 用户发送的消息
  - Type: one-to-many
  - Foreign key: `messages.user_id` → `users.id`
  - 描述：一个用户可以发送多条消息

- **UserRole**: 用户角色枚举
  - Type: enum
  - 描述：定义用户可用的角色

- **UserStatus**: 用户状态枚举
  - Type: enum
  - 描述：定义用户的账号状态

## 状态流转

```
注册 → ACTIVE ⇄ INACTIVE → DELETED
```

**状态说明**:
- `ACTIVE`: 活跃状态，可以正常登录和使用系统
- `INACTIVE`: 未激活或暂时停用，不能登录
- `DELETED`: 已删除，不能登录（软删除）

**转换规则**:
- 注册后默认状态为 ACTIVE
- ACTIVE → INACTIVE: 管理员手动停用或用户长时间未登录
- INACTIVE → ACTIVE: 管理员手动激活或用户重新登录
- ACTIVE/INACTIVE → DELETED: 用户或管理员删除账号（软删除）
- DELETED 状态不可逆

## 数据示例

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "password_hash": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.oCgd.9vUnJQI9dKJea",
  "role": "USER",
  "status": "ACTIVE",
  "phone": "13800138000",
  "created_at": "2026-02-17T10:30:00Z",
  "updated_at": "2026-02-17T10:30:00Z"
}
```

## 变更历史

| 版本 | 日期 | 变更内容 | 破坏性变更 | 影响范围 |
|------|------|----------|-----------|----------|
| 1.1.0 | 2026-02-20 | 增加phone字段 | ❌ 否 | FEAT-USER-001, FEAT-USER-002 |
| 1.0.0 | 2026-02-15 | 初始版本 | ❌ 否 | - |
