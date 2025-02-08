import path from 'node:path'
import { config } from 'dotenv'
import jwt from 'jsonwebtoken'
import { AppError } from '../utils/AppError.js'
import { Blacklist } from '../utils/blacklist.js'
import rootDir from '../utils/rootdir.js'

config({ path: path.resolve(rootDir, '.env') })

class APIGateway {
  constructor() {
    this.cache = new Map()
    this.blacklist = new Blacklist()
    this.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
    this.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY
    this.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
    this.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY
  }

  authenticate = async (req, res, next) => {
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith('Bearer ') &&
        req.headers.authorization.split(' ')[1])

    if (!token) {
      throw new AppError('Access denied. No token provided.', 401)
    }

    if (this.blacklist.isBlacklisted(token)) {
      throw new AppError('Token is blacklisted. Please login again.', 401)
    }

    if (this.cache.has(token)) {
      const now = Date.now() / 1000
      const { user, exp } = this.cache.get(token)

      if (exp > now) {
        req.user = user
        return next()
      }
      this.cache.delete(token)
    }

    const decoded = await this.verifyToken(token, this.ACCESS_TOKEN_SECRET)
    this.cache.set(token, decoded)
    req.user = decoded.user
    return next()
  }

  signAccessToken = (user) => {
    try {
      return jwt.sign({ user }, this.ACCESS_TOKEN_SECRET, {
        expiresIn: this.ACCESS_TOKEN_EXPIRY,
        algorithm: 'HS256',
      })
    } catch {
      throw new AppError('Signing access token failed.', 401)
    }
  }

  signRefreshToken = (user) => {
    try {
      return jwt.sign({ user: { id: user.id } }, this.REFRESH_TOKEN_SECRET, {
        expiresIn: this.REFRESH_TOKEN_EXPIRY,
        algorithm: 'HS256',
      })
    } catch {
      throw new AppError('Signing refresh token failed.', 401)
    }
  }

  signToken = (user) => {
    const accessToken = this.signAccessToken(user)
    const refreshToken = this.signRefreshToken(user)
    return { accessToken, refreshToken }
  }

  verifyToken = (token, secret) => {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, (error, decoded) => {
        if (error) {
          reject(new AppError('Token verification failed.', 401))
        } else {
          resolve(decoded)
        }
      })
    })
  }

  blacklistToken(token) {
    this.blacklist.add(token)
    this.cache.delete(token)
  }
}

const gateway = new APIGateway()
export { gateway }
