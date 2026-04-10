type RateLimitConfig = {
  windowMs: number
  max: number
  blockDurationMs?: number
}

type Entry = {
  count: number
  firstRequest: number
  blockedUntil?: number
}

const store = new Map<string, Entry>()

const configs: Record<string, RateLimitConfig> = {
  login: {
    windowMs: 60 * 1000, // 1 min
    max: 5,
    blockDurationMs: 2 * 60 * 1000 // 2 min bloqueio
  },
  admin: {
    windowMs: 60 * 1000,
    max: 10,
    blockDurationMs: 2 * 60 * 1000
  },
  default: {
    windowMs: 60 * 1000,
    max: 30,
    blockDurationMs: 60 * 1000
  }
}

export function checkRateLimit(ip: string, action: keyof typeof configs) {
  const now = Date.now()
  const key = `${ip}:${action}`
  const config = configs[action] || configs.default

  const entry = store.get(key)

  if (!entry) {
    store.set(key, {
      count: 1,
      firstRequest: now
    })
    return { success: true }
  }

  // 🔒 Se estiver bloqueado
  if (entry.blockedUntil && now < entry.blockedUntil) {
    return {
      success: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
    }
  }

  // 🔄 Reset janela
  if (now - entry.firstRequest > config.windowMs) {
    entry.count = 1
    entry.firstRequest = now
    entry.blockedUntil = undefined
    store.set(key, entry)
    return { success: true }
  }

  entry.count++

  // 🚫 Excedeu limite
  if (entry.count > config.max) {
    entry.blockedUntil = now + (config.blockDurationMs || 60000)
    store.set(key, entry)

    return {
      success: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
    }
  }

  store.set(key, entry)
  return { success: true }
}