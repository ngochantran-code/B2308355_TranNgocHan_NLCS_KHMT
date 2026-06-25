export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Lỗi hệ thống",
  statusCode = 500,
  error = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error?.message || error,
  });
};