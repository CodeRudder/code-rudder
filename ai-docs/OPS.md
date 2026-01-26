# Code Rudder 项目常用操作说明

## 1. 插件启停

```bash
# 启动插件
node scripts/start.js

# 停止插件
node scripts/stop.js

# 检查插件状态
cat .code-rudder/state.json
```

## 2. 开发与测试

```bash
# 测试Hook机制
# 修改hooks/stop-hook.js或hooks/start-hook.js后测试
# 在Claude Code中执行/rudder start或/rudder stop命令

# 验证Hook规则
cat hooks/stop-hook-rules.md
```

## 3. 文档管理

```bash
# 查看项目文档
cat ai-docs/PRD.md        # 需求概述
cat ai-docs/OPS.md        # 操作说明
cat ai-docs/PLAN.md       # 工作计划
cat ai-docs/CONTEXT.md    # 上下文记忆

# 查看验收标准
cat ai-docs/ACCEPTANCE.md
```

## 4. 插件安装与配置

```bash
# 安装插件到Claude Code
# 在Claude Code中执行：
# /plugin marketplace add https://github.com/CodeRudder/code-rudder
# /plugin install code-rudder@jlc-ai-coding

# 检查插件配置
cat .claude-plugin/plugin.json
cat .claude-plugin/marketplace.json
```

## 5. Git操作

```bash
# 查看当前状态
git status

# 提交变更（遵循Git Safety Protocol）
git add <files>           # 添加特定文件
git commit -m "message"   # 提交
git push                  # 推送

# 禁止使用的危险命令
# 不要使用: git push --force, git reset --hard, git clean -f等
```

## 6. 文件结构

```bash
# 查看关键文件
ls hooks/                # Hook脚本目录
ls scripts/              # 启停脚本目录
ls commands/             # 命令定义目录
ls ai-docs/              # AI记忆文档目录
```
