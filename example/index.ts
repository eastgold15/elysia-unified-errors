import { Elysia } from "elysia";
import { examplePlugin } from "../src";

const app = new Elysia()
  .use(
    examplePlugin({
      prefix: "/api/v1",
      enableLogging: true,
      message: "欢迎使用 Elysia 示例插件！"
    })
  )
  .get("/", () => "Elysia 示例应用正在运行！访问 /api/v1 查看插件功能")
  .listen(3000);

console.log(
  `🦊 Elysia 服务器正在运行在 ${app.server?.hostname}:${app.server?.port}`
);

console.log("\n可用的端点:");
console.log("- GET  /              - 主页");
console.log("- GET  /api/v1        - 插件主页");
console.log("- GET  /api/v1/health - 健康检查");
console.log("- POST /api/v1/echo   - 回显服务");