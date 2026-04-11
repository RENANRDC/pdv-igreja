"use client"

import { useEffect } from "react"
import { getAuth } from "firebase/auth"

export function useSessionRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const auth = getAuth()
        const user = auth.currentUser

        if (!user) return

        const token = await user.getIdToken(true)

        await fetch("/api/refresh", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

      } catch (error) {
        console.error("Erro ao renovar sessão:", error)
      }
    }, 1000 * 60 * 30) // 🔥 muda pra 30 minutos

    return () => clearInterval(interval)
  }, [])
}