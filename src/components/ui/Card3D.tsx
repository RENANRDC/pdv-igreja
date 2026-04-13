import { ReactNode } from "react"
import Link from "next/link"

type Props = {
  href?: string
  icon: ReactNode
  title: string
  description?: string
  onClick?: () => void
}

export default function Card3D({
  href,
  icon,
  title,
  description,
  onClick
}: Props) {

  const content = (
    <div
      onClick={onClick}
      className="
      group flex items-center gap-4 p-5 rounded-2xl

      bg-gradient-to-br from-gray-800 to-gray-900
      border border-gray-700

      shadow-[0_6px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)]

      hover:scale-[1.02]
      hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)]

      transition-all duration-200 cursor-pointer
    "
    >

      <div className="
        w-12 h-12 rounded-xl
        bg-gradient-to-br from-gray-700 to-gray-800
        flex items-center justify-center
        shadow-[inset_0_1px_2px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.6)]
      ">
        {icon}
      </div>

      <div>
        <p className="text-lg font-semibold text-white">
          {title}
        </p>

        {description && (
          <p className="text-sm text-gray-400 group-hover:text-gray-200 transition">
            {description}
          </p>
        )}
      </div>

    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}