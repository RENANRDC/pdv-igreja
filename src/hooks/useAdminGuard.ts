"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function useAdminGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/me")

        if (!res.ok) {
          router.replace("/login")
          return
        }

        const data = await res.json()

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