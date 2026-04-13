type CacheStore = Record<string, unknown>

export const cache: CacheStore = {}

// 🔥 carregar cache do localStorage ao iniciar
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("global-cache")
  if (stored) {
    try {
      Object.assign(cache, JSON.parse(stored))
    } catch {}
  }
}

// 🔥 salvar cache
export function persistCache() {
  if (typeof window !== "undefined") {
    localStorage.setItem("global-cache", JSON.stringify(cache))
  }
}

// 🔥 limpar tudo
export function clearCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key]
  })

  if (typeof window !== "undefined") {
    localStorage.removeItem("global-cache")
  }
}

// 🔥 limpar chave específica
export function clearCacheKey(key: string) {
  delete cache[key]

  if (typeof window !== "undefined") {
    persistCache()
  }
}