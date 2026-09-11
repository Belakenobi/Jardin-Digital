export function errorHandler(error, _request, response, _next) {
  console.error("Request failed:", {
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
  });

  const isClientError =
    Number.isInteger(error.status) &&
    error.status >= 400 &&
    error.status < 500;

  const statusCode = isClientError
    ? error.status
    : 500;

  const message = isClientError
    ? error.message
    : "Unexpected server error";

  return response.status(statusCode).json({
    status: "error",
    message,
  });
}
