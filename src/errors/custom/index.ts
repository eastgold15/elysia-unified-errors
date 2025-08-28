import { BaseError, HttpStatusCode } from "../../types/base.js";

/**
 * 自定义错误基类
 * 用于创建特定领域的错误类型
 */
export abstract class CustomError extends BaseError {
	constructor(
		message: string,
		statusCode: HttpStatusCode,
		code: string,
		data?: any,
	) {
		super(message, statusCode, code, data);
	}
}

/**
 * 示例：支付相关错误
 */
export class PaymentFailedError extends CustomError {
	constructor(message = "支付失败", data?: any) {
		super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "PAYMENT_FAILED", data);
	}
}

/**
 * 资金不足错误
 */
export class InsufficientFundsError extends CustomError {
	constructor(message = "余额不足", data?: any) {
		super(
			message,
			HttpStatusCode.UNPROCESSABLE_ENTITY,
			"INSUFFICIENT_FUNDS",
			data,
		);
	}
}

/**
 * 示例：电商相关错误
 */
export class ProductOutOfStockError extends CustomError {
	constructor(message = "商品库存不足", data?: any) {
		super(message, HttpStatusCode.CONFLICT, "PRODUCT_OUT_OF_STOCK", data);
	}
}

/**
 * 示例：非法优惠卷错误
 */
export class InvalidCouponError extends CustomError {
	constructor(message = "优惠券无效或已过期", data?: any) {
		super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "INVALID_COUPON", data);
	}
}

/**
 * 示例：文件处理错误
 */
export class FileNotFoundError extends CustomError {
	constructor(message = "文件不存在", data?: any) {
		super(message, HttpStatusCode.NOT_FOUND, "FILE_NOT_FOUND", data);
	}
}

/**
 * 文件过大错误
 */
export class FileTooLargeError extends CustomError {
	constructor(message = "文件大小超出限制", data?: any) {
		super(message, HttpStatusCode.UNPROCESSABLE_ENTITY, "FILE_TOO_LARGE", data);
	}
}

/**
 * 创建自定义错误类的工厂函数
 *
 * @example
 * const MyCustomError = createCustomError("MY_CUSTOM_ERROR", HttpStatusCode.BAD_REQUEST, "自定义错误");
 * throw new MyCustomError("具体错误信息", { customData: true });
 */
export function createCustomError(
	code: string,
	defaultStatusCode: HttpStatusCode,
	defaultMessage: string,
) {
	return class extends CustomError {
		constructor(message = defaultMessage, data?: any) {
			super(message, defaultStatusCode, code, data);
		}
	};
}
