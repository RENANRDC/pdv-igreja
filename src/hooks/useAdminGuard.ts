"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function useAdminGuard() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("role")

    if (role !== "admin") {
      router.push("/")
    }
  }, [])
}