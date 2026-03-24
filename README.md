# Word Manager - 英语单词学习系统

一个基于 Cloudflare Workers 和 Pages 的英语单词学习应用，支持 AI 智能分析生成单词卡片。

## 功能特性

- 📝 **单词添加**：输入单词，AI 自动分析生成学习卡片
- 🎴 **卡片翻转**：正面显示单词和音标，背面显示详细内容
- 📋 **列表视图**：快速浏览所有单词，点击查看详情
- ⭐ **收藏功能**：标记重点单词
- 🔍 **搜索筛选**：快速查找单词
- 📊 **学习统计**：可视化学习进度
- 🎯 **学习模式**：闪卡复习，间隔重复算法
- 💾 **持久存储**：基于 Cloudflare D1 数据库

## 卡片内容

每个单词卡片包含：
- 音标（IPA）
- 词性
- 中文释义
- 例句（带翻译）
- 词源分析
- 记忆技巧
- 同义词/反义词
- 常见搭配
- 词形变化
- 考试等级（CET4/CET6/IELTS/TOEFL/GRE）
- 难度等级（1-5星）

## 技术栈

- **前端**：React + TypeScript + Tailwind CSS
- **后端**：Hono + Cloudflare Workers
- **数据库**：Cloudflare D1 (SQLite)
- **AI**：DeepSeek API（兼容 OpenAI API）

## 项目结构

```
word-manager/
├── frontend/          # React 前端
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── services/     # API 服务
│   │   ├── types/        # 类型定义
│   │   └── ...
│   └── ...
├── backend/           # Hono 后端
│   ├── src/
│   │   ├── index.ts      # API 入口
│   │   └── schema.sql    # 数据库结构
│   └── ...
└── README.md
```

## 本地开发

### 前置要求

- Node.js 18+
- pnpm
- Cloudflare 账号
- DeepSeek API Key（或 OpenAI API Key）

### 1. 安装依赖

```bash
# 后端
cd backend
pnpm install

# 前端
cd ../frontend
pnpm install
```

### 2. 配置数据库

```bash
cd backend

# 创建 D1 数据库（远程）
pnpm run db:init

# 记录输出的 database_id，更新 wrangler.toml 中的 database_id
```

更新 `backend/wrangler.toml`：
```toml
[[d1_databases]]
binding = "DB"
database_name = "word-manager-db"
database_id = "你的数据库ID"
```

执行数据库迁移：
```bash
# 本地数据库
pnpm run db:migrate:local

# 远程数据库（部署后）
pnpm run db:migrate
```

### 3. 配置环境变量

创建 `backend/.dev.vars`：

```bash
# 必填：AI API Key
AI_API_KEY=你的DeepSeek_API_Key

# 可选：自定义 API 地址（默认 DeepSeek）
# AI_API_BASE_URL=https://api.deepseek.com

# 可选：自定义模型（默认 deepseek-chat）
# AI_MODEL=deepseek-chat
```

#### 使用 OpenAI

如需使用 OpenAI，修改 `.dev.vars`：

```bash
AI_API_KEY=你的OpenAI_API_Key
AI_API_BASE_URL=https://api.openai.com
AI_MODEL=gpt-4o-mini
```

### 4. 启动开发服务器

```bash
# 后端 (在 backend 目录)
pnpm dev

# 前端 (在 frontend 目录，新终端)
pnpm dev
```

前端默认运行在 `http://localhost:5173`，后端默认运行在 `http://localhost:8787`。

创建 `frontend/.env.local` 配置后端地址：
```
VITE_API_URL=http://localhost:8787
```

## 部署到 Cloudflare

### 后端部署

```bash
cd backend

# 设置 AI API Key 密钥
wrangler secret put AI_API_KEY

# 可选：设置其他环境变量
# wrangler secret put AI_API_BASE_URL
# wrangler secret put AI_MODEL

# 部署
pnpm run deploy

# 执行远程数据库迁移
pnpm run db:migrate
```

部署成功后会输出 Worker URL，例如：`https://word-manager-api.你的子域名.workers.dev`

### 前端部署

#### 方式一：命令行部署

```bash
cd frontend

# 创建生产环境配置
echo "VITE_API_URL=https://word-manager-api.你的子域名.workers.dev" > .env.production

# 构建并部署
pnpm run deploy
```

#### 方式二：Cloudflare Dashboard 部署

1. 构建前端：
   ```bash
   cd frontend
   VITE_API_URL=https://word-manager-api.你的子域名.workers.dev pnpm build
   ```

2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. 进入 **Workers & Pages** > **Create application** > **Pages**
4. 选择 **Upload assets**
5. 上传 `frontend/dist` 目录
6. 设置项目名称，完成部署

#### 方式三：Git 自动部署（推荐）

1. 将代码推送到 GitHub/GitLab
2. 在 Cloudflare Dashboard 创建 Pages 项目
3. 连接 Git 仓库
4. 配置构建设置：
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Root directory**: `frontend`
5. 添加环境变量：
   - `VITE_API_URL`: 后端 Worker URL

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/words | 获取所有单词 |
| GET | /api/words/:id | 获取单个单词 |
| POST | /api/words | 添加单词（AI 分析） |
| PUT | /api/words/:id | 更新单词 |
| DELETE | /api/words/:id | 删除单词 |
| PATCH | /api/words/:id/favorite | 切换收藏状态 |
| GET | /api/review/due | 获取待复习单词 |
| POST | /api/review/:id | 提交复习结果 |
| GET | /api/stats | 获取学习统计 |

## 环境变量说明

| 变量名 | 必填 | 默认值 | 说明 |
|--------|------|--------|------|
| AI_API_KEY | ✅ | - | DeepSeek 或 OpenAI API Key |
| AI_API_BASE_URL | ❌ | https://api.deepseek.com | API 基础地址 |
| AI_MODEL | ❌ | deepseek-chat | 使用的模型名称 |

## License

MIT