"use client"

type Props = {
  children: React.ReactNode
  onClick?: () => void
}

export default function Button3D({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
      flex items-center justify-center gap-2 px-3 h-9 rounded-xl text-sm font-semibold

      bg-gradient-to-br from-gray-800 to-gray-900
      border border-gray-700

      shadow-[0_4px_15px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]

      hover:scale-[1.03]
      hover:shadow-[0_6px_20px_rgba(0,0,0,0.8)]

      transition-all duration-200
    "
    >
      {children}
    </button>
  )
}