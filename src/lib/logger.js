import path from 'node:path'
import { config } from 'dotenv'
import { createLogger, format, transports } from 'winston'

// Load root directory utility
import rootDir from '../utils/rootdir.js'

// Load environment variables from .env file
config({ path: path.resolve(rootDir, '.env') })

// Destructure format utilities from Winston
const { combine, timestamp, label, colorize, json, simple } = format

/**
 * Determine the logging level based on the environment.
 * - Use 'debug' for development for detailed logging.
 * - Default to 'info' for production to reduce verbosity.
 */
const LOG_LEVEL = process.env.NODE_ENV === 'development' ? 'debug' : 'info'

/**
 * Create a Winston logger with:
 * - A custom label to identify the service or module.
 * - A timestamp for each log entry.
 * - JSON format for structured logging.
 * - Separate file transports for warning, error, and combined logs.
 * - Console logging for non-production environments with colored and simple formatting.
 */
const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(
    label({ label: 'user-service' }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    new transports.File({
      filename: path.join(rootDir, 'log', 'warning.log'),
      level: 'warn',
    }),
    new transports.File({
      filename: path.join(rootDir, 'log', 'error.log'),
      level: 'error',
    }),
    new transports.File({
      filename: path.join(rootDir, 'log', 'combined.log'),
    }),
  ],
})

/**
 * Stream interface for external loggers (e.g., HTTP request logging libraries).
 * Trims the message and logs it at the 'info' level.
 */
logger.stream = {
  write: (message) => {
    logger.info(message.trim())
  },
}

// Add console logging for development or staging environments
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: combine(colorize(), simple()),
    })
  )
}

export default logger
