# API 文档

## 基础类型

### HttpStatusCode

HTTP 状态码枚举，包含常用的错误状态码：

```typescript
enum HttpStatusCode {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}
```

### BaseError

所有错误类的基类：

```typescript
abstract class BaseError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly timestamp: string;
  requestId?: string;
  readonly data?: any;

  constructor(message: string, statusCode: number, code: string, data?: any);
  toJSON(): object;
}
```

**属性:**
- `statusCode` - HTTP 状态码
- `code` - 错误代码
- `timestamp` - 错误发生时间（ISO 格式）
- `requestId` - 请求 ID（可选）
- `data` - 附加数据（可选）

**方法:**
- `toJSON()` - 将错误转换为 JSON 对象

## 认证相关错误

### InvalidTokenError
```typescript
class InvalidTokenError extends BaseError
```
- **默认消息**: "令牌无效"
- **状态码**: 401 UNAUTHORIZED
- **错误代码**: "INVALID_TOKEN"

### ExpiredTokenError
```typescript
class ExpiredTokenError extends BaseError
```
- **默认消息**: "令牌已过期"
- **状态码**: 401 UNAUTHORIZED
- **错误代码**: "EXPIRED_TOKEN"

### MissingTokenError
```typescript
class MissingTokenError extends BaseError
```
- **默认消息**: "缺少访问令牌"
- **状态码**: 401 UNAUTHORIZED
- **错误代码**: "MISSING_TOKEN"

### InvalidCredentialsError
```typescript
class InvalidCredentialsError extends BaseError
```
- **默认消息**: "用户名或密码错误"
- **状态码**: 401 UNAUTHORIZED
- **错误代码**: "INVALID_CREDENTIALS"

### UserNotFoundError
```typescript
class UserNotFoundError extends BaseError
```
- **默认消息**: "用户不存在"
- **状态码**: 404 NOT_FOUND
- **错误代码**: "USER_NOT_FOUND"

## 业务相关错误

### ResourceNotFoundError
```typescript
class ResourceNotFoundError extends BaseError
```
- **默认消息**: "资源不存在"
- **状态码**: 404 NOT_FOUND
- **错误代码**: "RESOURCE_NOT_FOUND"

### PermissionDeniedError
```typescript
class PermissionDeniedError extends BaseError
```
- **默认消息**: "权限不足"
- **状态码**: 403 FORBIDDEN
- **错误代码**: "PERMISSION_DENIED"

### OperationFailedError
```typescript
class OperationFailedError extends BaseError
```
- **默认消息**: "操作失败"
- **状态码**: 400 BAD_REQUEST
- **错误代码**: "OPERATION_FAILED"

### ResourceConflictError
```typescript
class ResourceConflictError extends BaseError
```
- **默认消息**: "资源已存在"
- **状态码**: 409 CONFLICT
- **错误代码**: "RESOURCE_CONFLICT"

### QuotaExceededError
```typescript
class QuotaExceededError extends BaseError
```
- **默认消息**: "配额超限"
- **状态码**: 422 UNPROCESSABLE_ENTITY
- **错误代码**: "QUOTA_EXCEEDED"

### RateLimitExceededError
```typescript
class RateLimitExceededError extends BaseError
```
- **默认消息**: "请求频率超限"
- **状态码**: 429 TOO_MANY_REQUESTS
- **错误代码**: "RATE_LIMIT_EXCEEDED"

### ValidationError
```typescript
class ValidationError extends BaseError
```
- **默认消息**: "数据验证失败"
- **状态码**: 422 UNPROCESSABLE_ENTITY
- **错误代码**: "VALIDATION_ERROR"

## 系统相关错误

### InternalError
```typescript
class InternalError extends BaseError
```
- **默认消息**: "系统内部错误"
- **状态码**: 500 INTERNAL_SERVER_ERROR
- **错误代码**: "INTERNAL_ERROR"

### NetworkError
```typescript
class NetworkError extends BaseError
```
- **默认消息**: "网络连接错误"
- **状态码**: 502 BAD_GATEWAY
- **错误代码**: "NETWORK_ERROR"

### TimeoutError
```typescript
class TimeoutError extends BaseError
```
- **默认消息**: "请求超时"
- **状态码**: 504 GATEWAY_TIMEOUT
- **错误代码**: "TIMEOUT_ERROR"

### ServiceUnavailableError
```typescript
class ServiceUnavailableError extends BaseError
```
- **默认消息**: "服务不可用"
- **状态码**: 503 SERVICE_UNAVAILABLE
- **错误代码**: "SERVICE_UNAVAILABLE"

### ConfigurationError
```typescript
class ConfigurationError extends BaseError
```
- **默认消息**: "配置错误"
- **状态码**: 500 INTERNAL_SERVER_ERROR
- **错误代码**: "CONFIGURATION_ERROR"

## 自定义错误

### CustomError
```typescript
abstract class CustomError extends BaseError
```
自定义错误的基类，用于创建特定领域的错误类型。

### createCustomError
```typescript
function createCustomError(
  code: string,
  defaultStatusCode: HttpStatusCode,
  defaultMessage: string
): typeof CustomError
```

工厂函数，用于快速创建自定义错误类。

**参数:**
- `code` - 错误代码
- `defaultStatusCode` - 默认 HTTP 状态码
- `defaultMessage` - 默认错误消息

**返回:** 自定义错误类

**示例:**
```typescript
const MyError = createCustomError("MY_ERROR", HttpStatusCode.BAD_REQUEST, "我的错误");
throw new MyError("具体错误信息", { customData: true });
```

### 内置自定义错误示例

#### 支付相关
- `PaymentFailedError` - 支付失败
- `InsufficientFundsError` - 余额不足

#### 电商相关
- `ProductOutOfStockError` - 商品库存不足
- `InvalidCouponError` - 优惠券无效

#### 文件处理
- `FileNotFoundError` - 文件不存在
- `FileTooLargeError` - 文件过大

## 工具函数

### formatErrorResponse
```typescript
function formatErrorResponse(error: BaseError): object
```

格式化错误响应为标准格式。

**参数:**
- `error` - BaseError 实例

**返回:** 格式化的错误响应对象
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    timestamp: string,
    requestId?: string,
    data?: any
  }
}
```

### handleError
```typescript
function handleError(error: unknown, requestId?: string): never
```

统一的错误处理函数，将任意错误转换为 BaseError 并抛出。

**参数:**
- `error` - 任意错误对象
- `requestId` - 可选的请求 ID

**行为:**
- 如果是 BaseError，直接抛出（添加 requestId 如果缺失）
- 如果是标准 Error，转换为 InternalError
- 其他未知错误，转换为 InternalError

**示例:**
```typescript
try {
  // 可能出错的代码
  someRiskyOperation();
} catch (error) {
  handleError(error, "req-123");
}
```