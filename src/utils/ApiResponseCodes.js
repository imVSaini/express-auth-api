class ApiResponseCodes {
  constructor() {
    this.message = null
  }

  /**
   * Returns the message corresponding to the given error code.
   * @param {number} code - The error code.
   * @returns {string} The message corresponding to the error code.
   */
  static getCode(code) {
    switch (code) {
      case 400:
        this.message = 'BAD REQUEST'
        break
      case 401:
        this.message = 'UNAUTHORIZED'
        break
      case 403:
        this.message = 'FORBIDDEN'
        break
      case 404:
        this.message = 'NOT FOUND'
        break
      case 406:
        this.message = 'NOT ACCEPTABLE'
        break
      case 429:
        this.message = 'TOO MANY REQUESTS'
        break
      case 500:
        this.message = 'INTERNAL SERVER ERROR'
        break
      case 501:
        this.message = 'NOT IMPLEMENTED'
        break
      case 502:
        this.message = 'BAD GATEWAY'
        break
      case 503:
        this.message = 'SERVICE UNAVAILABLE'
        break
      case 504:
        this.message = 'GATEWAY TIMEOUT'
        break
      default:
        this.message = 'UNKNOWN ERROR'
        break
    }

    return this.message
  }
}

export { ApiResponseCodes }
