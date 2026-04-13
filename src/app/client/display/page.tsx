"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
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
  const [limiteProntos, setLimiteProntos] = useState(20)
  const [precisaScroll, setPrecisaScroll] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const statusAnterior = useRef<Record<string, string>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioLiberadoRef = useRef(false)

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "display"), (docSnap) => {
      if (docSnap.exists()) {
        setLimiteProntos(docSnap.data().limiteProntos || 20)
      }
    })
    return () => unsubscribe()
  }, [])

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

  const prontos = pedidos
    .filter((p) => p.status === "finalizado")
    .slice(0, limiteProntos)

  useEffect(() => {
    const check = () => {
      if (containerRef.current && contentRef.current) {
        const containerHeight = containerRef.current.offsetHeight
        const contentHeight = contentRef.current.scrollHeight
        setPrecisaScroll(contentHeight > containerHeight)
      }
    }

    check()

    const observer = new ResizeObserver(check)
    if (contentRef.current) observer.observe(contentRef.current)

    return () => observer.disconnect()
  }, [emPreparo])

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">

      <div className="p-4 flex flex-col h-full">

        {/* HEADER PADRÃO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-10 w-10" />
            <div>
              <h1 className="text-base font-bold">
                Central Gourmet
              </h1>
              <p className="text-xs text-gray-400">
                Display
              </p>
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Desenvolvido por{" "}
            <span className="font-semibold text-white">
              R2CodeX
            </span>
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
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-lg z-50"
          >
            🔊 Ativar som
          </button>
        )}

        {/* CONTEÚDO */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">

          {/* EM PREPARO */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
              🟡 Em preparo
            </h2>

            <div ref={containerRef} className="flex-1 overflow-hidden">
              <div
                ref={contentRef}
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${
                  precisaScroll ? "animate-scroll" : ""
                }`}
              >
                {(precisaScroll ? [...emPreparo, ...emPreparo] : emPreparo).map(
                  (pedido, index) => (
                    <div
                      key={index}
                      className="bg-yellow-400 text-black rounded-xl p-4 flex items-center justify-center"
                    >
                      <span className="text-4xl lg:text-5xl font-bold">
                        {pedido.codigo}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* PRONTOS */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
              🟢 Prontos
            </h2>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {prontos.map((pedido) => {
                  const isHighlight = pedido.id === highlightId

                  return (
                    <div
                      key={pedido.id}
                      className={`rounded-xl p-4 flex items-center justify-center ${
                        isHighlight
                          ? "animate-blink-green text-white"
                          : "bg-green-500"
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
    </div>
  )
}