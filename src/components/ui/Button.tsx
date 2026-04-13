"use client"

type Props = {
  children: React.ReactNode
  onClick?: () => void
}

export default function Button({ children, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        flex items-center justify-center
        px-3 h-9 rounded-lg text-sm font-semibold

        bg-gray-700 hover:bg-gray-600

        transition
      "
    >
      {children}
    </button>
  )
}