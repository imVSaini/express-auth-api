import http from 'node:http'
import path from 'node:path'
import { config } from 'dotenv'

import app from './app.js'
import router from './routes.js'
import formatError from './middlewares/formatError.js'
import logger from './lib/logger.js'

import rootDir from './utils/rootdir.js'
config({ path: path.resolve(rootDir, '.env') })

const PORT = process.env.PORT || 4000
const API_ENDPOINT = process.env.API_ENDPOINT || '/resource/api'

const url = new URL(
  process.env.NODE_ENV === 'production'
    ? `https://example.com${API_ENDPOINT}`
    : `http://localhost:${PORT}${API_ENDPOINT}`
).toString()

const server = http.createServer(app)

app.use(`${API_ENDPOINT}`, router)
app.use(formatError)

function startServer() {
  try {
    server.listen(PORT, () => {
      logger.info(`🚀 Server is running at ${url}`)
    })
  } catch (error) {
    logger.error(`❌ Server failed to start :: ${error}`)
    process.exit(1)
  }
}

startServer()
