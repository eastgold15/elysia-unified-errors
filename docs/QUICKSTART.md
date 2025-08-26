# 快速开始指南

## 安装

```bash
npm install @pori15/elysia-unified-errors
# 或
yarn add @pori15/elysia-unified-errors
# 或
bun add @pori15/elysia-unified-errors
```

## 基本使用

### 1. 导入错误类

```typescript
import { 
  InvalidTokenError, 
  ResourceNotFoundError,
  ValidationError 
} from "@pori15/elysia-unified-errors";
```

### 2. 抛出错误

```typescript
// 使用默认消息
throw new InvalidTokenError();

// 使用自定义消息
throw new ResourceNotFoundError("用户不存在", { userId: 123 });

// 包含详细数据
throw new ValidationError("邮箱格式不正确", {
  field: "email",
  value: "invalid-email",
  constraint: "Must be a valid email address"
});
```

### 3. 在 Elysia 中使用

```typescript
import { Elysia } from "elysia";
import { 
  InvalidTokenError,
  ResourceNotFoundError,
  handleError,
  formatErrorResponse
} from "@pori15/elysia-unified-errors";

const app = new Elysia()
  // 全局错误处理
  .onError(({ error, set }) => {
    if (error instanceof BaseError) {
      set.status = error.statusCode;
      return formatErrorResponse(error);
    }
    
    // 处理其他错误
    try {
      handleError(error);
    } catch (processedError) {
      set.status = processedError.statusCode;
      return formatErrorResponse(processedError);
    }
  })
  
  // API 路由
  .get("/users/:id", ({ params }) => {
    const user = getUserById(params.id);
    if (!user) {
      throw new ResourceNotFoundError("用户不存在", { userId: params.id });
    }
    return user;
  })
  
  .post("/auth/login", ({ body, headers }) => {
    const token = headers.authorization?.replace("Bearer ", "");
    if (!token) {
      throw new InvalidTokenError("缺少访问令牌");
    }
    
    // 验证令牌...
    if (!isValidToken(token)) {
      throw new InvalidTokenError("令牌无效", { token });
    }
    
    return { success: true };
  })
  
  .listen(3000);
```

## 进阶使用

### 1. 自定义错误类

```typescript
import { CustomError, HttpStatusCode } from "@pori15/elysia-unified-errors";

// 继承方式
export class OrderProcessingError extends CustomError {
  constructor(message = "订单处理失败", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "ORDER_PROCESSING_ERROR", data);
  }
}

// 使用
throw new OrderProcessingError("库存不足", { 
  orderId: "12345", 
  productId: "abc",
  requestedQuantity: 5,
  availableQuantity: 2
});
```

### 2. 工厂函数创建

```typescript
import { createCustomError, HttpStatusCode } from "@pori15/elysia-unified-errors";

// 创建自定义错误类
const EmailSendError = createCustomError(
  "EMAIL_SEND_ERROR",
  HttpStatusCode.BAD_GATEWAY,
  "邮件发送失败"
);

const SmsError = createCustomError(
  "SMS_ERROR",
  HttpStatusCode.SERVICE_UNAVAILABLE,
  "短信发送失败"
);

// 使用
throw new EmailSendError("SMTP 服务器连接失败", { 
  recipient: "user@example.com",
  smtpServer: "smtp.example.com"
});
```

### 3. 中间件模式

```typescript
import { Elysia } from "elysia";
import { BaseError, handleError, formatErrorResponse } from "@pori15/elysia-unified-errors";

// 错误处理中间件
const errorHandler = (app: Elysia) => app
  .derive(({ request }) => ({
    requestId: request.headers.get("x-request-id") || generateRequestId()
  }))
  .onError(({ error, set, requestId }) => {
    try {
      // 如果已经是我们的错误类型
      if (error instanceof BaseError) {
        if (!error.requestId) {
          error.requestId = requestId;
        }
        set.status = error.statusCode;
        return formatErrorResponse(error);
      }
      
      // 处理其他错误
      handleError(error, requestId);
    } catch (processedError) {
      set.status = processedError.statusCode;
      return formatErrorResponse(processedError);
    }
  });

// 应用到你的 app
const app = new Elysia()
  .use(errorHandler)
  .get("/", () => "Hello World")
  .listen(3000);
```

### 4. 按类型导入

```typescript
// 只导入认证相关
import { 
  InvalidTokenError, 
  ExpiredTokenError, 
  MissingTokenError 
} from "@pori15/elysia-unified-errors";

// 只导入业务相关
import { 
  ResourceNotFoundError, 
  PermissionDeniedError, 
  ValidationError 
} from "@pori15/elysia-unified-errors";

// 只导入工具函数
import { 
  formatErrorResponse, 
  handleError 
} from "@pori15/elysia-unified-errors";
```

## 最佳实践

### 1. 错误消息设计

```typescript
// ❌ 不好的做法
throw new ValidationError("error");

// ✅ 好的做法
throw new ValidationError("邮箱格式不正确", {
  field: "email",
  value: "invalid@",
  constraint: "必须是有效的邮箱地址",
  suggestion: "请检查邮箱格式，如：user@example.com"
});
```

### 2. 错误数据结构

```typescript
// 推荐的数据结构
const errorData = {
  // 资源标识
  resourceId: "user-123",
  
  // 具体字段（验证错误）
  field: "email",
  value: "invalid-email",
  
  // 约束说明
  constraint: "Must be a valid email format",
  
  // 解决建议
  suggestion: "Please use format: user@domain.com",
  
  // 相关上下文
  context: {
    userId: 123,
    operation: "user-registration"
  }
};

throw new ValidationError("邮箱格式不正确", errorData);
```

### 3. 请求 ID 追踪

```typescript
import { Elysia } from "elysia";
import { v4 as uuidv4 } from "uuid";

const app = new Elysia()
  .derive(({ request }) => ({
    requestId: request.headers.get("x-request-id") || uuidv4()
  }))
  .get("/users/:id", ({ params, requestId }) => {
    try {
      const user = getUserById(params.id);
      if (!user) {
        const error = new ResourceNotFoundError("用户不存在", { userId: params.id });
        error.requestId = requestId;
        throw error;
      }
      return user;
    } catch (error) {
      handleError(error, requestId);
    }
  });
```

### 4. 日志记录

```typescript
import { BaseError } from "@pori15/elysia-unified-errors";

const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof BaseError) {
      // 记录业务错误
      console.warn("Business Error:", {
        code: error.code,
        message: error.message,
        requestId: error.requestId,
        timestamp: error.timestamp,
        data: error.data
      });
      
      set.status = error.statusCode;
      return formatErrorResponse(error);
    } else {
      // 记录系统错误
      console.error("System Error:", error);
      
      const internalError = new InternalError("系统内部错误");
      set.status = internalError.statusCode;
      return formatErrorResponse(internalError);
    }
  });
```

这样你就可以快速上手使用 Elysia 统一错误处理库了！