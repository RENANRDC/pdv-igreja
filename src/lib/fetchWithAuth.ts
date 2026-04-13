import { auth } from "@/services/auth"
import { cache } from "@/lib/cache"
import { onAuthStateChanged, User } from "firebase/auth"

function getUser(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()

      if (user) resolve(user)
      else reject(new Error("Usuário não autenticado"))
    })
  })
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
) {
  // 🔥 cache GET
  if (!options.method || options.method === "GET") {
    if (cache[url]) {
      return cache[url]
    }
  }

  // 🔥 AGORA ESPERA O FIREBASE
  const user = await getUser()

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

  if (!options.method || options.method === "GET") {
    cache[url] = data
  }

  return data
}