# 模块化文件结构说明

## 📁 文件结构

```
src/
├── index.ts                    # 主入口文件 - 统一导出所有模块
├── types/
│   └── base.ts                # 基础类型定义
├── errors/
│   ├── auth/
│   │   └── index.ts           # 认证相关错误
│   ├── business/
│   │   └── index.ts           # 业务相关错误  
│   ├── system/
│   │   └── index.ts           # 系统相关错误
│   └── custom/
│       ├── index.ts           # 自定义错误基类和示例
│       └── README.md          # 自定义错误使用指南
└── utils/
    └── index.ts               # 工具函数
```

## 🎯 模块分类

### 📝 基础类型 (`types/base.ts`)
- `HttpStatusCode` - HTTP状态码枚举
- `BaseError` - 基础错误类，所有错误的父类

### 🔐 认证相关错误 (`errors/auth/`)
- `InvalidTokenError` - 无效令牌错误
- `ExpiredTokenError` - 令牌过期错误
- `MissingTokenError` - 缺少令牌错误
- `InvalidCredentialsError` - 无效凭据错误
- `UserNotFoundError` - 用户不存在错误

### 💼 业务相关错误 (`errors/business/`)
- `ResourceNotFoundError` - 资源不存在错误
- `PermissionDeniedError` - 权限不足错误
- `OperationFailedError` - 操作失败错误
- `ResourceConflictError` - 资源冲突错误
- `QuotaExceededError` - 配额超限错误
- `RateLimitExceededError` - 请求频率超限错误
- `ValidationError` - 验证错误

### ⚙️ 系统相关错误 (`errors/system/`)
- `InternalError` - 内部错误
- `NetworkError` - 网络错误
- `TimeoutError` - 超时错误
- `ServiceUnavailableError` - 服务不可用错误
- `ConfigurationError` - 配置错误

### 🎨 自定义错误 (`errors/custom/`)
- `CustomError` - 自定义错误基类
- `createCustomError()` - 工厂函数，快速创建自定义错误类

#### 内置自定义错误示例：
**支付相关：**
- `PaymentFailedError` - 支付失败
- `InsufficientFundsError` - 余额不足

**电商相关：**
- `ProductOutOfStockError` - 商品库存不足
- `InvalidCouponError` - 优惠券无效

**文件处理：**
- `FileNotFoundError` - 文件不存在
- `FileTooLargeError` - 文件过大

### 🛠️ 工具函数 (`utils/`)
- `formatErrorResponse()` - 格式化错误响应
- `handleError()` - 统一错误处理函数

## 🚀 使用方式

### 完整导入
```typescript
import {
  BaseError,
  HttpStatusCode,
  InvalidTokenError,
  ResourceNotFoundError,
  InternalError,
  CustomError,
  createCustomError,
  formatErrorResponse,
  handleError
} from "@pori15/elysia-unified-errors";
```

### 按需导入
```typescript
// 只导入认证相关错误
import { InvalidTokenError, ExpiredTokenError } from "@pori15/elysia-unified-errors";

// 只导入自定义错误功能
import { CustomError, createCustomError } from "@pori15/elysia-unified-errors";

// 只导入工具函数
import { formatErrorResponse, handleError } from "@pori15/elysia-unified-errors";
```

## ✨ 模块化优势

1. **清晰的结构** - 按功能领域分类，便于理解和维护
2. **按需导入** - 减小打包体积，只导入需要的模块
3. **易于扩展** - 新增错误类型时有明确的归类位置
4. **职责分明** - 每个模块专注于特定的错误类型
5. **便于测试** - 可以针对不同模块编写独立的测试

## 🔧 扩展指南

### 添加新的认证错误
在 `errors/auth/index.ts` 中添加：
```typescript
export class TwoFactorRequiredError extends BaseError {
  constructor(message = "需要双因子认证", data?: any) {
    super(message, HttpStatusCode.UNAUTHORIZED, "TWO_FACTOR_REQUIRED", data);
  }
}
```

然后在主入口文件 `src/index.ts` 中导出：
```typescript
export {
  // ... 其他认证错误
  TwoFactorRequiredError,
} from "./errors/auth";
```

### 添加新的错误分类
1. 在 `errors/` 下创建新文件夹，如 `errors/payment/`
2. 创建 `errors/payment/index.ts` 实现相关错误类
3. 在主入口文件中添加导出

这样的模块化设计让错误处理库更加清晰、易于维护和扩展！