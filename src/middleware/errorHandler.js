/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Redis-specific errors
  if (err.name === "ReplyError") {
    statusCode = 400;
    message = "Database Error: " + err.message;
  }

  // Validation errors from express-validator
  if (err.array && typeof err.array === "function") {
    statusCode = 400;
    message = "Validation Error";

    // Format validation errors
    const validationErrors = err.array().reduce((acc, error) => {
      acc[error.param] = error.msg;
      return acc;
    }, {});

    return res.status(statusCode).json({
      success: false,
      message,
      errors: validationErrors,
    });
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;
