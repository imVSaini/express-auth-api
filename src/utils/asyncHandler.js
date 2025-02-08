/**
 * A higher-order function to handle asynchronous route handlers.
 * @param {Function} fn - The asynchronous function to handle.
 * @returns {Function} - A function that handles the request, response, and next middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
