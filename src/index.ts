/**
 * Elysia 统一错误处理库 - 模块化版本
 * 提供简洁直观的错误类和统一的错误处理
 */

// 基础类型和基类
export { BaseError, HttpStatusCode } from "./types/base";

// 认证相关错误
export {
  InvalidTokenError,
  ExpiredTokenError,
  MissingTokenError,
  InvalidCredentialsError,
  UserNotFoundError,
} from "./errors/auth";

// 业务相关错误
export {
  ResourceNotFoundError,
  PermissionDeniedError,
  OperationFailedError,
  ResourceConflictError,
  QuotaExceededError,
  RateLimitExceededError,
  ValidationError,
} from "./errors/business";

// 系统相关错误
export {
  InternalError,
  NetworkError,
  TimeoutError,
  ServiceUnavailableError,
  ConfigurationError,
} from "./errors/system";

// 自定义错误
export {
  CustomError,
  PaymentFailedError,
  InsufficientFundsError,
  ProductOutOfStockError,
  InvalidCouponError,
  FileNotFoundError,
  FileTooLargeError,
  createCustomError,
} from "./errors/custom";

// 工具函数
export { formatErrorResponse, handleError } from "./utils";