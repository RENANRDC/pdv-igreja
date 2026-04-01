"use client"

import Link from "next/link"

type Props = {
  href?: string
  label?: string
}

export default function BackButton({ href = "/", label = "Voltar" }: Props) {
  return (
    <Link href={href}>
      <button className="flex items-center justify-center text-sm font-semibold px-3 h-9 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
        ← {label}
      </button>
    </Link>
  )
}