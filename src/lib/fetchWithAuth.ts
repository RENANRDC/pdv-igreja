import { auth } from "@/services/auth"
import { cache } from "@/lib/cache"

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  // 🔥 usa cache apenas para GET
  if (!options.method || options.method === "GET") {
    if (cache[url]) {
      return cache[url]
    }
  }

  const user = auth.currentUser

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const token = await user.getIdToken()

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || "Erro na requisição")
  }

  // 🔥 salva no cache (GET only)
  if (!options.method || options.method === "GET") {
    cache[url] = data
  }

  return data
}