import crypto from 'node:crypto'
import bcrypt from 'bcrypt'
import { sendEmail } from '../mailer/sender.js'
import { RateLimiter } from '../utils/RateLimiter.js'
import asyncHandler from '../utils/asyncHandler.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { AppError } from '../utils/AppError.js'
import { gateway } from '../middlewares/gateway.js'
import { usersApi } from '../datasources/UsersApi.js'
import { rolesApi } from '../datasources/RolesApi.js'
import { otpApi } from '../datasources/OtpApi.js'
import { sessionsApi } from '../datasources/sessionsApi.js'
import { passwordResetTokensApi } from '../datasources/PasswordResetTokensApi.js'

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body

  const user = await usersApi.findByEmailOrUsername(username)

  if (!user || !user.isVerified) {
    throw new AppError('Invalid email or password', 401)
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password)

  if (!isPasswordMatch) {
    throw new AppError('Invalid credentials', 401)
  }

  const { password: _, ...sanitizedUser } = user // eslint-disable-line no-unused-vars
  const { role } = await rolesApi.findByUserId(user.id)

  const payload = {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    role,
  }

  const token = gateway.signToken(payload)

  await sessionsApi.findByUserIdAndUpsert({
    userId: user.id,
    refreshToken: token.refreshToken,
  })

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  }

  res.cookie('accessToken', token.accessToken, cookieOptions)
  res.cookie('refreshToken', token.refreshToken, cookieOptions)

  return ApiResponse.success(
    res,
    { user: sanitizedUser, token },
    'Login successful'
  )
})

const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Generate OTP and expiration
  const otp = crypto.randomInt(100000, 999999).toString()
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

  const existingUser = await usersApi.findByEmail(email)

  if (existingUser) {
    await otpApi.findByUserIdAndUpdate({
      userId: existingUser.id,
      otp,
      otpExpiresAt,
    })

    // Send OTP via email for exitsing user
    await sendEmail({
      to: email,
      subject: 'OTP for registration',
      html: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
    })

    return ApiResponse.success(res, existingUser, 'OTP sent to user email')
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await usersApi.create({
    email,
    password: hashedPassword,
  })

  await rolesApi.create({
    userId: newUser.id,
  })

  await otpApi.create({
    userId: newUser.id,
    otp,
    otpExpiresAt,
  })

  // Send OTP via email for new user
  await sendEmail({
    to: email,
    subject: 'OTP for registration',
    html: `Your OTP code is ${otp}. It will expire in 10 minutes.`,
  })

  return ApiResponse.success(res, newUser, 'Registration successful')
})

const verifyUser = asyncHandler(async (req, res) => {
  const { email, otp } = req.body

  const user = await usersApi.findByEmail(email)

  if (!user) {
    throw new AppError('User not found', 401)
  }

  const otpRecord = await otpApi.findByUserId(user.id)

  if (!otpRecord) {
    throw new AppError('OTP not found', 404)
  }

  if (otpRecord.otp !== otp || otpRecord.otpExpiresAt < new Date()) {
    throw new AppError('Invalid or expired OTP', 403)
  }

  await otpApi.removeByUserId(user.id)
  const verifiedUser = await usersApi.verifyById(user.id)

  return ApiResponse.success(res, verifiedUser, 'User verified')
})

const logout = asyncHandler(async (req, res) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.split(' ')[1]

  if (!token) {
    throw new AppError('Invalid cookie or authorization header', 401)
  }

  await sessionsApi.removeByUserId(req.user.id)
  gateway.blacklistToken(token)

  // Clear cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  }

  res.clearCookie('accessToken', cookieOptions)
  res.clearCookie('refreshToken', cookieOptions)

  return ApiResponse.success(res, null, 'Logout successful')
})

const renewToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
  const token = req.cookies?.refreshToken || refreshToken

  if (!token) {
    throw new AppError('Invalid token', 401)
  }

  const decoded = await gateway.verifyToken(token, REFRESH_TOKEN_SECRET)
  const session = await sessionsApi.findByUserId(decoded.user.id)

  if (!session || session.refreshToken !== token) {
    throw new AppError('Invalid session or token', 401)
  }

  const user = await usersApi.findById(decoded.user.id)
  const { role } = await rolesApi.findByUserId(decoded.user.id)

  const payload = {
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    role,
  }

  const newToken = gateway.signToken(payload)

  await sessionsApi.update({
    userId: user.id,
    refreshToken: newToken.refreshToken,
  })

  // Set secure cookies
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  }

  res.cookie('accessToken', newToken.accessToken, cookieOptions)
  res.cookie('refreshToken', newToken.refreshToken, cookieOptions)

  return ApiResponse.success(res, { token: newToken }, 'Token renewed')
})

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await usersApi.findByEmail(email)

  if (!user || !user.isVerified) {
    throw new AppError('Invalid email', 401)
  }

  const token = crypto.randomBytes(32).toString('hex')
  const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')
  const tokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000)

  await passwordResetTokensApi.upsert({
    userId: user.id,
    token: encryptedToken,
    expiresAt: tokenExpiresAt,
  })

  // Send reset email
  const resetLink = `https://yourfrontend.com/reset-password?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request',
    html: `Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.`,
  })

  return ApiResponse.success(
    res,
    { token: token, expiresAt: tokenExpiresAt },
    'Forget password token generated'
  )
})

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body

  // Rate limiter (5 requests per 10 minutes per IP)
  const key = `resetPassword:${req.ip}`
  const isAllowed = RateLimiter.isAllowed(key, 5, 10 * 60 * 1000)

  if (!isAllowed) {
    throw new AppError('Too many requests', 429)
  }

  // Encrypt token
  const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')

  const resetTokenRecord = await passwordResetTokensApi.findOne({
    token: encryptedToken,
  })

  if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
    throw new AppError('Invalid or expired token', 401)
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10)

  const user = await usersApi.update(resetTokenRecord.userId, {
    password: hashedPassword,
  })

  await passwordResetTokensApi.removeByUserId(resetTokenRecord.userId)

  await sendEmail({
    to: user.email,
    subject: 'Password reset successful',
    html: 'Your password has been reset successfully.',
  })

  return ApiResponse.success(res, null, 'Password reset successful')
})

export {
  login,
  register,
  verifyUser,
  logout,
  renewToken,
  forgotPassword,
  resetPassword,
}
