"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { logout } from "@/services/auth"
import { useEffect, useState } from "react"
import { useSessionRefresh } from "@/hooks/useSessionRefresh"
export default function MenuPage() {
  const router = useRouter()
  useSessionRefresh()
  const [role, setRole] = useState<string | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

useEffect(() => {
  async function fetchUser() {
    try {
      const res = await fetch("/api/me")

      if (!res.ok) {
        setRole("user")
        localStorage.setItem("role", "user")
        return
      }

      const data = await res.json()
      setRole(data.role)
      localStorage.setItem("role", data.role)

    } catch {
      setRole("user")
      localStorage.setItem("role", "user")
    } finally {
      setLoadingUser(false)
    }
  }

  // ⚡ pega cache primeiro (instantâneo)
  const cachedRole = localStorage.getItem("role")

  if (cachedRole) {
    setRole(cachedRole)
    setLoadingUser(false)
  }

  // 🔄 sempre valida depois
  fetchUser()

}, [])

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" })
    await logout()

    router.push("/login")
  }

  return (
    <div className="bg-gray-900 text-white flex flex-col min-h-screen">

      {/* HEADER */}
      <div className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">

          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-base font-bold">Central Gourmet</h1>
              <p className="text-xs text-gray-400">Painel</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-sm font-semibold px-3 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            Sair
          </button>

        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 max-w-md mx-auto w-full p-4 flex flex-col overflow-y-auto">

        <div className="grid gap-4 mt-4">

          <Link href="/pdv" className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4">
            <span className="text-3xl">🧾</span>
            <div>
              <p className="text-lg font-bold">PDV</p>
              <p className="text-sm text-gray-400 group-hover:text-white">Realizar pedidos</p>
            </div>
          </Link>

          <Link href="/pedidos" className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4">
            <span className="text-3xl">👨‍🍳</span>
            <div>
              <p className="text-lg font-bold">Cozinha</p>
              <p className="text-sm text-gray-400 group-hover:text-white">Gerenciar pedidos</p>
            </div>
          </Link>

          <Link href="/display" className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4">
            <span className="text-3xl">📺</span>
            <div>
              <p className="text-lg font-bold">Display</p>
              <p className="text-sm text-gray-400 group-hover:text-white">Visualização</p>
            </div>
          </Link>
<Link href="/config-display" className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4">
  <span className="text-3xl">🖥️</span>
  <div>
    <p className="text-lg font-bold">Display Config</p>
    <p className="text-sm text-gray-400 group-hover:text-white">
      Ajustar painel
    </p>
  </div>
</Link>
          {/* 🔐 ADMIN SEGURO */}
          {loadingUser ? (
          <div className="bg-gray-800 p-6 rounded-2xl animate-pulse" />
        ) : role === "admin" && (
            <Link
              href="/admin"
              className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
            >
              <span className="text-3xl">⚙️</span>
              <div>
                <p className="text-lg font-bold">Admin</p>
                <p className="text-sm text-gray-400 group-hover:text-white">
                  Configurações
                </p>
              </div>
            </Link>
          )}

        </div>

      </div>

    </div>
  )
}