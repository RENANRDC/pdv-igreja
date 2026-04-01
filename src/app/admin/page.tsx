"use client"

import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Admin</h1>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/admin/categorias">
          <div className="bg-gray-800 p-6 rounded-xl text-center text-lg font-semibold hover:bg-gray-700 transition cursor-pointer">
            Categorias
          </div>
        </Link>

        <Link href="/admin/produtos">
          <div className="bg-gray-800 p-6 rounded-xl text-center text-lg font-semibold hover:bg-gray-700 transition cursor-pointer">
            Produtos
          </div>
        </Link>

        <Link href="/admin/financeiro">
          <div className="bg-gray-800 p-6 rounded-xl text-center text-lg font-semibold hover:bg-gray-700 transition cursor-pointer">
            Financeiro
          </div>
        </Link>
      </div>
    </div>
  )
}