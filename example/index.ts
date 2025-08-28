import { Elysia } from "elysia";
import {
	// 基础类型
	BaseError,
	// 自定义错误
	CustomError,
	createCustomError,
	ExpiredTokenError,
	// 工具函数
	formatErrorResponse,
	HttpStatusCode,
	handleError,
	// 系统相关错误
	InternalError,
	InvalidCredentialsError,
	// 认证相关错误
	InvalidTokenError,
	MissingTokenError,
	PaymentFailedError,
	PermissionDeniedError,
	ResourceConflictError,
	// 业务相关错误
	ResourceNotFoundError,
	ServiceUnavailableError,
	UserNotFoundError,
	ValidationError,
} from "../src";

// 模拟数据
const users = [
	{ id: 1, email: "admin@example.com", password: "admin123", role: "admin" },
	{ id: 2, email: "user@example.com", password: "user123", role: "user" },
];

const products = [
	{ id: 1, name: "笔记本电脑", price: 5999, stock: 10 },
	{ id: 2, name: "无线鼠标", price: 199, stock: 0 }, // 库存为0
];

// 创建自定义错误
const OutOfStockError = createCustomError(
	"OUT_OF_STOCK",
	HttpStatusCode.CONFLICT,
	"商品库存不足",
);

// 辅助函数
function generateRequestId() {
	return Math.random().toString(36).substring(2, 15);
}

function validateToken(token?: string) {
	if (!token) {
		throw new MissingTokenError();
	}

	if (token === "expired-token") {
		throw new ExpiredTokenError("令牌已过期，请重新登录");
	}

	if (token !== "valid-token") {
		throw new InvalidTokenError("无效的访问令牌");
	}

	return { userId: 1, role: "user" };
}

const app = new Elysia()
	// 添加请求 ID
	.derive(({ request }) => ({
		requestId: request.headers.get("x-request-id") || generateRequestId(),
	}))

	// 全局错误处理
	.onError(({ error, set, requestId }) => {
		console.log(`[${requestId}] 处理错误:`, error.message);

		if (error instanceof BaseError) {
			if (!error.requestId) {
				error.requestId = requestId;
			}
			set.status = error.statusCode;
			return formatErrorResponse(error);
		}

		// 处理其他错误
		try {
			handleError(error, requestId);
		} catch (processedError) {
			set.status = processedError.statusCode;
			return formatErrorResponse(processedError);
		}
	})

	// 首页
	.get("/", () => ({
		message: "🎉 Elysia 统一错误处理库示例",
		endpoints: {
			auth: {
				login: "POST /auth/login",
				profile: "GET /auth/profile (需要 token)",
			},
			users: {
				list: "GET /users",
				detail: "GET /users/:id",
				create: "POST /users",
			},
			products: {
				list: "GET /products",
				purchase: "POST /products/:id/purchase",
			},
			demo: {
				errors: "GET /demo/errors/:type",
				validation: "POST /demo/validation",
			},
		},
		testTokens: {
			valid: "valid-token",
			expired: "expired-token",
			invalid: "invalid-token",
		},
	}))

	// 认证相关 API
	.group("/auth", (app) =>
		app
			.post("/login", ({ body }) => {
				const { email, password } = body;

				if (!email || !password) {
					throw new ValidationError("邮箱和密码不能为空", {
						missingFields: [!email && "email", !password && "password"].filter(
							Boolean,
						),
					});
				}

				const user = users.find((u) => u.email === email);
				if (!user) {
					throw new UserNotFoundError("用户不存在", { email });
				}

				if (user.password !== password) {
					throw new InvalidCredentialsError("密码错误", {
						email,
						suggestion: "请检查密码是否正确",
					});
				}

				return {
					success: true,
					token: "valid-token",
					user: { id: user.id, email: user.email, role: user.role },
				};
			})

			.get("/profile", ({ headers }) => {
				const token = headers.authorization?.replace("Bearer ", "");
				const user = validateToken(token);

				const userInfo = users.find((u) => u.id === user.userId);
				return {
					id: userInfo.id,
					email: userInfo.email,
					role: userInfo.role,
				};
			}),
	)

	// 用户管理 API
	.group("/users", (app) =>
		app
			.get("/", () => {
				return users.map(({ password, ...user }) => user);
			})

			.get("/:id", ({ params }) => {
				const userId = parseInt(params.id);

				if (isNaN(userId)) {
					throw new ValidationError("无效的用户 ID", {
						field: "id",
						value: params.id,
						constraint: "必须是数字",
					});
				}

				const user = users.find((u) => u.id === userId);
				if (!user) {
					throw new UserNotFoundError("用户不存在", { userId });
				}

				const { password, ...userInfo } = user;
				return userInfo;
			})

			.post("/", ({ body }) => {
				const { email, password, role = "user" } = body;

				// 验证必填字段
				if (!email || !password) {
					throw new ValidationError("邮箱和密码不能为空", {
						missingFields: [!email && "email", !password && "password"].filter(
							Boolean,
						),
					});
				}

				// 验证邮箱格式
				if (!email.includes("@")) {
					throw new ValidationError("邮箱格式不正确", {
						field: "email",
						value: email,
						constraint: "必须包含 @ 符号",
					});
				}

				// 检查邮箱是否已存在
				if (users.find((u) => u.email === email)) {
					throw new ResourceConflictError("邮箱已被使用", {
						field: "email",
						value: email,
						suggestion: "请使用其他邮箱地址",
					});
				}

				const newUser = {
					id: users.length + 1,
					email,
					password,
					role,
				};

				users.push(newUser);

				const { password: _, ...userInfo } = newUser;
				return { success: true, user: userInfo };
			}),
	)

	// 商品相关 API
	.group("/products", (app) =>
		app
			.get("/", () => products)

			.post("/:id/purchase", ({ params, body, headers }) => {
				const productId = parseInt(params.id);
				const { quantity = 1 } = body;

				// 验证令牌
				const token = headers.authorization?.replace("Bearer ", "");
				validateToken(token);

				const product = products.find((p) => p.id === productId);
				if (!product) {
					throw new ResourceNotFoundError("商品不存在", { productId });
				}

				if (product.stock < quantity) {
					throw new OutOfStockError("库存不足", {
						productId,
						productName: product.name,
						requestedQuantity: quantity,
						availableStock: product.stock,
					});
				}

				// 模拟支付失败
				if (Math.random() < 0.3) {
					throw new PaymentFailedError("支付处理失败", {
						productId,
						amount: product.price * quantity,
						reason: "银行卡余额不足",
						suggestion: "请检查账户余额或更换支付方式",
					});
				}

				// 更新库存
				product.stock -= quantity;

				return {
					success: true,
					order: {
						id: Math.random().toString(36).substring(2, 15),
						productId,
						productName: product.name,
						quantity,
						unitPrice: product.price,
						totalAmount: product.price * quantity,
						purchasedAt: new Date().toISOString(),
					},
				};
			}),
	)

	// 错误演示 API
	.group("/demo", (app) =>
		app
			.get("/errors/:type", ({ params }) => {
				const { type } = params;

				switch (type) {
					case "auth":
						throw new InvalidTokenError("演示认证错误");
					case "permission":
						throw new PermissionDeniedError("演示权限错误", {
							requiredRole: "admin",
							currentRole: "user",
						});
					case "validation":
						throw new ValidationError("演示验证错误", {
							field: "email",
							constraint: "必须是有效的邮箱地址",
						});
					case "system":
						throw new ServiceUnavailableError("演示系统错误", {
							service: "database",
							retryAfter: 30,
						});
					case "custom":
						throw new PaymentFailedError("演示自定义错误", {
							paymentMethod: "credit_card",
							errorCode: "INSUFFICIENT_FUNDS",
						});
					case "unknown":
						throw new Error("这是一个未知错误，会被转换为 InternalError");
					default:
						throw new ValidationError("无效的错误类型", {
							field: "type",
							value: type,
							allowedValues: [
								"auth",
								"permission",
								"validation",
								"system",
								"custom",
								"unknown",
							],
						});
				}
			})

			.post("/validation", ({ body }) => {
				const errors = [];

				if (!body.name) {
					errors.push({ field: "name", message: "姓名不能为空" });
				}

				if (!body.email) {
					errors.push({ field: "email", message: "邮箱不能为空" });
				} else if (!body.email.includes("@")) {
					errors.push({ field: "email", message: "邮箱格式不正确" });
				}

				if (!body.age) {
					errors.push({ field: "age", message: "年龄不能为空" });
				} else if (body.age < 0 || body.age > 150) {
					errors.push({ field: "age", message: "年龄必须在 0-150 之间" });
				}

				if (errors.length > 0) {
					throw new ValidationError("表单验证失败", {
						errors,
						summary: `共 ${errors.length} 个字段验证失败`,
					});
				}

				return { success: true, message: "验证通过" };
			}),
	)

	.listen(3000);

console.log("🦊 Elysia 统一错误处理库示例服务器运行在 http://localhost:3000");
console.log("\n📖 使用指南:");
console.log("1. 访问 http://localhost:3000 查看所有可用端点");
console.log("2. 测试认证: POST /auth/login 使用 admin@example.com / admin123");
console.log("3. 测试错误: GET /demo/errors/auth 查看认证错误示例");
console.log("4. 测试购买: POST /products/1/purchase (需要 Bearer token)");
console.log("\n🔧 测试命令:");
console.log("curl http://localhost:3000");
console.log(
	'curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d \'{ "email": "admin@example.com", "password": "admin123" }\'',
);
console.log("curl http://localhost:3000/demo/errors/auth");
