import { BaseError, HttpStatusCode } from "../../types/base.js";

/**
 * 无效令牌错误
 */
export class InvalidTokenError extends BaseError {
	constructor(message = "令牌无效", data?: any) {
		super(message, HttpStatusCode.UNAUTHORIZED, "INVALID_TOKEN", data);
	}
}

/**
 * 令牌过期错误
 */
export class ExpiredTokenError extends BaseError {
	constructor(message = "令牌已过期", data?: any) {
		super(message, HttpStatusCode.UNAUTHORIZED, "EXPIRED_TOKEN", data);
	}
}

/**
 * 缺少令牌错误
 */
export class MissingTokenError extends BaseError {
	constructor(message = "缺少访问令牌", data?: any) {
		super(message, HttpStatusCode.UNAUTHORIZED, "MISSING_TOKEN", data);
	}
}

/**
 * 无效凭据错误
 */
export class InvalidCredentialsError extends BaseError {
	constructor(message = "用户名或密码错误", data?: any) {
		super(message, HttpStatusCode.UNAUTHORIZED, "INVALID_CREDENTIALS", data);
	}
}

/**
 * 用户不存在错误
 */
export class UserNotFoundError extends BaseError {
	constructor(message = "用户不存在", data?: any) {
		super(message, HttpStatusCode.NOT_FOUND, "USER_NOT_FOUND", data);
	}
}
