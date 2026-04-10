"use client"

import Link from "next/link"

import BackButton from "@/components/BackButton"

export default function AdminPage() {

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
      <div className="flex-1 max-w-md mx-auto w-full p-4">

        <div className="grid gap-4 mt-4">

          <Link
            href="/admin/categorias"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">🗂️</span>
            <div>
              <p className="text-lg font-bold">Categorias</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Gerenciar categorias
              </p>
            </div>
          </Link>

          <Link
            href="/admin/produtos"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">📦</span>
            <div>
              <p className="text-lg font-bold">Produtos</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Gerenciar produtos
              </p>
            </div>
          </Link>

          <Link
            href="/admin/financeiro"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">💰</span>
            <div>
              <p className="text-lg font-bold">Financeiro</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Relatórios e vendas
              </p>
            </div>
          </Link>

          <Link
            href="/admin/credenciais"
            className="group bg-gray-800 hover:bg-green-600 hover:scale-[1.02] transition-all duration-200 p-6 rounded-2xl shadow flex items-center gap-4"
          >
            <span className="text-3xl">🔐</span>
            <div>
              <p className="text-lg font-bold">Credenciais</p>
              <p className="text-sm text-gray-400 group-hover:text-white">
                Alterar acesso
              </p>
            </div>
          </Link>

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