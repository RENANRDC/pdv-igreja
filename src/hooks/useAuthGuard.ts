"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export function useAuthGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        // 🔓 rotas públicas
        if (
          pathname.startsWith("/login") ||
          pathname.startsWith("/client")
        ) {
          setLoading(false)
          return
        }

        const res = await fetch("/api/me")

        if (!res.ok) {
          router.replace("/login")
          return
        }

        setLoading(false)
      } catch {
        router.replace("/login")
      }
    }

    check()
  }, [router, pathname])

  return { loading }
}