"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export type User = {
  role: "admin" | "user"
  username: string | null
}

let cachedUser: User | null = null

export function clearUserCache() {
  cachedUser = null

  if (typeof window !== "undefined") {
    localStorage.removeItem("user")
  }
}

export function getCachedUser() {
  if (cachedUser) return cachedUser

  // 🔥 evita erro no SSR
  if (typeof window === "undefined") {
    return null
  }

  const stored = localStorage.getItem("user")

  if (stored) {
    cachedUser = JSON.parse(stored)
    return cachedUser
  }

  return null
}

export function setCachedUser(user: User) {
  cachedUser = user

  if (typeof window !== "undefined") {
    localStorage.setItem("user", JSON.stringify(user))
  }
}

export function useAdminGuard() {
  const router = useRouter()

  useEffect(() => {
    const user = getCachedUser()

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
      return
    }
  }, [router])
}