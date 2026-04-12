"use client"

import { useEffect } from "react"
import { fetchWithAuth } from "@/lib/fetchWithAuth"
import { auth } from "@/services/auth"

export default function Preload() {
  useEffect(() => {
    const user = auth.currentUser

    if (!user) return // 🔥 evita rodar em página pública

    Promise.all([
      fetchWithAuth("/api/pedidos"),
      fetchWithAuth("/api/produtos"),
      fetchWithAuth("/api/categorias"),
      fetchWithAuth("/api/admin/users"),
      fetchWithAuth("/api/me"),
    ]).catch(() => {})
  }, [])

  return null
}