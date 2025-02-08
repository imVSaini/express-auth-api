import path from 'path'
import { config } from 'dotenv'
import knex from 'knex'
import dbConfig from '../config/database.js'
import logger from '../lib/logger.js'
import rootDir from '../utils/rootdir.js'

config({ path: path.resolve(rootDir, '.env') })

const env = process.env.NODE_ENV || 'production'

let knexInstance

try {
  knexInstance = knex(dbConfig[env])
} catch (error) {
  logger.error('Failed to establish database connection:', error)
  process.exit(1)
}

export default knexInstance
