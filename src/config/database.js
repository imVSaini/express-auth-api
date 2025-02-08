import path from 'path'
import { config } from 'dotenv'

import rootDir from '../utils/rootdir.js'
config({ path: path.resolve(rootDir, '.env') })

export default {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.resolve(
        rootDir,
        '.tmp',
        process.env.DB_FILENAME || 'dev.sqlite.db'
      ),
    },
    migrations: {
      directory: path.resolve(rootDir, 'src', 'database', 'migrations'),
    },
    seeds: {
      directory: path.resolve(rootDir, 'src', 'database', 'seeds'),
    },
    useNullAsDefault: true,
  },

  production: {
    client: 'pg',
    connection: {
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.resolve(rootDir, 'src', 'database', 'migrations'),
    },
    seeds: {
      directory: path.resolve(rootDir, 'src', 'database', 'seeds'),
    },
  },
}
