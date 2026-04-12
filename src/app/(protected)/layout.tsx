"use client"

import { useEffect } from "react"
import { fetchWithAuth } from "@/lib/fetchWithAuth"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // 🔥 preload só para páginas protegidas
    Promise.all([
      fetchWithAuth("/api/pedidos"),
      fetchWithAuth("/api/produtos"),
      fetchWithAuth("/api/categorias"),
      fetchWithAuth("/api/admin/users"),
      fetchWithAuth("/api/me"),
    ]).catch(() => {})
  }, [])

  return <>{children}</>
}