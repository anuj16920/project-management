import rateLimit from 'express-rate-limit'

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 120,
  message: { success: false, message: 'Rate limit exceeded.' },
  standardHeaders: true,
  legacyHeaders: false,
})