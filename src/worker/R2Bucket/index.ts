// src/worker/routes/image-crud.route.ts
import { Context, Hono } from "hono";
// import { cors } from "hono/cors"; // Hono 内置 CORS 中间件（更简洁）

// 1. 环境变量类型（与 wrangler 配置对齐）
export interface Env {
  VITE_BUCKET: R2Bucket; // R2 存储桶绑定名
  VITE_BUCKET_URL: string; // Worker 公网域名
}

// 2. 创建 Hono 实例，绑定 Env 类型
const ImageCRUDWorker = new Hono<{ Bindings: Env }>();

// 3. CORS 中间件（替代手动处理 OPTIONS，Hono 内置更健壮）
// ImageCRUDWorker.use(
//   cors({
//     origin: "*", // 生产环境替换为前端域名（如 "https://xxx.pages.dev"）
//     allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowHeaders: ["Content-Type", "Authorization"],
//   })
// );

// 4. 封装标准化响应函数（适配 Hono 上下文）
const createResponse = <T = null>(
  c: Context<{ Bindings: Env }>,
  data: T,
  code = 200,
  message = "success"
) => {
  return c.json(
    {
      code,
      message,
      data,
      timestamp: Date.now(),
    }
  );
};

// ========== 图片 CRUD 核心路由 ==========
/** 1. 获取所有图片列表 */
ImageCRUDWorker.get("/api/images", async (c) => {
  try {
    const list = await c.env.VITE_BUCKET.list({ limit: 100 });

    const imageList = list.objects.map((obj) => ({
      key: obj.key,
      size: obj.size,
      uploadTime: obj.uploaded,
      contentType: obj.httpMetadata?.contentType || "image/unknown",
      url: `${c.env.VITE_BUCKET_URL}/api/images/${encodeURIComponent(obj.key)}`,
    }));

    return createResponse(c, imageList);
  } catch (error) {
    console.error("获取图片列表失败:", error);
    return createResponse(c, null, 500, `服务器错误: ${(error as Error).message}`);
  }
});

/** 2. 上传图片 */
ImageCRUDWorker.post("/api/images", async (c) => {
  try {
    // 解析 FormData（Hono 原生支持）
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return createResponse(c, null, 400, "请选择要上传的图片");
    }

    // 限制文件类型/大小（可选，生产环境推荐）
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (!ALLOWED_TYPES.includes(file.type)) {
      return createResponse(c, null, 400, "仅支持 jpg/png/webp 格式图片");
    }
    if (file.size > MAX_SIZE) {
      return createResponse(c, null, 400, "图片大小不能超过 10MB");
    }

    // 生成唯一文件名
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const fileBuffer = await file.arrayBuffer();

    // 上传到 R2
    await c.env.VITE_BUCKET.put(fileName, fileBuffer, {
      httpMetadata: { contentType: file.type },
    });

    const imageUrl = `${c.env.VITE_BUCKET_URL}/api/images/${encodeURIComponent(fileName)}`;
    return createResponse(c, { key: fileName, url: imageUrl }, 201, "图片上传成功");
  } catch (error) {
    console.error("上传图片失败:", error);
    return createResponse(c, null, 500, `服务器错误: ${(error as Error).message}`);
  }
});

/** 3. 获取单个图片（预览/下载） */
ImageCRUDWorker.get("/api/images/:key", async (c) => {
  try {
    const key = decodeURIComponent(c.req.param("key"));
    const object = await c.env.VITE_BUCKET.get(key);

    if (!object) {
      return createResponse(c, null, 404, "图片不存在");
    }

    // 返回图片二进制数据（前端可直接预览）
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Access-Control-Allow-Origin", "*"); // 兼容跨域预览

    return new Response(object.body, { headers });
  } catch (error) {
    console.error("获取图片失败:", error);
    return createResponse(c, null, 500, `服务器错误: ${(error as Error).message}`);
  }
});

/** 4. 替换/修改图片 */
ImageCRUDWorker.put("/api/images/:key", async (c) => {
  try {
    const key = decodeURIComponent(c.req.param("key"));

    // 检查图片是否存在
    const existObj = await c.env.VITE_BUCKET.get(key);
    if (!existObj) {
      return createResponse(c, null, 404, "要修改的图片不存在");
    }

    // 解析新图片
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return createResponse(c, null, 400, "请选择要替换的图片");
    }

    const fileBuffer = await file.arrayBuffer();
    // 覆盖原有图片
    await c.env.VITE_BUCKET.put(key, fileBuffer, {
      httpMetadata: { contentType: file.type },
    });

    return createResponse(c, { key }, 200, "图片替换成功");
  } catch (error) {
    console.error("修改图片失败:", error);
    return createResponse(c, null, 500, `服务器错误: ${(error as Error).message}`);
  }
});

/** 5. 删除图片 */
ImageCRUDWorker.delete("/api/images/:key", async (c) => {
  try {
    const key = decodeURIComponent(c.req.param("key"));

    // 检查图片是否存在
    const existObj = await c.env.VITE_BUCKET.get(key);
    if (!existObj) {
      return createResponse(c, null, 404, "要删除的图片不存在");
    }

    // 删除 R2 图片
    await c.env.VITE_BUCKET.delete(key);
    return createResponse(c, null, 200, "图片删除成功");
  } catch (error) {
    console.error("删除图片失败:", error);
    return createResponse(c, null, 500, `服务器错误: ${(error as Error).message}`);
  }
});

// 6. 导出 Hono 路由实例
export default ImageCRUDWorker;