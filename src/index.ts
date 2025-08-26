import { Elysia } from "elysia";

/**
 * Example Elysia plugin configuration options
 */
export interface ExamplePluginOptions {
  /** 插件前缀 */
  prefix?: string;
  /** 是否启用日志 */
  enableLogging?: boolean;
  /** 自定义消息 */
  message?: string;
}

/**
 * Example Elysia plugin that adds a greeting endpoint
 */
export const examplePlugin = (options: ExamplePluginOptions = {}) => {
  const {
    prefix = "/example",
    enableLogging = true,
    message = "Hello from Elysia plugin!"
  } = options;

  return new Elysia({ name: "example-plugin" })
    .decorate("exampleMessage", message)
    .derive(() => ({
      timestamp: new Date().toISOString()
    }))
    .onBeforeHandle(() => {
      if (enableLogging) {
        console.log(`[ExamplePlugin] Processing request at ${new Date().toISOString()}`);
      }
    })
    .group(prefix, (app: any) =>
      app
        .get("/", ({ exampleMessage, timestamp }: any) => ({
          message: exampleMessage,
          timestamp,
          plugin: "example-plugin"
        }))
        .get("/health", () => ({
          status: "ok",
          plugin: "example-plugin",
          timestamp: new Date().toISOString()
        }))
        .post("/echo", ({ body }: any) => ({
          echo: body,
          timestamp: new Date().toISOString()
        }))
    );
};

/**
 * 默认导出插件
 */
export default examplePlugin;

/**
 * 导出类型定义
 */