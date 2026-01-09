import { Context, Next } from "hono";
import type { Env } from "./news";

// 基本日志中间件
export const logger = async (c: Context<{ Bindings: Env }>, next: Next) => {
  const start = Date.now();
  await next();
  const end = Date.now();
  const duration = end - start;
  console.log(`${c.req.method} ${c.req.path} ${c.res.status} ${duration}ms`);
};
