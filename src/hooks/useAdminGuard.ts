"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type User = {
  role: "admin" | "user"
  username: string | null
}

// 🔥 cache global
let cachedUser: User | null = null

// ✅ limpar cache
export function clearUserCache() {
  cachedUser = null
}

// ✅ pegar cache
export function getCachedUser() {
  return cachedUser
}

// 🔥 ADICIONAR ISSO (ESSENCIAL)
export function setCachedUser(user: User) {
  cachedUser = user
}

export function useAdminGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(!cachedUser)

  useEffect(() => {
    async function check() {
      try {
        if (cachedUser) {
          if (cachedUser.role !== "admin") {
            router.replace("/login")
            return
          }

          setLoading(false)
          return
        }

        const res = await fetch("/api/me")

        if (!res.ok) {
          router.replace("/login")
          return
        }

        const data: User = await res.json()

        cachedUser = data

        if (data.role !== "admin") {
          router.replace("/login")
          return
        }

        setLoading(false)

      } catch {
        router.replace("/login")
      }
    }

    check()
  }, [router])

  return { loading }
}