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
  status: "pendente" | "finalizado"
}

export default function DisplayPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [audioLiberado, setAudioLiberado] = useState(false)

  const statusAnterior = useRef<Record<string, string>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const audioLiberadoRef = useRef(false)

  // 🔊 inicia áudio
  useEffect(() => {
    const audio = new Audio("/sounds/pronto.wav")
    audio.volume = 1
    audioRef.current = audio
  }, [])

  // 🎉 ALERTA (animação + som)
  function ativarAlerta(id: string) {
    setHighlightId(id)

    // limpa timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setHighlightId(null)
    }, 4000)

    // 🔊 toca som apenas se liberado
    if (audioRef.current && audioLiberadoRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  // 🔥 REALTIME (SEM WARNING)
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
        if (!pedido.id) return

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

  // 🔥 separação
  const emPreparo = pedidos
    .filter((p) => p.status === "pendente")
    .slice(0, 10)

  const prontos = pedidos
    .filter((p) => p.status === "finalizado")
    .slice(0, 10)

  return (
    <div className="min-h-screen bg-black text-white p-6 grid grid-cols-2 gap-4">

      {/* 🟡 EM PREPARO */}
      <div className="bg-gray-800/40 rounded-2xl p-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
          🟡 Em preparo
        </h2>

        {emPreparo.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhum pedido
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {emPreparo.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-yellow-500 text-black rounded-xl p-4 flex items-center justify-center"
              >
                <span className="text-3xl font-bold">
                  {pedido.codigo}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 🟢 PRONTOS */}
      <div className="bg-gray-800/40 rounded-2xl p-4">
        <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
          🟢 Prontos
        </h2>

        {prontos.length === 0 ? (
          <p className="text-center text-gray-500">
            Nenhum pedido
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {prontos.map((pedido) => {
              const isHighlight = pedido.id === highlightId

              return (
                <div
                  key={pedido.id}
                  className={`rounded-xl p-4 flex items-center justify-center transition-all duration-500 ${
                    isHighlight
                      ? "bg-green-400 scale-110 animate-bounce"
                      : "bg-green-600"
                  }`}
                >
                  <span className="text-3xl font-bold">
                    {pedido.codigo}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 🔊 BOTÃO (AUTO SOME) */}
      {!audioLiberado && (
        <button
          onClick={() => {
            audioRef.current?.play().catch(() => {})
            setAudioLiberado(true)
            audioLiberadoRef.current = true
          }}
          className="fixed bottom-4 right-4 bg-white text-black px-4 py-2 rounded-lg shadow-lg"
        >
          🔊 Ativar som
        </button>
      )}
    </div>
  )
}