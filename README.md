# Elysia 插件/库开发模板

这是一个用于创建 Elysia 插件和库的完整模板项目。包含了现代化的工具链、测试套件和发布配置。

## 🚀 快速开始

### 使用此模板创建新项目

1. **克隆或下载模板**
   ```bash
   git clone https://github.com/yourusername/elysia-package-example.git your-plugin-name
   cd your-plugin-name
   ```

2. **替换项目信息**（见下方详细步骤）

3. **安装依赖**
   ```bash
   bun install
   ```

4. **开始开发**
   ```bash
   bun run dev
   ```

## 📝 模板自定义步骤

使用此模板创建新的 Elysia 插件时，你需要替换以下内容：

### 1. 修改 package.json

```json
{
  "name": "your-plugin-name",                    // 替换为你的插件名称
  "description": "你的插件描述",                  // 替换为你的插件描述
  "author": "你的名字",                          // 替换为你的名字
  "keywords": ["elysia", "plugin", "your-keywords"], // 添加相关关键词
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/your-plugin-name.git" // 替换仓库地址
  },
  "homepage": "https://github.com/yourusername/your-plugin-name#readme", // 替换主页地址
  "bugs": {
    "url": "https://github.com/yourusername/your-plugin-name/issues" // 替换问题追踪地址
  }
}
```

### 2. 修改源代码文件

- **`src/index.ts`** - 实现你的插件逻辑
- **`example/index.ts`** - 更新使用示例
- **`test/index.test.ts`** - 编写你的测试用例

### 3. 更新 README.md

- 替换项目标题和描述
- 更新安装命令中的包名
- 修改使用示例
- 更新 API 文档
- 添加你的许可证信息

### 4. 其他文件

- **`.gitignore`** - 根据需要添加忽略规则
- **`tsconfig.json`** - 根据需要调整 TypeScript 配置
- **`LICENSE`** - 添加许可证文件

## 🛠️ 模板特性

- ✅ **TypeScript 支持** - 完整的类型定义
- ✅ **现代构建工具** - 使用 pkgroll 进行零配置打包
- ✅ **测试框架** - 内置 Bun 测试支持
- ✅ **代码质量** - ESLint + Prettier 配置
- ✅ **多格式输出** - 同时支持 ESM 和 CommonJS
- ✅ **类型声明** - 自动生成 .d.ts 文件
- ✅ **开发服务器** - 热重载开发环境
- ✅ **发布配置** - npm 发布就绪

## 📦 包含的脚本

- `bun run dev` - 启动开发服务器（热重载）
- `bun run build` - 构建项目
- `bun test` - 运行测试
- `bun run lint` - 代码检查
- `bun run typecheck` - 类型检查
- `bun run format` - 代码格式化
- `bun run release` - 构建并发布

## 📁 项目结构说明

```
elysia-unified-errors/
├── src/
│   ├── index.ts              # 主入口文件 - 统一导出所有模块
│   ├── types/
│   │   └── base.ts           # 基础类型定义（HttpStatusCode, BaseError）
│   ├── errors/
│   │   ├── auth/
│   │   │   └── index.ts      # 认证相关错误（令牌、凭据、用户）
│   │   ├── business/
│   │   │   └── index.ts      # 业务相关错误（资源、权限、验证）
│   │   ├── system/
│   │   │   └── index.ts      # 系统相关错误（内部、网络、超时）
│   │   └── custom/
│   │       ├── index.ts      # 自定义错误基类和示例
│   │       └── README.md     # 自定义错误使用指南
│   └── utils/
│       └── index.ts          # 工具函数（错误处理、格式化）
├── example/
│   └── index.ts              # 使用示例 - 展示如何使用错误处理库
├── test/
│   └── index.test.ts         # 测试文件 - 完整的测试用例
├── dist/                     # 构建输出目录（自动生成）
│   ├── index.cjs             # CommonJS 格式
│   ├── index.mjs             # ES Module 格式
│   ├── index.d.cts           # CommonJS 类型声明
│   └── index.d.mts           # ES Module 类型声明
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── README.md                 # 项目文档
└── STRUCTURE.md              # 详细的模块化结构说明
```

## 🔧 开发指南

### 1. 插件开发

在 `src/index.ts` 中实现你的插件：

```typescript
import { Elysia } from "elysia";

// 定义配置选项类型
export interface YourPluginOptions {
  // 定义你的配置选项
}

// 导出插件函数
export const yourPlugin = (options?: YourPluginOptions) => {
  return new Elysia({ name: "your-plugin" })
    // 实现你的插件逻辑
    .get("/", () => "Hello from your plugin!");
};

// 默认导出
export default yourPlugin;
```

### 2. 编写测试

在 `test/index.test.ts` 中编写测试：

```typescript
import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { yourPlugin } from "../src";

describe("YourPlugin", () => {
  it("should work", async () => {
    const app = new Elysia().use(yourPlugin());
    const response = await app.handle(new Request("http://localhost/"));
    expect(response.status).toBe(200);
  });
});
```

### 3. 更新示例

在 `example/index.ts` 中展示用法：

```typescript
import { Elysia } from "elysia";
import { yourPlugin } from "../src";

const app = new Elysia()
  .use(yourPlugin())
  .listen(3000);

console.log("🦊 Elysia is running at http://localhost:3000");
```

## 🚀 发布你的插件

### 1. 构建项目
```bash
bun run build
```

### 2. 运行测试
```bash
bun test
```

### 3. 发布到 npm
```bash
npm publish --access public
```

或使用内置脚本：
```bash
bun run release
```

## 🤝 贡献新的错误类型

这个库的特色是通过社区贡献来扩展错误类型！

### 贡献流程

1. **Fork 仓库**
2. **添加新的错误类型**（参考现有实现）
3. **编写测试**
4. **更新文档**
5. **提交 PR**
6. **自动审核和合并** ✨

### 自动化 PR 审核

- 🤖 **自动代码检查**: 类型检查、语法检查、测试运行
- 🔍 **变更范围验证**: 确保只修改允许的文件
- ✅ **自动批准**: 符合规范的 PR 会自动批准
- 🚀 **自动合并**: 自动合并并发布新版本
- 📦 **自动发布**: 自动增加版本号并发布到 npm

### 支持的错误类型扩展

```typescript
// 示例：添加支付相关错误
export enum PaymentErrorType {
  PAYMENT_FAILED = "PAYMENT_FAILED",
  INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
  PAYMENT_METHOD_INVALID = "PAYMENT_METHOD_INVALID",
}

export const createPaymentError = {
  paymentFailed: (message?: string, data?: any) => new UnifiedError({
    code: PaymentErrorType.PAYMENT_FAILED,
    message: message || "支付失败",
    statusCode: HttpStatusCode.UNPROCESSABLE_ENTITY,
    data,
  }),
  // ...
};
```

## 📚 最佳实践

### 插件命名
- 使用 `elysia-` 前缀（如：`elysia-cors`, `elysia-jwt`）
- 使用清晰描述性的名称
- 遵循 npm 包命名规范

### 代码规范
- 使用 TypeScript 提供类型安全
- 为所有公开 API 提供类型定义
- 编写详细的 JSDoc 注释
- 保持插件轻量和专注



## 🤝 需要帮助？

- [Elysia 官方文档](https://elysiajs.com/)
- [Elysia 插件开发指南](https://elysiajs.com/plugins/overview)
- [Bun 官方文档](https://bun.sh/)
- [pkgroll 文档](https://github.com/privatenumber/pkgroll)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)


---

**开始构建你的 Elysia 插件吧！** 🎉