import { Hono } from "hono";
import { cors } from "hono/cors";
import auth from "./auth";
import news, { Env } from "./news";
import ImageCRUDWorker from "./R2Bucket";

// 创建主应用实例
const app = new Hono<{ Bindings: Env }>();

// 全局中间件配置
// 1. CORS中间件
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
}));

// 2. 全局日志中间件
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  const duration = end - start;
  console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`);
});

// 3. 全局错误处理中间件
app.onError((err, c) => {
  console.error("Global error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

// 4. 404处理
app.notFound((c) => {
  return c.json({ error: "Resource not found" }, 404);
});

// 根接口 - API信息
app.get("/api/", (c) => {
  return c.json({
    name: "天天学习",
    version: "1.0.0",
    description: "News and Auth API",
    endpoints: {
      auth: {
        login: "POST /api/login"
      },
      news: {
        list: "GET /api/news",
        create: "POST /api/news",
        detail: "GET /api/news/:id",
        update: "PUT /api/news/:id",
        delete: "DELETE /api/news/:id"
      }
    }
  });
});

// 挂载认证模块
app.route("", auth);

// 挂载新闻模块
app.route("", news);

// 对象存储
app.route("", ImageCRUDWorker);

export default app;
