type CacheStore = Record<string, unknown>

export const cache: CacheStore = {}

// 🔥 opcional (limpar tudo)
export function clearCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key]
  })
}

// 🔥 limpar rota específica
export function clearCacheKey(key: string) {
  delete cache[key]
}