import express from 'express'
// import rateLimit from 'express-rate-limit'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import morgan from 'morgan'
import logger from './lib/logger.js'

// const limiter = rateLimit({
//   max: 60,
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: {
//     status: 429,
//     message: 'Too many requests, please try again later.',
//   },
// })

const corsOptions = {
  origin: '<insert uri of front-end domain>',
  credentials: true,
}

const app = express()

// app.use(limiter)
app.use(morgan('combined', { stream: logger.stream }))
app.use(express.urlencoded({ extended: false, limit: '50kb' }))
app.use(cookieParser())
app.use(cors(corsOptions))
app.use(express.static('public'))
app.use(express.json({ limit: '50kb' }))

export default app
