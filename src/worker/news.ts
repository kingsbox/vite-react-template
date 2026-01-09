import { Hono } from "hono";
import { validator } from "hono/validator";
import { logger } from "./middleware";

export interface Env {
  "prod-d1-tutorial": D1Database;
}

// 新闻类型定义
export interface NewsItem {
  id?: number;
  title: string;
  content: string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 创建/更新新闻的请求体类型
export interface NewsRequest {
  title: string;
  content: string;
}

const news = new Hono<{ Bindings: Env }>();

// 应用日志中间件
news.use("*", logger);

// 获取所有新闻
news.get("/api/news", async (c) => {
  try {
    const { results } = await c.env["prod-d1-tutorial"].prepare(
      "SELECT * FROM News ORDER BY createdAt DESC"
    )
      .run();
    return c.json({
      status: "success",
      message: "News fetched successfully",
      data: results,
      total: results.length
    }, 200);
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({
      status: "error",
      message: "Failed to fetch news",
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 获取单个新闻
news.get("/api/news/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({
        status: "error",
        message: "Invalid news ID"
      }, 400);
    }

    const { results } = await c.env["prod-d1-tutorial"].prepare(
      "SELECT * FROM News WHERE id = ?"
    )
      .bind(id)
      .run();

    if (results.length === 0) {
      return c.json({
        status: "error",
        message: "News not found"
      }, 404);
    }

    return c.json({
      status: "success",
      message: "News fetched successfully",
      data: results[0]
    }, 200);
  } catch (error) {
    console.error("Error fetching news:", error);
    return c.json({
      status: "error",
      message: "Failed to fetch news",
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 创建新闻
news.post("/api/news", validator("json", (value, c) => {
  if (typeof value.title !== "string" || value.title === "") {
    return c.json({
      status: "error",
      message: "Title is required"
    }, 400);
  }
  if (typeof value.content !== "string" || value.content === "") {
    return c.json({
      status: "error",
      message: "Content is required"
    }, 400);
  }
  return value as NewsRequest;
}), async (c) => {
  try {
    const { title, content } = await c.req.valid("json");
    const date = new Date().toISOString().split("T")[0];
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const { success, meta } = await c.env["prod-d1-tutorial"].prepare(
      "INSERT INTO News (title, content, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(title, content, date, createdAt, updatedAt)
      .run();

    if (!success) {
      return c.json({
        status: "error",
        message: "Failed to create news"
      }, 500);
    }

    // 获取刚创建的新闻
    const { results } = await c.env["prod-d1-tutorial"].prepare(
      "SELECT * FROM News WHERE id = ?"
    )
      .bind(meta.last_row_id)
      .run();

    return c.json({
      status: "success",
      message: "News created successfully",
      data: results[0]
    }, 201);
  } catch (error) {
    console.error("Error creating news:", error);
    return c.json({
      status: "error",
      message: "Failed to create news",
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 更新新闻
news.put("/api/news/:id", validator("json", (value, c) => {
  if (typeof value.title !== "string" || value.title === "") {
    return c.json({
      status: "error",
      message: "Title is required"
    }, 400);
  }
  if (typeof value.content !== "string" || value.content === "") {
    return c.json({
      status: "error",
      message: "Content is required"
    }, 400);
  }
  return value as NewsRequest;
}), async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({
        status: "error",
        message: "Invalid news ID"
      }, 400);
    }

    const { title, content } = await c.req.valid("json");
    const updatedAt = new Date().toISOString();

    const { success, meta } = await c.env["prod-d1-tutorial"].prepare(
      "UPDATE News SET title = ?, content = ?, updatedAt = ? WHERE id = ?"
    )
      .bind(title, content, updatedAt, id)
      .run();

    if (meta.changes === 0) {
      return c.json({
        status: "error",
        message: "News not found"
      }, 404);
    }

    if (!success) {
      return c.json({
        status: "error",
        message: "Failed to update news"
      }, 500);
    }

    // 获取更新后的新闻
    const { results } = await c.env["prod-d1-tutorial"].prepare(
      "SELECT * FROM News WHERE id = ?"
    )
      .bind(id)
      .run();

    return c.json({
      status: "success",
      message: "News updated successfully",
      data: results[0]
    }, 200);
  } catch (error) {
    console.error("Error updating news:", error);
    return c.json({
      status: "error",
      message: "Failed to update news",
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// 删除新闻
news.delete("/api/news/:id", async (c) => {
  try {
    const id = parseInt(c.req.param("id"));
    if (isNaN(id)) {
      return c.json({
        status: "error",
        message: "Invalid news ID"
      }, 400);
    }

    const { success, meta } = await c.env["prod-d1-tutorial"].prepare(
      "DELETE FROM News WHERE id = ?"
    )
      .bind(id)
      .run();

    if (meta.changes === 0) {
      return c.json({
        status: "error",
        message: "News not found"
      }, 404);
    }

    if (!success) {
      return c.json({
        status: "error",
        message: "Failed to delete news"
      }, 500);
    }

    return c.json({
      status: "success",
      message: "News deleted successfully",
      data: { id }
    }, 200);
  } catch (error) {
    console.error("Error deleting news:", error);
    return c.json({
      status: "error",
      message: "Failed to delete news",
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

export default news;
