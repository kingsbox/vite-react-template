我来帮你把这个英文 README 文件翻译成中文版本。

# React + Vite + Hono + Cloudflare Workers

[![部署到 Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cloudflare/templates/tree/main/vite-react-template)

这个模板为使用 TypeScript 和 Vite 构建 React 应用提供了最小化的设置，专为在 Cloudflare Workers 上运行而设计。它具有热模块替换、ESLint 集成以及 Workers 部署的灵活性。

![React + TypeScript + Vite + Cloudflare Workers](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fc7b4b62-442b-4769-641b-ad4422d74300/public)

<!-- dash-content-start -->

🚀 使用这个强大的技术栈提升你的 Web 开发体验：

- [**React**](https://react.dev/) - 用于构建交互式界面的现代 UI 库
- [**Vite**](https://vite.dev/) - 快速的构建工具和开发服务器
- [**Hono**](https://hono.dev/) - 超轻量、现代的后端框架
- [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) - 用于全球部署的边缘计算平台

### ✨ 主要特性

- 🔥 热模块替换（HMR）实现快速开发
- 📦 开箱即用的 TypeScript 支持
- 🛠️ 包含 ESLint 配置
- ⚡ 零配置部署到 Cloudflare 全球网络
- 🎯 使用 Hono 的优雅路由实现 API 路由
- 🔄 全栈开发设置
- 🔎 内置可观测性以监控你的 Worker

通过本地开发或直接在 Cloudflare 仪表板部署，几分钟内即可开始。非常适合构建现代、高性能的边缘 Web 应用。

<!-- dash-content-end -->

## 开始上手

要使用此模板创建新项目，请运行：

```bash
npm create cloudflare@latest -- --template=cloudflare/templates/vite-react-template
```

此模板的实时部署示例可在以下地址查看：
[https://vite.kingweb.dpdns.org/](https://vite.kingweb.dpdns.org/)

## 开发

安装依赖：

```bash
npm install
```

使用以下命令启动开发服务器：

```bash
npm run dev
```

你的应用将在 [http://localhost:5173](http://localhost:5173) 可用。

## 生产环境

为生产环境构建项目：

```bash
npm run build
```

打包并上传到 Workers：

```bash
npm run deploy
```

在本地预览构建：

```bash
npm run preview
```

将项目部署到 Cloudflare Workers：

```bash
npm run build && npm run deploy
```

监控你的 Workers：

```bash
npx wrangler tail
```

## 其他资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Vite 文档](https://vitejs.dev/guide/)
- [React 文档](https://reactjs.org/)
- [Hono 文档](https://hono.dev/)

## 数据库

- [Cloudflare D1 文档](https://developers.cloudflare.com/d1/get-started/)

```sql
// 创建表
npx wrangler d1 execute prod-d1-tutorial --local --file=./src/sql/schema.sql

// 查询所有客户
npx wrangler d1 execute prod-d1-tutorial --local --command="SELECT * FROM Customers"
```
