class ApiResponse {
  /**
   * Send a success response.
   * @param {Object} res - Express response object.
   * @param {Object|Array|null} data - Response data.
   * @param {string} message - Response message.
   * @param {number} statusCode - HTTP status code (default: 200).
   */
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    })
  }
}

export { ApiResponse }
