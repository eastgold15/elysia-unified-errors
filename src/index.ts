/**
 * Elysia 统一错误处理库 - 模块化版本
 * 提供简洁直观的错误类和统一的错误处理
 */

// 认证相关错误
export {
	ExpiredTokenError,
	InvalidCredentialsError,
	InvalidTokenError,
	MissingTokenError,
	UserNotFoundError,
} from "./errors/auth/index.js";
// 业务相关错误
export {
	OperationFailedError,
	PermissionDeniedError,
	QuotaExceededError,
	RateLimitExceededError,
	ResourceConflictError,
	ResourceNotFoundError,
	ValidationError,
} from "./errors/business/index.js";
// 自定义错误
export {
	CustomError,
	createCustomError,
	FileNotFoundError,
	FileTooLargeError,
	InsufficientFundsError,
	InvalidCouponError,
	PaymentFailedError,
	ProductOutOfStockError,
} from "./errors/custom/index.js";

// 系统相关错误
export {
	ConfigurationError,
	InternalError,
	NetworkError,
	ServiceUnavailableError,
	TimeoutError,
} from "./errors/system/index.js"
// "./errors/system/index.ts";
// 基础类型和基类
export { BaseError, HttpStatusCode } from "./types/base.js";

// 工具函数
export { formatErrorResponse, handleError } from "./utils/index.js";
