"use client"

import BackButton from "./ui/BackButton"

type Props = {
  title: string
  subtitle?: string
  backHref?: string
}

export default function Header({ title, subtitle, backHref = "/" }: Props) {
  return (
    <div className="w-full border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-md mx-auto flex items-center justify-between p-4">

        {/* ESQUERDA */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain" />

          <div>
            <h1 className="text-base font-bold">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>

        {/* DIREITA */}
        <BackButton href={backHref} />

      </div>
    </div>
  )
}