# 项目常用操作说明

## 1. 服务启停

```bash
# 后端服务
./scripts/gitlab-mirror restart    # 重启
./scripts/gitlab-mirror status     # 状态
tail -f logs/gitlab-mirror.log  # 查看日志

# 前端服务
./start-dev.sh    # 启动开发服务器

# 数据库
docker-compose up -d    # 启动MySQL
docker ps | grep gitlab-mirror-mysql  # 检查状态
docker exec -it gitlab-mirror-mysql mysql -ugitlab_mirror -pmirror_pass_123 gitlab_mirror  # 进入数据库
```

## 2. 测试

```bash
# 单元测试
./scripts/run-unit-tests.sh        # 运行单元测试（含日志和报告）
./scripts/mvn-test.sh              # 快速运行单元测试

# E2E测试
./scripts/run-e2e-tests.sh         # 运行E2E测试（含日志和报告）

cat logs/*-tests/*-report-*.txt    # 查看测试报告
```

## 3. 构建

```bash
# 后端
mvn clean package -DskipTests       # 完整构建

# 前端
cd web-ui
npm run build                      # 生产构建
npm run preview                    # 预览构建结果
```

## 4. 常用检查

```bash
# 端口检查
lsof -i :9999   # 后端
lsof -i :3000   # 前端

# API测试
curl -H "Authorization: Bearer YOUR_KEY" http://localhost:9999/api/sync/projects

# 查看同步失败事件
curl -H "Authorization: Bearer YOUR_KEY" "http://localhost:9999/api/sync/events?status=failed"
```

## 5. 数据库

```bash
# 执行SQL
docker exec gitlab-mirror-mysql mysql -ugitlab_mirror -pmirror_pass_123 gitlab_mirror -e "SELECT COUNT(*) FROM sync_project;"
```
