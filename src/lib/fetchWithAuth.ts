import { auth } from "@/services/auth" // ✅ IMPORT CERTO

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
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

  return data
}