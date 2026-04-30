import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/router";
import { createContext } from "../server/context";

const app = new Hono(); // 彻底去掉 .basePath

app.use("*", cors());
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// 这里的路径必须和浏览器访问的一模一样
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: () => createContext(c.req.raw),
  });
});

// 这里的路径也要补全 /api
app.get("/api/health", (c) => c.json({ status: "ok", message: "Finally alive!" }));

export default app;
