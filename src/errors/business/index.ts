import { BaseError, HttpStatusCode } from "../../types/base.js";

/**
 * 资源不存在错误
 */
export class ResourceNotFoundError extends BaseError {
	constructor(message = "资源不存在", data?: any) {
		super(message, HttpStatusCode.NOT_FOUND, "RESOURCE_NOT_FOUND", data);
	}
}

/**
 * 权限不足错误
 */
export class PermissionDeniedError extends BaseError {
	constructor(message = "权限不足", data?: any) {
		super(message, HttpStatusCode.FORBIDDEN, "PERMISSION_DENIED", data);
	}
}

/**
 * 操作失败错误
 */
export class OperationFailedError extends BaseError {
	constructor(message = "操作失败", data?: any) {
		super(message, HttpStatusCode.BAD_REQUEST, "OPERATION_FAILED", data);
	}
}

/**
 * 资源冲突错误
 */
export class ResourceConflictError extends BaseError {
	constructor(message = "资源已存在", data?: any) {
		super(message, HttpStatusCode.CONFLICT, "RESOURCE_CONFLICT", data);
	}
}

/**
 * 配额超限错误
 */
export class QuotaExceededError extends BaseError {
	constructor(message = "配额超限", data?: any) {
		super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "QUOTA_EXCEEDED", data);
	}
}

/**
 * 请求频率超限错误
 */
export class RateLimitExceededError extends BaseError {
	constructor(message = "请求频率超限", data?: any) {
		super(
			message,
			HttpStatusCode.TOO_MANY_REQUESTS,
			"RATE_LIMIT_EXCEEDED",
			data,
		);
	}
}

/**
 * 验证错误
 */
export class ValidationError extends BaseError {
	constructor(message = "数据验证失败", data?: any) {
		super(
			message,
			HttpStatusCode.UNPROCESSABLE_ENTITY,
			"VALIDATION_ERROR",
			data,
		);
	}
}
