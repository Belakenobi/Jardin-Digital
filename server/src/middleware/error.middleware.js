export function errorHandler(error, _request, response, _next) {
  console.error("Request failed:", {
    name: error.name,
    message: error.message,
    status: error.status,
    statusCode: error.statusCode,
    code: error.code,
  });

  const errorStatus =
    error.statusCode ?? error.status;

  const isClientError =
    Number.isInteger(errorStatus) &&
    errorStatus >= 400 &&
    errorStatus < 500;

  const statusCode = isClientError
    ? errorStatus
    : 500;

  const message = isClientError
    ? error.message
    : "Unexpected server error";

  return response.status(statusCode).json({
    status: "error",
    message,
  });
}
