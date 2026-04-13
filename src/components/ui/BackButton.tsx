"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
  href?: string
  label?: string
}

export default function BackButton({ href = "/", label = "Voltar" }: Props) {
  return (
    <Link href={href}>
      <div className="
        flex items-center gap-2
        px-3 h-9 rounded-lg text-sm font-semibold

        bg-gray-700 hover:bg-gray-600

        transition
      ">
        <ArrowLeft size={16} />
        {label}
      </div>
    </Link>
  )
}