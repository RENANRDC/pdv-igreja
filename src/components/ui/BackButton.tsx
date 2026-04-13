"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

type Props = {
  href?: string
  label?: string
}

export default function BackButton({
  href = "/",
  label = "Voltar",
}: Props) {
  return (
    <Link href={href}>
      <div
        className="
          flex items-center gap-2

          px-4 py-2
          rounded-xl

          text-sm font-medium text-white

          bg-gray-700/80 hover:bg-gray-600

          shadow-md

          transition
        "
      >
        <ArrowLeft size={16} />
        {label}
      </div>
    </Link>
  )
}