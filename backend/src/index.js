import express      from 'express'
import cors         from 'cors'
import helmet       from 'helmet'
import morgan       from 'morgan'
import 'dotenv/config'
import { createServer } from 'http'

import router          from './routes/index.js'
import chatRoutes      from './routes/chat.routes.js'
import fileRoutes      from './routes/files.routes.js'
import reportRoutes    from './routes/reports.routes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { apiLimiter }   from './middleware/rateLimiter.js'
import logger           from './utils/logger.js'
import { initSocket }   from './config/socket.js'

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))
app.use(apiLimiter)

// ── Parsing ───────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logging ───────────────────────────────────────────────────────────────────
app.use(morgan('dev'))

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', router)
app.use('/api/chat', chatRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/reports', reportRoutes)

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler)

// ── HTTP Server + Socket.io ───────────────────────────────────────────────────
const httpServer = createServer(app)
const io         = initSocket(httpServer)

// Make io available to routes
app.use((req, res, next) => { req.io = io; next() })

httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export default app