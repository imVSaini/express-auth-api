import asyncHandler from '../utils/asyncHandler.js'
import { RolePermissions } from '../utils/RolePermissions.js'
import { AppError } from '../utils/AppError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { usersApi } from '../datasources/UsersApi.js'

const me = asyncHandler(async (req, res) => {
  if (!RolePermissions.hasAccess(req.user.role, 'subscriber')) {
    throw new AppError('You are not authorized to perform this action', 403)
  }

  const data = await usersApi.findById(req.user.id)
  return ApiResponse.success(res, data, `Hello, ${data.email}`)
})

export { me }
