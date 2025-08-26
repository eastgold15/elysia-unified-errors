import { BaseError, HttpStatusCode } from "../../types/base";

/**
 * 内部错误
 */
export class InternalError extends BaseError {
  constructor(message = "系统内部错误", data?: any) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", data);
  }
}

/**
 * 网络错误
 */
export class NetworkError extends BaseError {
  constructor(message = "网络连接错误", data?: any) {
    super(message, HttpStatusCode.BAD_GATEWAY, "NETWORK_ERROR", data);
  }
}

/**
 * 超时错误
 */
export class TimeoutError extends BaseError {
  constructor(message = "请求超时", data?: any) {
    super(message, HttpStatusCode.GATEWAY_TIMEOUT, "TIMEOUT_ERROR", data);
  }
}

/**
 * 服务不可用错误
 */
export class ServiceUnavailableError extends BaseError {
  constructor(message = "服务不可用", data?: any) {
    super(message, HttpStatusCode.SERVICE_UNAVAILABLE, "SERVICE_UNAVAILABLE", data);
  }
}

/**
 * 配置错误
 */
export class ConfigurationError extends BaseError {
  constructor(message = "配置错误", data?: any) {
    super(message, HttpStatusCode.INTERNAL_SERVER_ERROR, "CONFIGURATION_ERROR", data);
  }
}