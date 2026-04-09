"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAuthGuard() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("role")

    if (!role) {
      router.push("/login")
    }
  }, [])
}