"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSessionRefresh } from "@/hooks/useSessionRefresh"
import {
  clearUserCache,
  getCachedUser,
  User,
} from "@/hooks/useAdminGuard"

export default function MenuPage() {
  const router = useRouter()
  useSessionRefresh()

  // 🔥 usa cache imediatamente
  const [user, setUser] = useState<User | null>(() => getCachedUser())
  const [loadingUser, setLoadingUser] = useState(!getCachedUser())

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me")

        if (!res.ok) {
          setUser({ role: "user", username: null })
          return
        }

        const data: User = await res.json()

        setUser(data)

      } catch {
        setUser({ role: "user", username: null })
      } finally {
        setLoadingUser(false)
      }
    }

    // 🔥 só chama API se NÃO tiver cache
    if (!user) {
      fetchUser()
    } else {
      setLoadingUser(false)
    }
  }, [])

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" })

    clearUserCache() // 🔥 limpa cache global

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
      <div className="flex-1 max-w-md mx-auto w-full p-4 pb-6">

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

          {/* 🔥 ADMIN SEM DELAY */}
          {user?.role === "admin" && (
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