# 使用场景示例

本文档包含各种实际场景下的使用示例。

## 1. 用户管理系统

```typescript
import { Elysia } from "elysia";
import {
  UserNotFoundError,
  InvalidCredentialsError,
  PermissionDeniedError,
  ResourceConflictError,
  ValidationError,
  formatErrorResponse
} from "@pori15/elysia-unified-errors";

const userApp = new Elysia({ prefix: "/api/users" })
  // 用户注册
  .post("/register", ({ body }) => {
    const { email, password, username } = body;
    
    // 验证输入
    if (!email || !email.includes("@")) {
      throw new ValidationError("邮箱格式不正确", {
        field: "email",
        value: email,
        constraint: "必须包含 @ 符号"
      });
    }
    
    if (!password || password.length < 8) {
      throw new ValidationError("密码长度不足", {
        field: "password",
        constraint: "密码长度至少 8 位",
        suggestion: "请使用包含字母、数字和特殊字符的密码"
      });
    }
    
    // 检查用户是否已存在
    if (userExists(email)) {
      throw new ResourceConflictError("用户已存在", {
        field: "email",
        value: email,
        suggestion: "请使用其他邮箱地址或尝试登录"
      });
    }
    
    // 创建用户
    const user = createUser({ email, password, username });
    return { success: true, user: { id: user.id, email: user.email } };
  })
  
  // 用户登录
  .post("/login", ({ body }) => {
    const { email, password } = body;
    
    // 查找用户
    const user = findUserByEmail(email);
    if (!user) {
      throw new UserNotFoundError("用户不存在", { email });
    }
    
    // 验证密码
    if (!verifyPassword(password, user.hashedPassword)) {
      throw new InvalidCredentialsError("密码错误", {
        email,
        lastLoginAttempt: new Date().toISOString()
      });
    }
    
    // 生成令牌
    const token = generateToken(user.id);
    return { success: true, token, user: { id: user.id, email: user.email } };
  })
  
  // 获取用户信息
  .get("/:id", ({ params, headers }) => {
    const userId = parseInt(params.id);
    const currentUserId = getCurrentUserId(headers.authorization);
    
    // 权限检查
    if (userId !== currentUserId && !isAdmin(currentUserId)) {
      throw new PermissionDeniedError("无权访问其他用户信息", {
        requestedUserId: userId,
        currentUserId,
        requiredPermission: "read:user"
      });
    }
    
    const user = findUserById(userId);
    if (!user) {
      throw new UserNotFoundError("用户不存在", { userId });
    }
    
    return user;
  })
  
  // 更新用户信息
  .put("/:id", ({ params, body, headers }) => {
    const userId = parseInt(params.id);
    const currentUserId = getCurrentUserId(headers.authorization);
    
    // 权限检查
    if (userId !== currentUserId) {
      throw new PermissionDeniedError("只能修改自己的信息", {
        requestedUserId: userId,
        currentUserId
      });
    }
    
    const user = findUserById(userId);
    if (!user) {
      throw new UserNotFoundError("用户不存在", { userId });
    }
    
    // 验证邮箱是否被其他用户使用
    if (body.email && body.email !== user.email && userExists(body.email)) {
      throw new ResourceConflictError("邮箱已被使用", {
        field: "email",
        value: body.email
      });
    }
    
    const updatedUser = updateUser(userId, body);
    return { success: true, user: updatedUser };
  });
```

## 2. 电商订单系统

```typescript
import { Elysia } from "elysia";
import {
  ResourceNotFoundError,
  PermissionDeniedError,
  ProductOutOfStockError,
  PaymentFailedError,
  InvalidCouponError,
  ValidationError,
  createCustomError,
  HttpStatusCode
} from "@pori15/elysia-unified-errors";

// 创建订单特定错误
const OrderStatusError = createCustomError(
  "ORDER_STATUS_ERROR",
  HttpStatusCode.CONFLICT,
  "订单状态冲突"
);

const ShippingError = createCustomError(
  "SHIPPING_ERROR",
  HttpStatusCode.UNPROCESSABLE_ENTITY,
  "配送地址错误"
);

const orderApp = new Elysia({ prefix: "/api/orders" })
  // 创建订单
  .post("/", ({ body, headers }) => {
    const { items, couponCode, shippingAddress } = body;
    const userId = getCurrentUserId(headers.authorization);
    
    // 验证商品库存
    for (const item of items) {
      const product = getProduct(item.productId);
      if (!product) {
        throw new ResourceNotFoundError("商品不存在", {
          productId: item.productId
        });
      }
      
      if (product.stock < item.quantity) {
        throw new ProductOutOfStockError("库存不足", {
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock: product.stock
        });
      }
    }
    
    // 验证优惠券
    let discount = 0;
    if (couponCode) {
      const coupon = getCoupon(couponCode);
      if (!coupon || !coupon.isValid || coupon.expiresAt < new Date()) {
        throw new InvalidCouponError("优惠券无效或已过期", {
          couponCode,
          expiresAt: coupon?.expiresAt,
          isValid: coupon?.isValid
        });
      }
      discount = coupon.discount;
    }
    
    // 验证配送地址
    if (!shippingAddress || !shippingAddress.city || !shippingAddress.address) {
      throw new ShippingError("配送地址不完整", {
        missingFields: ["city", "address"].filter(field => !shippingAddress[field])
      });
    }
    
    // 计算总价
    const totalAmount = calculateTotalAmount(items, discount);
    
    // 创建订单
    const order = createOrder({
      userId,
      items,
      totalAmount,
      shippingAddress,
      couponCode
    });
    
    return { success: true, order };
  })
  
  // 支付订单
  .post("/:id/pay", ({ params, body }) => {
    const orderId = parseInt(params.id);
    const { paymentMethod, paymentData } = body;
    
    const order = getOrder(orderId);
    if (!order) {
      throw new ResourceNotFoundError("订单不存在", { orderId });
    }
    
    // 检查订单状态
    if (order.status !== "pending") {
      throw new OrderStatusError("订单状态不允许支付", {
        orderId,
        currentStatus: order.status,
        expectedStatus: "pending"
      });
    }
    
    try {
      // 处理支付
      const paymentResult = processPayment({
        amount: order.totalAmount,
        method: paymentMethod,
        data: paymentData
      });
      
      if (!paymentResult.success) {
        throw new PaymentFailedError("支付处理失败", {
          orderId,
          paymentMethod,
          errorCode: paymentResult.errorCode,
          errorMessage: paymentResult.errorMessage
        });
      }
      
      // 更新订单状态
      updateOrderStatus(orderId, "paid");
      
      return { 
        success: true, 
        transactionId: paymentResult.transactionId,
        paidAt: new Date().toISOString()
      };
      
    } catch (error) {
      if (error instanceof PaymentFailedError) {
        throw error;
      }
      
      // 支付服务异常
      throw new PaymentFailedError("支付服务异常", {
        orderId,
        paymentMethod,
        originalError: error.message
      });
    }
  })
  
  // 取消订单
  .post("/:id/cancel", ({ params, headers }) => {
    const orderId = parseInt(params.id);
    const userId = getCurrentUserId(headers.authorization);
    
    const order = getOrder(orderId);
    if (!order) {
      throw new ResourceNotFoundError("订单不存在", { orderId });
    }
    
    // 权限检查
    if (order.userId !== userId && !isAdmin(userId)) {
      throw new PermissionDeniedError("无权取消此订单", {
        orderId,
        orderUserId: order.userId,
        currentUserId: userId
      });
    }
    
    // 检查订单状态
    if (!["pending", "paid"].includes(order.status)) {
      throw new OrderStatusError("当前状态不允许取消", {
        orderId,
        currentStatus: order.status,
        allowedStatuses: ["pending", "paid"]
      });
    }
    
    // 处理退款（如果已支付）
    if (order.status === "paid") {
      const refundResult = processRefund(order.transactionId, order.totalAmount);
      if (!refundResult.success) {
        throw new PaymentFailedError("退款处理失败", {
          orderId,
          transactionId: order.transactionId,
          refundError: refundResult.error
        });
      }
    }
    
    // 恢复库存
    restoreStock(order.items);
    
    // 更新订单状态
    updateOrderStatus(orderId, "cancelled");
    
    return { success: true, cancelledAt: new Date().toISOString() };
  });
```

## 3. 文件上传系统

```typescript
import { Elysia } from "elysia";
import {
  ValidationError,
  PermissionDeniedError,
  QuotaExceededError,
  FileNotFoundError,
  FileTooLargeError,
  InternalError,
  createCustomError,
  HttpStatusCode
} from "@pori15/elysia-unified-errors";

// 文件相关错误
const UnsupportedFileTypeError = createCustomError(
  "UNSUPPORTED_FILE_TYPE",
  HttpStatusCode.UNPROCESSABLE_ENTITY,
  "不支持的文件类型"
);

const StorageQuotaError = createCustomError(
  "STORAGE_QUOTA_EXCEEDED",
  HttpStatusCode.UNPROCESSABLE_ENTITY,
  "存储空间不足"
);

const fileApp = new Elysia({ prefix: "/api/files" })
  // 上传文件
  .post("/upload", ({ body, headers }) => {
    const { file, category, isPublic } = body;
    const userId = getCurrentUserId(headers.authorization);
    
    // 验证文件
    if (!file) {
      throw new ValidationError("请选择要上传的文件", {
        field: "file",
        constraint: "文件不能为空"
      });
    }
    
    // 文件大小限制 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new FileTooLargeError("文件大小超出限制", {
        fileName: file.name,
        fileSize: file.size,
        maxSize,
        sizeMB: Math.round(file.size / 1024 / 1024 * 100) / 100,
        maxSizeMB: 10
      });
    }
    
    // 文件类型验证
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf", "text/plain"];
    if (!allowedTypes.includes(file.type)) {
      throw new UnsupportedFileTypeError("不支持的文件类型", {
        fileName: file.name,
        fileType: file.type,
        allowedTypes,
        suggestion: "请上传 JPEG、PNG、GIF、PDF 或文本文件"
      });
    }
    
    // 检查用户存储配额
    const userStorage = getUserStorage(userId);
    const userQuota = getUserQuota(userId);
    
    if (userStorage.used + file.size > userQuota.total) {
      throw new StorageQuotaError("存储空间不足", {
        userId,
        currentUsed: userStorage.used,
        totalQuota: userQuota.total,
        fileSize: file.size,
        remainingSpace: userQuota.total - userStorage.used
      });
    }
    
    try {
      // 保存文件
      const savedFile = saveFile({
        file,
        userId,
        category: category || "general",
        isPublic: isPublic || false
      });
      
      // 更新用户存储使用量
      updateStorageUsage(userId, file.size);
      
      return {
        success: true,
        file: {
          id: savedFile.id,
          name: savedFile.name,
          size: savedFile.size,
          type: savedFile.type,
          url: savedFile.url,
          uploadedAt: savedFile.createdAt
        }
      };
      
    } catch (error) {
      throw new InternalError("文件保存失败", {
        fileName: file.name,
        userId,
        originalError: error.message
      });
    }
  })
  
  // 下载文件
  .get("/:id/download", ({ params, headers }) => {
    const fileId = parseInt(params.id);
    const userId = getCurrentUserId(headers.authorization);
    
    const file = getFile(fileId);
    if (!file) {
      throw new FileNotFoundError("文件不存在", { fileId });
    }
    
    // 权限检查
    if (!file.isPublic && file.userId !== userId) {
      throw new PermissionDeniedError("无权访问此文件", {
        fileId,
        fileUserId: file.userId,
        currentUserId: userId,
        isPublic: file.isPublic
      });
    }
    
    // 检查文件是否存在于存储中
    if (!fileExistsInStorage(file.path)) {
      throw new FileNotFoundError("文件已被删除", {
        fileId,
        fileName: file.name,
        originalPath: file.path
      });
    }
    
    // 返回文件流
    return Bun.file(file.path);
  })
  
  // 删除文件
  .delete("/:id", ({ params, headers }) => {
    const fileId = parseInt(params.id);
    const userId = getCurrentUserId(headers.authorization);
    
    const file = getFile(fileId);
    if (!file) {
      throw new FileNotFoundError("文件不存在", { fileId });
    }
    
    // 权限检查
    if (file.userId !== userId && !isAdmin(userId)) {
      throw new PermissionDeniedError("无权删除此文件", {
        fileId,
        fileUserId: file.userId,
        currentUserId: userId
      });
    }
    
    try {
      // 删除物理文件
      deleteFileFromStorage(file.path);
      
      // 删除数据库记录
      deleteFileRecord(fileId);
      
      // 更新用户存储使用量
      updateStorageUsage(userId, -file.size);
      
      return { success: true, deletedAt: new Date().toISOString() };
      
    } catch (error) {
      throw new InternalError("文件删除失败", {
        fileId,
        fileName: file.name,
        originalError: error.message
      });
    }
  });
```

## 4. API 限流和监控

```typescript
import { Elysia } from "elysia";
import {
  RateLimitExceededError,
  QuotaExceededError,
  ServiceUnavailableError,
  handleError,
  formatErrorResponse
} from "@pori15/elysia-unified-errors";

// 限流中间件
const rateLimitMiddleware = (app: Elysia) => app
  .derive(({ headers, request }) => {
    const clientId = headers["x-client-id"] || getClientIdFromToken(headers.authorization);
    const userAgent = headers["user-agent"];
    const ip = getClientIP(request);
    
    return { clientId, userAgent, ip };
  })
  .onBeforeHandle(({ clientId, ip, path, method }) => {
    // 检查 IP 限流
    const ipRateLimit = checkIPRateLimit(ip, path);
    if (ipRateLimit.exceeded) {
      throw new RateLimitExceededError("IP 请求频率超限", {
        ip,
        path,
        method,
        limit: ipRateLimit.limit,
        windowMs: ipRateLimit.windowMs,
        remainingTime: ipRateLimit.resetTime - Date.now(),
        retryAfter: Math.ceil((ipRateLimit.resetTime - Date.now()) / 1000)
      });
    }
    
    // 检查用户限流
    if (clientId) {
      const userRateLimit = checkUserRateLimit(clientId, path);
      if (userRateLimit.exceeded) {
        throw new RateLimitExceededError("用户请求频率超限", {
          clientId,
          path,
          method,
          limit: userRateLimit.limit,
          windowMs: userRateLimit.windowMs,
          remainingTime: userRateLimit.resetTime - Date.now(),
          retryAfter: Math.ceil((userRateLimit.resetTime - Date.now()) / 1000)
        });
      }
      
      // 检查 API 配额
      const quota = checkAPIQuota(clientId);
      if (quota.exceeded) {
        throw new QuotaExceededError("API 调用配额已用完", {
          clientId,
          quotaType: "monthly",
          used: quota.used,
          limit: quota.limit,
          resetDate: quota.resetDate,
          upgradeUrl: "/pricing"
        });
      }
    }
  });

// 健康检查和监控
const monitoringApp = new Elysia({ prefix: "/api/monitor" })
  .get("/health", () => {
    const dbStatus = checkDatabaseConnection();
    const redisStatus = checkRedisConnection();
    const diskSpace = checkDiskSpace();
    
    if (!dbStatus.healthy) {
      throw new ServiceUnavailableError("数据库连接异常", {
        service: "database",
        error: dbStatus.error,
        lastCheck: dbStatus.lastCheck
      });
    }
    
    if (!redisStatus.healthy) {
      throw new ServiceUnavailableError("Redis 连接异常", {
        service: "redis",
        error: redisStatus.error,
        lastCheck: redisStatus.lastCheck
      });
    }
    
    if (diskSpace.usage > 0.9) {
      throw new ServiceUnavailableError("磁盘空间不足", {
        service: "storage",
        usage: diskSpace.usage,
        available: diskSpace.available,
        total: diskSpace.total
      });
    }
    
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
        storage: diskSpace
      }
    };
  });

// 主应用
const app = new Elysia()
  .use(rateLimitMiddleware)
  .use(monitoringApp)
  .onError(({ error, set, headers }) => {
    // 设置 Retry-After 头
    if (error instanceof RateLimitExceededError && error.data?.retryAfter) {
      set.headers["Retry-After"] = error.data.retryAfter.toString();
    }
    
    if (error instanceof BaseError) {
      set.status = error.statusCode;
      return formatErrorResponse(error);
    }
    
    try {
      handleError(error, headers["x-request-id"]);
    } catch (processedError) {
      set.status = processedError.statusCode;
      return formatErrorResponse(processedError);
    }
  })
  .listen(3000);
```

这些示例展示了在不同业务场景下如何使用错误处理库来构建健壮的 API 系统！