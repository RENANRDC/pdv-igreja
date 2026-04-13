"use client"

import Link from "next/link"
import BackButton from "@/components/BackButton"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCachedUser } from "@/hooks/useAdminGuard"
import {
  Folder,
  Package,
  DollarSign,
  Lock
} from "lucide-react"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getCachedUser()

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
      return
    }
  }, [])

  return (
    <div className="bg-gray-900 text-white flex flex-col min-h-[calc(100vh-56px)]">

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
                Painel Admin
              </h1>
              <p className="text-xs text-gray-400">
                Configurações do sistema
              </p>
            </div>
          </div>

          <BackButton href="/" />
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-1 min-h-0 max-w-md mx-auto w-full p-6">

        <div className="grid gap-4 mt-4">

          {/* CATEGORIAS */}
          <Link
            href="/admin/categorias"
            className="group flex items-center gap-4 p-5 rounded-2xl 
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
              <Folder size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Categorias</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Gerenciar categorias
              </p>
            </div>
          </Link>

          {/* PRODUTOS */}
          <Link
            href="/admin/produtos"
            className="group flex items-center gap-4 p-5 rounded-2xl 
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
              <Package size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Produtos</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Gerenciar produtos
              </p>
            </div>
          </Link>

          {/* FINANCEIRO */}
          <Link
            href="/admin/financeiro"
            className="group flex items-center gap-4 p-5 rounded-2xl 
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
              <DollarSign size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Financeiro</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Relatórios e vendas
              </p>
            </div>
          </Link>

          {/* CREDENCIAIS */}
          <Link
            href="/admin/credenciais"
            onMouseEnter={() => fetch("/api/admin/users")}
            onTouchStart={() => fetch("/api/admin/users")}
            className="group flex items-center gap-4 p-5 rounded-2xl 
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
              <Lock size={22} />
            </div>

            <div>
              <p className="text-lg font-semibold">Credenciais</p>
              <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
                Alterar acesso
              </p>
            </div>
          </Link>

        </div>

      </div>

    </div>
  )
}