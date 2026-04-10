"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore"
import { db } from "@/services/firebase"

type Pedido = {
  id: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
}

export default function DisplayPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [audioLiberado, setAudioLiberado] = useState(false)

  const statusAnterior = useRef<Record<string, string>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioLiberadoRef = useRef(false)

  const preparoRef = useRef<HTMLDivElement>(null)
  const prontoRef = useRef<HTMLDivElement>(null)

  // 🔊 áudio
  useEffect(() => {
    const audio = new Audio("/sounds/pronto.wav")
    audio.volume = 1
    audioRef.current = audio
  }, [])

  function ativarAlerta(id: string) {
    setHighlightId(id)

    setTimeout(() => setHighlightId(null), 4000)

    if (audioRef.current && audioLiberadoRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  // 🔥 realtime
  useEffect(() => {
    const q = query(
      collection(db, "pedidos"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Pedido[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Pedido, "id">),
      }))

      lista.forEach((pedido) => {
        const anterior = statusAnterior.current[pedido.id]

        if (
          anterior &&
          anterior !== "finalizado" &&
          pedido.status === "finalizado"
        ) {
          ativarAlerta(pedido.id)
        }

        statusAnterior.current[pedido.id] = pedido.status
      })

      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

  const emPreparo = pedidos.filter(
  (p) => p.status === "pendente" || p.status === "em_preparo"
)
  const prontos = pedidos.filter((p) => p.status === "finalizado")

  // 🚀 SCROLL PROFISSIONAL (SEM BUG)
  useEffect(() => {
    let frame: number
    const speed = 0.4

    function scroll(el: HTMLDivElement | null) {
      if (!el) return

      const maxScroll = el.scrollHeight - el.clientHeight

      if (maxScroll <= 0) return

      el.scrollTop += speed

      if (el.scrollTop >= maxScroll) {
        el.scrollTop = 0
      }
    }

    function loop() {
      scroll(preparoRef.current)
      scroll(prontoRef.current)
      frame = requestAnimationFrame(loop)
    }

    loop()

    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">

      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10" />
          <div>
            <h1 className="font-bold">Central Gourmet</h1>
            <p className="text-xs text-gray-400">Display</p>
          </div>
        </div>

        <div className="text-sm text-gray-400">
          Painel ao vivo
        </div>
      </div>

      {/* BOTÃO SOM */}
      {!audioLiberado && (
        <button
          onClick={() => {
            audioRef.current?.play().catch(() => {})
            setAudioLiberado(true)
            audioLiberadoRef.current = true
          }}
          className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white border border-gray-600 px-4 py-2 rounded-lg shadow-lg z-50"
        >
          🔊 Ativar som
        </button>
      )}

      {/* CONTEÚDO */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">

        {/* 🟡 EM PREPARO */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col min-h-0 overflow-visible">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            🟡 Em preparo
          </h2>

          <div
            ref={preparoRef}
            className="flex-1 overflow-y-auto min-h-0 scroll-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {emPreparo.map((pedido) => (
                <div
                  key={pedido.id}
                  className="bg-yellow-400 text-black rounded-xl p-4 flex items-center justify-center shadow-lg"
                >
                  <span className="text-4xl lg:text-5xl font-bold">
                    {pedido.codigo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🟢 PRONTOS */}
        <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col min-h-0 overflow-visible">
          <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
            🟢 Prontos
          </h2>

          <div
            ref={prontoRef}
            className="flex-1 overflow-y-auto min-h-0 scroll-hidden"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {prontos.map((pedido) => {
                const isHighlight = pedido.id === highlightId

                return (
                  <div
                    key={pedido.id}
                    className={`rounded-xl p-4 flex items-center justify-center transition-all duration-300 ${
                    isHighlight
                      ? "animate-blink-green text-white"
                        : "bg-green-500 shadow-lg"
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

      </div>
    </div>
  )
}