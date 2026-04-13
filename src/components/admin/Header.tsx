"use client"

import BackButton from "@/components/ui/BackButton"

type Props = {
  title: string
  subtitle?: string
}

export default function AdminHeader({ title, subtitle }: Props) {
  return (
    <div className="flex items-center justify-between mb-6">

      {/* ESQUERDA */}
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-400">{subtitle}</p>
        )}
      </div>

      {/* DIREITA */}
      <BackButton href="/admin" />

    </div>
  )
}