# 自定义错误使用指南

这个文档展示了如何在 `elysia-unified-errors` 库中创建和使用自定义错误类型。

## 🎯 自定义错误的三种方式

### 方式一：直接继承 CustomError

```typescript
import { CustomError, HttpStatusCode } from "elysia-unified-errors";

export class EmailAlreadyExistsError extends CustomError {
  constructor(message = "邮箱地址已被注册", data?: any) {
    super(message, HttpStatusCode.CONFLICT, "EMAIL_ALREADY_EXISTS", data);
  }
}

export class WeakPasswordError extends CustomError {
  constructor(message = "密码强度不足", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "WEAK_PASSWORD", data);
  }
}
```

### 方式二：直接继承 BaseError

```typescript
import { BaseError, HttpStatusCode } from "elysia-unified-errors";

export class DatabaseConnectionError extends BaseError {
  constructor(message = "数据库连接失败", data?: any) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, "DATABASE_CONNECTION_ERROR", data);
  }
}
```

### 方式三：使用工厂函数动态创建

```typescript
import { createCustomError, HttpStatusCode } from "elysia-unified-errors";

// 动态创建错误类
const OrderNotFoundError = createCustomError(
  "ORDER_NOT_FOUND",
  HttpStatusCode.NOT_FOUND,
  "订单不存在"
);

const InventoryError = createCustomError(
  "INVENTORY_ERROR",
  HttpStatusCode.CONFLICT,
  "库存操作失败"
);

// 使用创建的错误类
throw new OrderNotFoundError("订单 #12345 不存在", { orderId: "12345" });
throw new InventoryError("商品库存不足", { productId: "ABC123", requested: 5, available: 2 });
```

## 🏢 按业务领域组织自定义错误

### 电商领域错误

```typescript
// src/errors/ecommerce/index.ts
import { CustomError, HttpStatusCode } from "elysia-unified-errors";

export class ProductNotFoundError extends CustomError {
  constructor(message = "商品不存在", data?: any) {
    super(message, HttpStatusCode.NOT_FOUND, "PRODUCT_NOT_FOUND", data);
  }
}

export class CartEmptyError extends CustomError {
  constructor(message = "购物车为空", data?: any) {
    super(message, HttpStatusCode.BAD_REQUEST, "CART_EMPTY", data);
  }
}

export class PaymentDeclinedError extends CustomError {
  constructor(message = "支付被拒绝", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "PAYMENT_DECLINED", data);
  }
}
```

### 社交媒体领域错误

```typescript
// src/errors/social/index.ts
import { CustomError, HttpStatusCode } from "elysia-unified-errors";

export class PostTooLongError extends CustomError {
  constructor(message = "帖子内容超出长度限制", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "POST_TOO_LONG", data);
  }
}

export class UserBlockedError extends CustomError {
  constructor(message = "用户已被屏蔽", data?: any) {
    super(message, HttpStatusCode.FORBIDDEN, "USER_BLOCKED", data);
  }
}

export class ContentViolationError extends CustomError {
  constructor(message = "内容违反社区规定", data?: any) {
    super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "CONTENT_VIOLATION", data);
  }
}
```

## 💡 使用示例

### 在 Elysia 应用中使用

```typescript
import { Elysia } from "elysia";
import {
  BaseError,
  formatErrorResponse,
  PaymentFailedError,
  ProductOutOfStockError,
} from "elysia-unified-errors";

const app = new Elysia()
  .onError(({ error, set }) => {
    if (error instanceof BaseError) {
      set.status = error.statusCode;
      return formatErrorResponse(error);
    }
  })
  
  .post("/orders", ({ body }) => {
    const { productId, quantity, paymentMethod } = body;
    
    // 检查库存
    if (getStock(productId) < quantity) {
      throw new ProductOutOfStockError("商品库存不足", {
        productId,
        requested: quantity,
        available: getStock(productId)
      });
    }
    
    // 处理支付
    try {
      processPayment(paymentMethod, getTotalPrice(productId, quantity));
    } catch (error) {
      throw new PaymentFailedError("支付处理失败", {
        paymentMethod,
        errorCode: error.code
      });
    }
    
    return { success: true, orderId: createOrder() };
  });
```

### 复杂的错误处理场景

```typescript
import { CustomError, HttpStatusCode } from "elysia-unified-errors";

// 创建特定业务场景的错误
export class OrderProcessingError extends CustomError {
  constructor(step: string, reason: string, data?: any) {
    super(
      `订单处理在 ${step} 步骤失败: ${reason}`,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      "ORDER_PROCESSING_ERROR",
      { step, reason, ...data }
    );
  }
}

// 使用示例
try {
  await validateOrder(order);
  await checkInventory(order.items);
  await processPayment(order.payment);
  await createShipment(order);
} catch (error) {
  if (error.code === "INVENTORY_CHECK_FAILED") {
    throw new OrderProcessingError("库存检查", "部分商品库存不足", {
      items: error.insufficientItems
    });
  }
  
  if (error.code === "PAYMENT_FAILED") {
    throw new OrderProcessingError("支付处理", "支付被拒绝", {
      paymentMethod: order.payment.method,
      amount: order.total
    });
  }
  
  throw new OrderProcessingError("未知步骤", "处理过程中发生未知错误", {
    originalError: error.message
  });
}
```

## 🎨 最佳实践

1. **命名规范**：错误类名使用 `PascalCase` 并以 `Error` 结尾
2. **错误码规范**：使用 `SCREAMING_SNAKE_CASE` 格式
3. **分类组织**：按业务领域或功能模块组织错误类
4. **提供上下文**：通过 `data` 参数提供有用的调试信息
5. **保持一致**：在同一项目中保持错误处理风格的一致性

## 📁 推荐的项目结构

```
src/
├── errors/
│   ├── auth/           # 认证相关错误
│   ├── business/       # 通用业务错误
│   ├── system/         # 系统错误
│   ├── custom/         # 基础自定义错误
│   ├── ecommerce/      # 电商业务错误
│   ├── social/         # 社交业务错误
│   └── payment/        # 支付相关错误
├── types/
└── utils/
```

这样的组织方式让错误类型清晰分类，便于维护和扩展。