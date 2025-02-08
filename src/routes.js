import express from 'express'
import { gateway } from './middlewares/gateway.js'
import { validate } from './middlewares/validate.js'
import {
  registerSchema,
  loginSchema,
  verificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './schemas/userSchema.js'
import {
  login,
  register,
  verifyUser,
  logout,
  renewToken,
  forgotPassword,
  resetPassword,
} from './controllers/users.js'
import { me } from './controllers/me.js'
// validate(userSchema)

const protect = gateway.authenticate
const router = express.Router()

// Route for getting user profile
router.get('/me', protect, me)

// Routes for handling authentication
router.post('/auth/login', validate(loginSchema), login)
router.post('/auth/register', validate(registerSchema), register)
router.post('/auth/verify-user', validate(verificationSchema), verifyUser)
router.post('/auth/logout', protect, logout)
router.post('/auth/refresh', renewToken)
router.post(
  '/auth/forgot-password',
  validate(forgotPasswordSchema),
  forgotPassword
)
router.post(
  '/auth/reset-password',
  validate(resetPasswordSchema),
  resetPassword
)

export default router
