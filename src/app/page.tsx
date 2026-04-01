"use client"

import Link from "next/link"

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

      <h1 className="text-3xl font-bold mb-8">
        🍔 Sistema PDV
      </h1>

      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">

        <Link
          href="/pdv"
          className="bg-blue-600 hover:bg-blue-500 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          🧾 PDV
        </Link>

        <Link
          href="/pedidos"
          className="bg-yellow-500 hover:bg-yellow-400 text-black p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          🍳 Cozinha
        </Link>

        <Link
          href="/display"
          className="bg-green-600 hover:bg-green-500 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          📺 Display
        </Link>

        {/* 🔥 NOVO BOTÃO ADMIN */}
        <Link
          href="/admin"
          className="bg-purple-600 hover:bg-purple-500 p-4 rounded-xl text-center font-semibold text-lg transition"
        >
          ⚙️ Admin
        </Link>

      </div>

      <p className="text-sm text-gray-400 mt-8">
        Escolha uma opção para iniciar
      </p>

    </div>
  )
}