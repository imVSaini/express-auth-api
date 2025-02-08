import path from 'path'
import { config } from 'dotenv'

import rootDir from '../utils/rootdir.js'
config({ path: path.resolve(rootDir, '.env') })

export default {
  production: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    secure: false,
  },
  development: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    secure: false,
  },
}
