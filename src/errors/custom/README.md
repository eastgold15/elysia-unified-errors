# 自定义错误使用指南

本模块提供了创建自定义错误的灵活方式，适用于特定业务场景的错误处理。

## 使用方式

### 1. 继承 CustomError 基类

```typescript
import { CustomError, HttpStatusCode } from "@pori15/elysia-unified-errors";

// 创建特定领域的错误类
export class OrderProcessingError extends CustomError {
  constructor(message = "订单处理失败", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "ORDER_PROCESSING_ERROR", data);
  }
}

// 使用
throw new OrderProcessingError("订单库存不足", { orderId: "12345", productId: "abc" });
```

### 2. 使用工厂函数快速创建

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
throw new EmailSendError("SMTP 服务器连接失败", { recipient: "user@example.com" });
throw new SmsError("短信网关异常", { phone: "13800138000" });
```

## 内置的自定义错误示例

### 支付相关错误
- `PaymentFailedError` - 支付失败
- `InsufficientFundsError` - 余额不足

### 电商相关错误  
- `ProductOutOfStockError` - 商品库存不足
- `InvalidCouponError` - 优惠券无效

### 文件处理错误
- `FileNotFoundError` - 文件不存在
- `FileTooLargeError` - 文件过大

## 最佳实践

### 1. 命名约定
- 错误类名使用 `PascalCase`，以 `Error` 结尾
- 错误代码使用 `UPPER_SNAKE_CASE`
- 错误代码应该具有描述性和唯一性

### 2. 状态码选择指南
- `400 BAD_REQUEST` - 客户端请求错误
- `401 UNAUTHORIZED` - 认证失败
- `403 FORBIDDEN` - 权限不足
- `404 NOT_FOUND` - 资源不存在
- `409 CONFLICT` - 资源冲突
- `422 UNPROCESSABLE_ENTITY` - 业务逻辑错误
- `429 TOO_MANY_REQUESTS` - 请求频率超限
- `500 INTERNAL_SERVER_ERROR` - 服务器内部错误
- `502 BAD_GATEWAY` - 网关错误
- `503 SERVICE_UNAVAILABLE` - 服务不可用
- `504 GATEWAY_TIMEOUT` - 网关超时

### 3. 错误信息设计
- 提供清晰、用户友好的错误消息
- 包含有助于调试的上下文数据
- 避免暴露敏感的系统信息

### 4. 数据字段建议
```typescript
// 推荐的数据字段结构
const errorData = {
  resourceId: "订单ID或资源标识",
  field: "具体的字段名（用于验证错误）",
  value: "导致错误的值",
  constraint: "约束条件说明",
  suggestion: "解决建议"
};
```

## 扩展示例

### 创建业务特定的错误模块

```typescript
// errors/order.ts
import { CustomError, HttpStatusCode } from "@pori15/elysia-unified-errors";

export class OrderNotFoundError extends CustomError {
  constructor(orderId: string, data?: any) {
    super(
      `订单不存在: ${orderId}`,
      HttpStatusCode.NOT_FOUND,
      "ORDER_NOT_FOUND",
      { orderId, ...data }
    );
  }
}

export class OrderExpiredError extends CustomError {
  constructor(orderId: string, expiredAt: string, data?: any) {
    super(
      `订单已过期: ${orderId}`,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      "ORDER_EXPIRED",
      { orderId, expiredAt, ...data }
    );
  }
}

export class OrderStatusConflictError extends CustomError {
  constructor(orderId: string, currentStatus: string, expectedStatus: string, data?: any) {
    super(
      `订单状态冲突: 当前状态 ${currentStatus}，期望状态 ${expectedStatus}`,
      HttpStatusCode.CONFLICT,
      "ORDER_STATUS_CONFLICT",
      { orderId, currentStatus, expectedStatus, ...data }
    );
  }
}
```

### 在 Elysia 中使用

```typescript
import { Elysia } from "elysia";
import { OrderNotFoundError, handleError } from "@pori15/elysia-unified-errors";

const app = new Elysia()
  .get("/order/:id", ({ params, request }) => {
    try {
      const order = getOrderById(params.id);
      if (!order) {
        throw new OrderNotFoundError(params.id);
      }
      return order;
    } catch (error) {
      handleError(error, request.headers.get("x-request-id"));
    }
  })
  .listen(3000);
```

这样的模块化设计让错误处理更加清晰、易于维护和扩展！