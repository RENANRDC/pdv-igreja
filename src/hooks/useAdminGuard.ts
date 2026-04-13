"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export type User = {
  role: "admin" | "user"
  username: string | null
}

// 🔥 cache global
let cachedUser: User | null = null

export function clearUserCache() {
  cachedUser = null
}

export function getCachedUser() {
  return cachedUser
}

export function setCachedUser(user: User) {
  cachedUser = user
}

export function useAdminGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const user = cachedUser

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
      return
    }

    setLoading(false)
  }, [router])

  return { loading }
}