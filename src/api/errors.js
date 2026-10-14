export class ApiError extends Error {
  constructor({ status = 0, code = "UNKNOWN", message = "Có lỗi xảy ra.", traceId = null, errors = [], cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.traceId = traceId;
    this.errors = Array.isArray(errors) ? errors : [];
    if (cause) this.cause = cause;
  }

  get isNetwork() {
    return this.status === 0;
  }

  get isUnauthorized() {
    return this.status === 401;
  }

  get isNotFound() {
    return this.status === 404;
  }

  fieldErrors() {
    const out = {};
    for (const e of this.errors) if (e?.field && !(e.field in out)) out[e.field] = e.message;
    return out;
  }
}

const MESSAGE_BY_STATUS = {
  400: "Dữ liệu gửi lên không hợp lệ.",
  401: "Bạn cần đăng nhập để tiếp tục.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu.",
  409: "Dữ liệu đã thay đổi hoặc xung đột. Tải lại và thử lại.",
  410: "Liên kết đã hết hạn.",
  413: "Tệp quá lớn.",
  422: "Yêu cầu không xử lý được.",
  429: "Bạn thao tác quá nhanh. Thử lại sau ít phút.",
  500: "Máy chủ gặp lỗi. Thử lại sau.",
  502: "Máy chủ không phản hồi. Thử lại sau.",
  503: "Hệ thống đang bảo trì. Thử lại sau.",
  504: "Máy chủ phản hồi quá lâu. Thử lại sau.",
};

const CODE_BY_STATUS = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  410: "GONE",
  413: "FILE_TOO_LARGE",
  422: "UNPROCESSABLE",
  429: "RATE_LIMITED",
};

export function normalizeError(error) {
  if (error instanceof ApiError) return error;

  const response = error?.response;
  if (!response) {
    if (error?.code === "ERR_CANCELED") {
      return new ApiError({ status: 0, code: "CANCELED", message: "Yêu cầu đã bị hủy.", cause: error });
    }
    const timedOut = error?.code === "ECONNABORTED" || error?.code === "ETIMEDOUT";
    const isAxios = Boolean(error?.isAxiosError || error?.config);
    return new ApiError({
      status: 0,
      code: timedOut ? "TIMEOUT" : isAxios ? "NETWORK" : "UNKNOWN",
      message: timedOut
        ? "Máy chủ phản hồi quá lâu. Thử lại."
        : isAxios
          ? "Không kết nối được máy chủ. Kiểm tra mạng."
          : error?.message || "Có lỗi xảy ra.",
      cause: error,
    });
  }

  const status = response.status;
  const body = response.data && typeof response.data === "object" ? response.data : {};
  const fallback = MESSAGE_BY_STATUS[status] || (status >= 500 ? MESSAGE_BY_STATUS[500] : `Lỗi ${status}.`);
  return new ApiError({
    status,
    code: body.code || CODE_BY_STATUS[status] || (status >= 500 ? "SERVER_ERROR" : "HTTP_ERROR"),
    message: body.detail || body.message || fallback,
    traceId: body.traceId || response.headers?.["x-request-id"] || null,
    errors: body.errors,
    cause: error,
  });
}
