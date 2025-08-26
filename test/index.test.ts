import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { examplePlugin } from "../src";

describe("ExamplePlugin", () => {
  it("应该正确创建插件", () => {
    const app = new Elysia().use(examplePlugin());
    expect(app).toBeDefined();
  });

  it("应该响应默认路由", async () => {
    const app = new Elysia().use(examplePlugin());
    
    const response = await app.handle(new Request("http://localhost/example"));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("timestamp");
    expect(data).toHaveProperty("plugin", "example-plugin");
  });

  it("应该响应健康检查", async () => {
    const app = new Elysia().use(examplePlugin());
    
    const response = await app.handle(new Request("http://localhost/example/health"));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("status", "ok");
    expect(data).toHaveProperty("plugin", "example-plugin");
    expect(data).toHaveProperty("timestamp");
  });

  it("应该支持自定义配置", async () => {
    const customMessage = "自定义消息";
    const app = new Elysia().use(
      examplePlugin({
        prefix: "/custom",
        message: customMessage
      })
    );
    
    const response = await app.handle(new Request("http://localhost/custom"));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.message).toBe(customMessage);
  });

  it("应该处理 POST 请求", async () => {
    const app = new Elysia().use(examplePlugin());
    const testBody = { test: "data" };
    
    const response = await app.handle(
      new Request("http://localhost/example/echo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testBody)
      })
    );
    
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty("echo");
    expect(data).toHaveProperty("timestamp");
  });
});