"use client"

import Link from "next/link"
import BackButton from "@/components/BackButton"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

      {/* HEADER */}
      <div className="w-full max-w-sm flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          ⚙️ Admin
        </h1>

        <BackButton href="/" />
      </div>

      {/* MENU */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">

        <Link
          href="/admin/categorias"
          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          🗂️ Categorias
        </Link>

        <Link
          href="/admin/produtos"
          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          📦 Produtos
        </Link>

        <Link
          href="/admin/financeiro"
          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          💰 Financeiro
        </Link>

        <Link
          href="/admin/credenciais"
          className="bg-gray-800 hover:bg-gray-700 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          🔐 Credenciais
        </Link>

      </div>

      {/* FOOTER */}
      <p className="text-sm text-gray-400 mt-8 text-center">
        Gerencie categorias, produtos, vendas e configurações do sistema
      </p>

    </div>
  )
}