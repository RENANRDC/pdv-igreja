"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/services/auth"
import { useAuthGuard } from "@/hooks/useAuthGuard"

export default function MenuPage() {

  useAuthGuard()

  const router = useRouter()

  const [role] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("role")
    }
    return null
  })

  async function handleLogout() {
    await logout()
    localStorage.removeItem("role")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* HEADER */}
      <div className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">

          {/* LOGO + TEXTO */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 object-contain"
            />
            <div>
              <h1 className="text-base font-bold">
                Central Gourmet
              </h1>
              <p className="text-xs text-gray-400">
                Painel
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition"
          >
            Sair
          </button>

        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="max-w-md mx-auto p-4">

        <div className="grid gap-4 mt-4">

          {/* PDV */}
          <Link
            href="/pdv"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">🧾</span>
            <div>
              <p className="text-lg font-bold">PDV</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Realizar pedidos
              </p>
            </div>
          </Link>

          {/* COZINHA */}
          <Link
            href="/pedidos"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">👨‍🍳</span>
            <div>
              <p className="text-lg font-bold">Cozinha</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Gerenciar pedidos
              </p>
            </div>
          </Link>

          {/* DISPLAY */}
          <Link
            href="/display"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">📺</span>
            <div>
              <p className="text-lg font-bold">Display</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Visualização
              </p>
            </div>
          </Link>

          {/* ADMIN */}
          {role === "admin" && (
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

        {/* FOOTER */}
        <p className="text-xs text-gray-500 text-center mt-8">
          Sistema de gerenciamento da praça de alimentação
        </p>

      </div>

    </div>
  )
}