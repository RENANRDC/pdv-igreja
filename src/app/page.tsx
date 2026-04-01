"use client"

import Link from "next/link"

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

      {/* HEADER */}
      <div className="w-full max-w-sm flex items-center justify-center mb-8">
        <h1 className="text-3xl font-bold">
          Central Gourmet
        </h1>
      </div>

      {/* MENU */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">

        <Link
          href="/pdv"
          className="bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-semibold text-lg transition flex items-center gap-3"
        >
          <span className="text-xl">🧾</span>
          <span>PDV</span>
        </Link>

        <Link
          href="/pedidos"
          className="bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-semibold text-lg transition flex items-center gap-3"
        >
          <span className="text-xl">🍳</span>
          <span>Cozinha</span>
        </Link>

        <Link
          href="/display"
          className="bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-semibold text-lg transition flex items-center gap-3"
        >
          <span className="text-xl">📺</span>
          <span>Display</span>
        </Link>

        <Link
          href="/admin"
          className="bg-gray-800 hover:bg-gray-700 p-5 rounded-2xl font-semibold text-lg transition flex items-center gap-3"
        >
          <span className="text-xl">⚙️</span>
          <span>Admin</span>
        </Link>

      </div>

      {/* FOOTER */}
      <p className="text-sm text-gray-400 mt-8 text-center max-w-xs">
        Sistema de pedidos e gerenciamento da praça de alimentação.
      </p>

    </div>
  )
}