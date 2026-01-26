# PreToolUse Hook 规则

## 规则说明

PreToolUse Hook在工具调用前执行，用于拦截和验证工具操作。

## 拦截规则

### 1. 敏感文件保护

以下文件不允许修改：
- 环境变量文件：`.env`, `.env.local`, `.env.production`
- Git配置：`.git/`目录下的所有文件
- 依赖锁文件：`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`
- 本地配置：`.claude/settings.local.json`
- 依赖目录：`node_modules/`

### 2. 代码质量检查

对于JavaScript/TypeScript文件（.js, .ts, .jsx, .tsx）：
- **console.log检测**：生产代码中不应包含console.log（测试文件除外）
- **debugger检测**：不应包含debugger语句
- **TODO检查**：发现TODO注释时会警告

### 3. JSON格式验证

- JSON文件必须符合有效JSON格式
- 格式错误的JSON文件将被阻止写入

## 行为说明

### 阻止操作（退出代码2）
- 文件路径在敏感列表中
- JSON文件格式无效

### 警告但允许（JSON输出）
- 代码中包含console.log
- 代码中包含debugger语句
- 代码中包含TODO注释

### 允许操作（退出代码0）
- 所有其他情况

## 使用场景

### 场景1：保护敏感配置
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": ".env"
  }
}
```
**结果**：阻止，提示不允许修改环境变量文件

### 场景2：代码质量检查
```json
{
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "src/app.js",
    "new_content": "function test() {\n  console.log('debug');\n  debugger;\n}"
  }
}
```
**结果**：允许但警告代码质量问题

## 配置修改

如需修改规则，编辑`hooks/pre-tool-hook.js`中的`CONFIG`对象：
- `sensitiveFiles`: 添加/删除敏感文件名
- `sensitivePatterns`: 添加/删除敏感路径模式
- `validateCodeContent`: 修改代码验证逻辑
