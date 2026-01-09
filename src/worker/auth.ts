import { Hono } from "hono";
import { validator } from "hono/validator";
import { logger } from "./middleware";

// 登录请求体类型
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应体类型
export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
}

const auth = new Hono<{ Bindings: Env }>();

// 应用日志中间件
auth.use("*", logger);

// 登录接口
auth.post("/api/login", validator("json", (value, c) => {
  if (typeof value.username !== "string" || value.username.trim() === "") {
    return c.json({ success: false, message: "Username is required" }, 400);
  }
  if (typeof value.password !== "string" || value.password.trim() === "") {
    return c.json({ success: false, message: "Password is required" }, 400);
  }
  return value as LoginRequest;
}), async (c) => {
  try {
    const { username, password } = await c.req.valid("json");

    // 验证用户凭据（实际项目中应使用数据库和加密密码）
    if (username === "admin" && password === "password") {
      // 模拟生成 JWT（实际项目中应使用真正的JWT库）
      const token = "mock-jwt-token-for-admin";
      return c.json({ success: true, token } as LoginResponse, 200);
    } else {
      return c.json({ success: false, message: "Invalid credentials" } as LoginResponse, 401);
    }
  } catch (error) {
    console.error("Error during login:", error);
    return c.json({ success: false, message: "Internal server error" } as LoginResponse, 500);
  }
});

export default auth;
