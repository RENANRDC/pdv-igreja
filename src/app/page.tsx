"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/services/auth"

export default function MenuPage() {

  const router = useRouter()
  const [role] = useState<string | null>(() => {
    if (typeof document === "undefined") return null

    const match = document.cookie
      .split("; ")
      .find(row => row.startsWith("role="))

    return match ? match.split("=")[1] : null
  })

  async function handleLogout() {
    await logout()
    localStorage.removeItem("role")
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* HEADER */}
      <div className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center justify-between p-4">

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

          <button
            onClick={handleLogout}
            className="flex items-center justify-center text-sm font-semibold px-3 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            Sair
          </button>

        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 max-w-md mx-auto w-full p-4">

        <div className="grid gap-4 mt-4">

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

      </div>

      {/* RODAPÉ FIXO */}
      <div className="text-center text-xs text-gray-500 pb-4">
        Desenvolvido por{" "}
        <span className="font-semibold text-gray-400">
          R2CodeX LTDA
        </span>
      </div>

    </div>
  )
}