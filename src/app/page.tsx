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
import { clearVendaMode } from "@/hooks/useVendaMode"
import {
  Receipt,
  ChefHat,
  Monitor,
  Settings,
  Tv
} from "lucide-react"

export default function MenuPage() {
  const router = useRouter()
  useSessionRefresh()

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const cached = getCachedUser()

    Promise.resolve().then(() => {
      setUser(cached || { role: "user", username: null })
    })
  }, [])

  if (!user) return null

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })

    clearUserCache()
    clearVendaMode()

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
      <div className="flex-1 max-w-md mx-auto w-full p-6">

        <div className="grid gap-4 mt-4">

          {/* CARD */}
          <Link href="/pdv" className="group flex items-center gap-4 p-5 rounded-2xl 
            bg-gradient-to-br from-gray-800 to-gray-900
            border border-gray-700
            shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl 
              bg-gradient-to-br from-gray-700 to-gray-800
              flex items-center justify-center
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
              <Receipt size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">PDV</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Realizar pedidos
              </p>
            </div>
          </Link>

          {/* COZINHA */}
          <Link href="/pedidos" className="group flex items-center gap-4 p-5 rounded-2xl 
            bg-gradient-to-br from-gray-800 to-gray-900
            border border-gray-700
            shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl 
              bg-gradient-to-br from-gray-700 to-gray-800
              flex items-center justify-center
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
              <ChefHat size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Cozinha</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Gerenciar pedidos
              </p>
            </div>
          </Link>

          {/* DISPLAY */}
          <Link href="/client/display" className="group flex items-center gap-4 p-5 rounded-2xl 
            bg-gradient-to-br from-gray-800 to-gray-900
            border border-gray-700
            shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl 
              bg-gradient-to-br from-gray-700 to-gray-800
              flex items-center justify-center
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
              <Tv size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Display</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Visualização
              </p>
            </div>
          </Link>

          {/* CONFIG DISPLAY */}
          <Link href="/config-display" className="group flex items-center gap-4 p-5 rounded-2xl 
            bg-gradient-to-br from-gray-800 to-gray-900
            border border-gray-700
            shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
            hover:scale-[1.02]
            hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]
            transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl 
              bg-gradient-to-br from-gray-700 to-gray-800
              flex items-center justify-center
              shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
              <Monitor size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Display Config</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Ajustar painel
              </p>
            </div>
          </Link>

          {/* ADMIN */}
          {user?.role === "admin" && (
            <Link href="/admin" className="group flex items-center gap-4 p-5 rounded-2xl 
              bg-gradient-to-br from-gray-800 to-gray-900
              border border-gray-700
              shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]
              hover:scale-[1.02]
              hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]
              transition-all duration-200"
            >
              <div className="w-12 h-12 rounded-xl 
                bg-gradient-to-br from-gray-700 to-gray-800
                flex items-center justify-center
                shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]">
                <Settings size={22} />
              </div>

              <div>
                <p className="text-lg font-semibold">Admin</p>
                <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
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