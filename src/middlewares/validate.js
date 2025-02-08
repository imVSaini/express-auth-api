import { AppError } from '../utils/AppError.js'

/**
 * Validation middleware using Zod schema
 * @param {ZodSchema} schema - Zod validation schema to validate the request body.
 */
const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (err) {
    next(new AppError(`${err.errors.map((e) => e.message).join(', ')}`, 400))
  }
}

export { validate }
