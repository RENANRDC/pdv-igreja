"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type User = {
  role: "admin" | "user"
  username: string | null
}

// 🔥 cache global
let cachedUser: User | null = null

// ✅ limpar cache (logout)
export function clearUserCache() {
  cachedUser = null
}

// ✅ pegar cache (usado no Menu)
export function getCachedUser() {
  return cachedUser
}

export function useAdminGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(!cachedUser)

  useEffect(() => {
    async function check() {
      try {
        // 🔥 usa cache
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