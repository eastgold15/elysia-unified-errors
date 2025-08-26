import { describe, it, expect } from "bun:test";
import {
	BaseError,
	InvalidTokenError,
	ExpiredTokenError,
	MissingTokenError,
	InvalidCredentialsError,
	UserNotFoundError,
	ResourceNotFoundError,
	PermissionDeniedError,
	OperationFailedError,
	ResourceConflictError,
	QuotaExceededError,
	RateLimitExceededError,
	ValidationError,
	InternalError,
	NetworkError,
	TimeoutError,
	ServiceUnavailableError,
	ConfigurationError,
	// 自定义错误相关
	CustomError,
	PaymentFailedError,
	InsufficientFundsError,
	ProductOutOfStockError,
	InvalidCouponError,
	FileNotFoundError,
	FileTooLargeError,
	createCustomError,
	// 工具函数
	handleError,
	formatErrorResponse,
	HttpStatusCode,
} from "../src";

describe("Elysia Unified Errors - 简洁版本", () => {
	describe("BaseError 基础类", () => {
		it("应该正确创建基础错误实例", () => {
			const error = new BaseError("测试错误", 400, "TEST_ERROR", { test: true });
			
			expect(error.message).toBe("测试错误");
			expect(error.statusCode).toBe(400);
			expect(error.code).toBe("TEST_ERROR");
			expect(error.name).toBe("BaseError");
			expect(error.data).toEqual({ test: true });
			expect(error.timestamp).toBeDefined();
		});

		it("应该正确转换为JSON", () => {
			const error = new BaseError("测试错误", 400, "TEST_ERROR", { test: true });
			error.requestId = "req-123";
			
			const json = error.toJSON();
			expect(json).toEqual({
				name: "BaseError",
				code: "TEST_ERROR",
				message: "测试错误",
				statusCode: 400,
				timestamp: error.timestamp,
				requestId: "req-123",
				data: { test: true },
			});
		});
	});


  
	describe("认证相关错误", () => {
		it("InvalidTokenError - 无效令牌错误", () => {
			const error = new InvalidTokenError();
			console.log("xxxxxxx", error);

			expect(error.message).toBe("令牌无效");
			expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
			expect(error.code).toBe("INVALID_TOKEN");
			expect(error.name).toBe("InvalidTokenError");
		});

		it("InvalidTokenError - 自定义消息和数据", () => {
			const error = new InvalidTokenError("自定义令牌错误", { userId: 123 });

			expect(error.message).toBe("自定义令牌错误");
			expect(error.data).toEqual({ userId: 123 });
		});

		it("ExpiredTokenError - 令牌过期错误", () => {
			const error = new ExpiredTokenError();

			expect(error.message).toBe("令牌已过期");
			expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
			expect(error.code).toBe("EXPIRED_TOKEN");
		});

		it("MissingTokenError - 缺少令牌错误", () => {
			const error = new MissingTokenError();

			expect(error.message).toBe("缺少访问令牌");
			expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
			expect(error.code).toBe("MISSING_TOKEN");
		});

		it("InvalidCredentialsError - 无效凭据错误", () => {
			const error = new InvalidCredentialsError();

			expect(error.message).toBe("用户名或密码错误");
			expect(error.statusCode).toBe(HttpStatusCode.UNAUTHORIZED);
			expect(error.code).toBe("INVALID_CREDENTIALS");
		});

		it("UserNotFoundError - 用户不存在错误", () => {
			const error = new UserNotFoundError();

			expect(error.message).toBe("用户不存在");
			expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
			expect(error.code).toBe("USER_NOT_FOUND");
		});
	});

	describe("业务相关错误", () => {
		it("ResourceNotFoundError - 资源不存在错误", () => {
			const error = new ResourceNotFoundError("文章不存在");

			expect(error.message).toBe("文章不存在");
			expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
			expect(error.code).toBe("RESOURCE_NOT_FOUND");
		});

		it("PermissionDeniedError - 权限不足错误", () => {
			const error = new PermissionDeniedError();

			expect(error.message).toBe("权限不足");
			expect(error.statusCode).toBe(HttpStatusCode.FORBIDDEN);
			expect(error.code).toBe("PERMISSION_DENIED");
		});

		it("OperationFailedError - 操作失败错误", () => {
			const error = new OperationFailedError("删除操作失败");

			expect(error.message).toBe("删除操作失败");
			expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
			expect(error.code).toBe("OPERATION_FAILED");
		});

		it("ResourceConflictError - 资源冲突错误", () => {
			const error = new ResourceConflictError();

			expect(error.message).toBe("资源已存在");
			expect(error.statusCode).toBe(HttpStatusCode.CONFLICT);
			expect(error.code).toBe("RESOURCE_CONFLICT");
		});

		it("QuotaExceededError - 配额超限错误", () => {
			const error = new QuotaExceededError("存储空间不足");

			expect(error.message).toBe("存储空间不足");
			expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
			expect(error.code).toBe("QUOTA_EXCEEDED");
		});

		it("RateLimitExceededError - 请求频率超限错误", () => {
			const error = new RateLimitExceededError();

			expect(error.message).toBe("请求频率超限");
			expect(error.statusCode).toBe(HttpStatusCode.TOO_MANY_REQUESTS);
			expect(error.code).toBe("RATE_LIMIT_EXCEEDED");
		});

		it("ValidationError - 验证错误", () => {
			const error = new ValidationError("邮箱格式不正确", { field: "email" });

			expect(error.message).toBe("邮箱格式不正确");
			expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
			expect(error.code).toBe("VALIDATION_ERROR");
			expect(error.data).toEqual({ field: "email" });
		});
	});

	describe("系统相关错误", () => {
		it("InternalError - 内部错误", () => {
			const error = new InternalError();

			expect(error.message).toBe("系统内部错误");
			expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
			expect(error.code).toBe("INTERNAL_ERROR");
		});

		it("NetworkError - 网络错误", () => {
			const error = new NetworkError("连接超时");

			expect(error.message).toBe("连接超时");
			expect(error.statusCode).toBe(HttpStatusCode.BAD_GATEWAY);
			expect(error.code).toBe("NETWORK_ERROR");
		});

		it("TimeoutError - 超时错误", () => {
			const error = new TimeoutError();

			expect(error.message).toBe("请求超时");
			expect(error.statusCode).toBe(HttpStatusCode.GATEWAY_TIMEOUT);
			expect(error.code).toBe("TIMEOUT_ERROR");
		});

		it("ServiceUnavailableError - 服务不可用错误", () => {
			const error = new ServiceUnavailableError();

			expect(error.message).toBe("服务不可用");
			expect(error.statusCode).toBe(HttpStatusCode.SERVICE_UNAVAILABLE);
			expect(error.code).toBe("SERVICE_UNAVAILABLE");
		});

		it("ConfigurationError - 配置错误", () => {
			const error = new ConfigurationError("数据库配置错误");

			expect(error.message).toBe("数据库配置错误");
			expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
			expect(error.code).toBe("CONFIGURATION_ERROR");
		});
	});

	describe("错误处理函数", () => {
		it("应该直接抛出BaseError", () => {
			const originalError = new InvalidTokenError();

			expect(() => handleError(originalError)).toThrow(BaseError);
			expect(() => handleError(originalError)).toThrow(originalError);
		});

		it("应该转换标准Error为InternalError", () => {
			const standardError = new Error("测试错误");

			expect(() => handleError(standardError)).toThrow(InternalError);

			try {
				handleError(standardError);
			} catch (error) {
				if (error instanceof InternalError) {
					expect(error.message).toBe("测试错误");
					expect(error.code).toBe("INTERNAL_ERROR");
					expect(error.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);
				}
			}
		});

		it("应该处理未知错误", () => {
			const unknownError = "unknown error";

			expect(() => handleError(unknownError)).toThrow(InternalError);

			try {
				handleError(unknownError);
			} catch (error) {
				if (error instanceof InternalError) {
					expect(error.message).toBe("系统内部错误");
					expect(error.code).toBe("INTERNAL_ERROR");
				}
			}
		});

		it("应该支持requestId", () => {
			const requestId = "req-123";
			const standardError = new Error("测试错误");

			try {
				handleError(standardError, requestId);
			} catch (error) {
				if (error instanceof InternalError) {
					expect(error.requestId).toBe(requestId);
				}
			}
		});

		it("应该为已存在的BaseError添加requestId", () => {
			const requestId = "req-456";
			const existingError = new ValidationError("验证失败");

			try {
				handleError(existingError, requestId);
			} catch (error) {
				if (error instanceof BaseError) {
					expect(error.requestId).toBe(requestId);
				}
			}
		});
	});

	describe("错误响应格式化", () => {
		it("应该正确格式化错误响应", () => {
			const error = new ResourceNotFoundError("文章不存在", { articleId: 123 });
			error.requestId = "req-789";

			const formatted = formatErrorResponse(error);

			expect(formatted).toEqual({
				success: false,
				error: {
					code: "RESOURCE_NOT_FOUND",
					message: "文章不存在",
					timestamp: error.timestamp,
					requestId: "req-789",
					data: { articleId: 123 },
				},
			});
		});

		it("应该处理没有额外数据的错误", () => {
			const error = new InvalidTokenError();

			const formatted = formatErrorResponse(error);

			expect(formatted.success).toBe(false);
			expect(formatted.error.code).toBe("INVALID_TOKEN");
			expect(formatted.error.data).toBeUndefined();
		});
	});

	describe("继承关系测试", () => {
		it("所有错误类都应该继承自BaseError", () => {
			const errors = [
				new InvalidTokenError(),
				new ExpiredTokenError(),
				new ResourceNotFoundError(),
				new PermissionDeniedError(),
				new InternalError(),
				new NetworkError(),
			];

			errors.forEach((error) => {
				expect(error).toBeInstanceOf(BaseError);
				expect(error).toBeInstanceOf(Error);
			});
		});

		it("应该有正确的错误名称", () => {
			expect(new InvalidTokenError().name).toBe("InvalidTokenError");
			expect(new ResourceNotFoundError().name).toBe("ResourceNotFoundError");
			expect(new InternalError().name).toBe("InternalError");
		});
	});

	describe("HTTP状态码枚举", () => {
		it("应该包含所有必要的HTTP状态码", () => {
			expect(HttpStatusCode.BAD_REQUEST).toBe(400);
			expect(HttpStatusCode.UNAUTHORIZED).toBe(401);
			expect(HttpStatusCode.FORBIDDEN).toBe(403);
			expect(HttpStatusCode.NOT_FOUND).toBe(404);
			expect(HttpStatusCode.CONFLICT).toBe(409);
			expect(HttpStatusCode.UNPROCESSABLE_ENTITY).toBe(422);
			expect(HttpStatusCode.TOO_MANY_REQUESTS).toBe(429);
			expect(HttpStatusCode.INTERNAL_SERVER_ERROR).toBe(500);
			expect(HttpStatusCode.BAD_GATEWAY).toBe(502);
			expect(HttpStatusCode.SERVICE_UNAVAILABLE).toBe(503);
			expect(HttpStatusCode.GATEWAY_TIMEOUT).toBe(504);
		});
	});

	describe("实际使用场景测试", () => {
		it("模拟用户登录场景", () => {
			// 模拟无效凭据
			expect(() => {
				throw new InvalidCredentialsError("用户名或密码错误");
			}).toThrow("用户名或密码错误");

			// 模拟用户不存在
			const userError = new UserNotFoundError("用户 john@example.com 不存在", {
				email: "john@example.com",
			});
			expect(userError.data).toEqual({ email: "john@example.com" });
		});

		it("模拟API访问控制场景", () => {
			// 模拟缺少令牌
			const missingTokenError = new MissingTokenError();
			expect(missingTokenError.statusCode).toBe(401);

			// 模拟权限不足
			const permissionError = new PermissionDeniedError("无权访问管理员接口");
			expect(permissionError.statusCode).toBe(403);
		});

		it("模拟业务操作场景", () => {
			// 模拟资源冲突
			const conflictError = new ResourceConflictError("用户名已被占用", {
				username: "john",
			});
			expect(conflictError.statusCode).toBe(409);

			// 模拟配额超限
			const quotaError = new QuotaExceededError("文件大小超过10MB限制", {
				maxSize: "10MB",
			});
			expect(quotaError.statusCode).toBe(422);
		});
	});

	describe("自定义错误功能", () => {
		describe("CustomError 基类", () => {
			it("应该正确创建自定义错误", () => {
				class TestCustomError extends CustomError {
					constructor(message = "测试自定义错误", data?: any) {
						super(message, HttpStatusCode.BAD_REQUEST, "TEST_CUSTOM_ERROR", data);
					}
				}

				const error = new TestCustomError("自定义消息", { customField: "test" });

				expect(error).toBeInstanceOf(CustomError);
				expect(error).toBeInstanceOf(BaseError);
				expect(error.message).toBe("自定义消息");
				expect(error.statusCode).toBe(HttpStatusCode.BAD_REQUEST);
				expect(error.code).toBe("TEST_CUSTOM_ERROR");
				expect(error.data).toEqual({ customField: "test" });
			});
		});

		describe("内置自定义错误示例", () => {
			it("PaymentFailedError - 支付失败错误", () => {
				const error = new PaymentFailedError();

				expect(error).toBeInstanceOf(CustomError);
				expect(error.message).toBe("支付失败");
				expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
				expect(error.code).toBe("PAYMENT_FAILED");
			});

			it("PaymentFailedError - 自定义消息和数据", () => {
				const error = new PaymentFailedError("银行卡余额不足", {
					paymentMethod: "credit_card",
					amount: 999.99,
					errorCode: "INSUFFICIENT_FUNDS"
				});

				expect(error.message).toBe("银行卡余额不足");
				expect(error.data).toEqual({
					paymentMethod: "credit_card",
					amount: 999.99,
					errorCode: "INSUFFICIENT_FUNDS"
				});
			});

			it("InsufficientFundsError - 余额不足错误", () => {
				const error = new InsufficientFundsError();

				expect(error.message).toBe("余额不足");
				expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
				expect(error.code).toBe("INSUFFICIENT_FUNDS");
			});

			it("ProductOutOfStockError - 商品库存不足错误", () => {
				const error = new ProductOutOfStockError("热门商品已售窄", {
					productId: "laptop-001",
					requestQuantity: 5,
					availableStock: 0
				});

				expect(error.message).toBe("热门商品已售窄");
				expect(error.statusCode).toBe(HttpStatusCode.CONFLICT);
				expect(error.code).toBe("PRODUCT_OUT_OF_STOCK");
			});

			it("InvalidCouponError - 优惠券无效错误", () => {
				const error = new InvalidCouponError();

				expect(error.message).toBe("优惠券无效或已过期");
				expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
				expect(error.code).toBe("INVALID_COUPON");
			});

			it("FileNotFoundError - 文件不存在错误", () => {
				const error = new FileNotFoundError();

				expect(error.message).toBe("文件不存在");
				expect(error.statusCode).toBe(HttpStatusCode.NOT_FOUND);
				expect(error.code).toBe("FILE_NOT_FOUND");
			});

			it("FileTooLargeError - 文件过大错误", () => {
				const error = new FileTooLargeError("文件大小超出10MB限制", {
					fileName: "large-file.pdf",
					fileSize: 15 * 1024 * 1024,
					maxSize: 10 * 1024 * 1024
				});

				expect(error.message).toBe("文件大小超出10MB限制");
				expect(error.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);
				expect(error.code).toBe("FILE_TOO_LARGE");
			});
		});

		describe("createCustomError 工厂函数", () => {
			it("应该正确创建自定义错误类", () => {
				const EmailError = createCustomError(
					"EMAIL_SEND_ERROR",
					HttpStatusCode.BAD_GATEWAY,
					"邮件发送失败"
				);

				const error = new EmailError();

				expect(error).toBeInstanceOf(CustomError);
				expect(error).toBeInstanceOf(BaseError);
				expect(error.message).toBe("邮件发送失败");
				expect(error.statusCode).toBe(HttpStatusCode.BAD_GATEWAY);
				expect(error.code).toBe("EMAIL_SEND_ERROR");
			});

			it("应该支持自定义消息和数据", () => {
				const SmsError = createCustomError(
					"SMS_ERROR",
					HttpStatusCode.SERVICE_UNAVAILABLE,
					"短信发送失败"
				);

				const error = new SmsError("短信网关异常", {
					phone: "13800138000",
					gateway: "aliyun",
					retryCount: 3
				});

				expect(error.message).toBe("短信网关异常");
				expect(error.statusCode).toBe(HttpStatusCode.SERVICE_UNAVAILABLE);
				expect(error.code).toBe("SMS_ERROR");
				expect(error.data).toEqual({
					phone: "13800138000",
					gateway: "aliyun",
					retryCount: 3
				});
			});

			it("应该能创建多个不同的自定义错误类", () => {
				const OrderError = createCustomError(
					"ORDER_ERROR",
					HttpStatusCode.UNPROCESSABLE_ENTITY,
					"订单处理错误"
				);

				const DatabaseError = createCustomError(
					"DATABASE_ERROR",
					HttpStatusCode.INTERNAL_SERVER_ERROR,
					"数据库错误"
				);

				const orderError = new OrderError();
				const dbError = new DatabaseError();

				expect(orderError.code).toBe("ORDER_ERROR");
				expect(orderError.statusCode).toBe(HttpStatusCode.UNPROCESSABLE_ENTITY);

				expect(dbError.code).toBe("DATABASE_ERROR");
				expect(dbError.statusCode).toBe(HttpStatusCode.INTERNAL_SERVER_ERROR);

				// 确保它们是不同的类
				expect(orderError.constructor).not.toBe(dbError.constructor);
			});
		});
	});
});
