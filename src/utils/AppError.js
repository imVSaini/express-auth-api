class AppError extends Error {
  /**
   * Creates a custom error with the given message, code, and HTTP status.
   * @param {string} message - The error message to display.
   * @param {number} status - The HTTP status code (default: 500).
   * @param {string} code - The custom error code (default: null).
   */
  constructor(
    message = 'Oops! Something went wrong!',
    statusCode,
    errorCode = null
  ) {
    super(message)
    this.message = message
    this.errorCode = errorCode
    this.statusCode = statusCode
    this.isOperational = true

    // Capture the stack trace, excluding the constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}

export { AppError }
