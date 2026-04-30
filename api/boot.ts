import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/router.ts";
import { createContext } from "../server/context.ts";

const app = new Hono().basePath("/api"); // 统一前缀，简化逻辑

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// 处理 tRPC 请求
app.use("/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc.ts",
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext(c.req.raw),
  });
});

// 健康检查（用来测试后端通没通）
app.get("/health", (c) => c.json({ status: "ok", message: "Backend is alive!" }));

export default app;
