import { BaseError } from "../types/base";
import { InternalError } from "../errors/system";

/**
 * 错误响应格式化函数
 */
export const formatErrorResponse = (error: BaseError) => {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      timestamp: error.timestamp,
      requestId: error.requestId,
      data: error.data,
    },
  };
};

/**
 * 统一的错误处理函数
 */
export const handleError = (error: unknown, requestId?: string): never => {
  // 如果已经是 BaseError，直接抛出
  if (error instanceof BaseError) {
    if (requestId && !error.requestId) {
      error.requestId = requestId;
    }
    throw error;
  }

  // 如果是标准 Error，转换为 InternalError
  if (error instanceof Error) {
    console.error("Unexpected error:", error);
    const internalError = new InternalError(error.message || "系统内部错误");
    if (requestId) {
      internalError.requestId = requestId;
    }
    throw internalError;
  }

  // 未知错误
  console.error("Unknown error:", error);
  const internalError = new InternalError("系统内部错误");
  if (requestId) {
    internalError.requestId = requestId;
  }
  throw internalError;
};