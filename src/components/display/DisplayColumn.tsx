"use client"

import { RefObject } from "react"

type Pedido = {
  id: string
  codigo: string
}

type Props = {
  title: string
  color: "yellow" | "green"
  pedidos: Pedido[]
  highlightId?: string | null
  scroll?: boolean
  containerRef?: RefObject<HTMLDivElement>
  contentRef?: RefObject<HTMLDivElement>
}

export default function DisplayColumn({
  title,
  color,
  pedidos,
  highlightId,
  scroll,
  containerRef,
  contentRef
}: Props) {

  const bg =
    color === "yellow"
      ? "bg-yellow-400 text-black"
      : "bg-green-500 text-white"

  const titleColor =
    color === "yellow" ? "text-yellow-400" : "text-green-400"

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col overflow-hidden">

      <h2 className={`text-2xl font-bold mb-4 text-center ${titleColor}`}>
        {title}
      </h2>

      <div ref={containerRef} className="flex-1 overflow-hidden">
        <div
          ref={contentRef}
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
            scroll ? "animate-scroll" : ""
          }`}
        >
          {pedidos.map((pedido) => {
            const isHighlight = pedido.id === highlightId

            return (
              <div
                key={pedido.id}
                className={`rounded-xl p-4 flex items-center justify-center ${
                  isHighlight && color === "green"
                    ? "animate-blink-green"
                    : bg
                }`}
              >
                <span className="text-4xl lg:text-5xl font-bold">
                  {pedido.codigo}
                </span>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}