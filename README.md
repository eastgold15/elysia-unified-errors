# Elysia Package Example

一个 Elysia 插件开发的示例项目，展示如何创建、构建和发布 Elysia 插件。

## 特性

- 🚀 基于 TypeScript 开发
- 📦 使用 pkgroll 进行现代化打包
- 🧪 包含完整的测试套件
- 📚 提供详细的使用示例
- 🔧 支持可配置选项

## 安装

```bash
bun add elysia-package-example
```

## 使用方法

### 基本用法

```typescript
import { Elysia } from "elysia";
import { examplePlugin } from "elysia-package-example";

const app = new Elysia()
  .use(examplePlugin())
  .listen(3000);
```

### 自定义配置

```typescript
import { Elysia } from "elysia";
import { examplePlugin } from "elysia-package-example";

const app = new Elysia()
  .use(
    examplePlugin({
      prefix: "/api/v1",
      enableLogging: true,
      message: "自定义欢迎消息"
    })
  )
  .listen(3000);
```

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `prefix` | `string` | `"/example"` | API 路由前缀 |
| `enableLogging` | `boolean` | `true` | 是否启用请求日志 |
| `message` | `string` | `"Hello from Elysia plugin!"` | 自定义响应消息 |

## API 端点

插件提供以下端点：

- `GET {prefix}/` - 主要端点，返回插件信息
- `GET {prefix}/health` - 健康检查端点
- `POST {prefix}/echo` - 回显服务端点

## 开发

### 安装依赖

```bash
bun install
```

### 运行示例

```bash
bun run dev
```

### 运行测试

```bash
bun test
```

### 构建

```bash
bun run build
```

### 代码检查

```bash
bun run lint
bun run typecheck
```

## 项目结构

```
elysia-package-example/
├── src/
│   └── index.ts          # 主要插件代码
├── example/
│   └── index.ts          # 使用示例
├── test/
│   └── index.test.ts     # 测试文件
├── dist/                 # 构建输出目录
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── pkgroll.config.ts     # 构建配置
└── README.md             # 项目文档
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更多资源

- [Elysia 官方文档](https://elysiajs.com/)
- [Bun 官方文档](https://bun.sh/)
- [pkgroll 文档](https://github.com/privatenumber/pkgroll)