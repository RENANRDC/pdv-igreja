"use client"

import Link from "next/link"

export default function BackButton() {
  return (
    <Link href="/admin">
      <button className="mb-4 bg-gray-800 px-4 py-2 rounded hover:bg-gray-700">
        ← Voltar
      </button>
    </Link>
  )
}