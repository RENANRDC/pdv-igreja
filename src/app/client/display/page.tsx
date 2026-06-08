"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  Timestamp,
} from "firebase/firestore"
import { db } from "@/services/firebase"
import DisplayHeader from "@/components/display/DisplayHeader"

type Pedido = {
  id: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
  avisoAt?: Timestamp
precisaPreparo?: boolean
}

export default function DisplayPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [highlightId, setHighlightId] = useState<string | null>(null)
const [audioLiberado, setAudioLiberado] = useState(false)
  const [limiteProntos, setLimiteProntos] = useState(20)
  const [precisaScroll, setPrecisaScroll] = useState(false)

  const [precisaScrollProntos, setPrecisaScrollProntos] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const containerProntosRef = useRef<HTMLDivElement>(null)
  const contentProntosRef = useRef<HTMLDivElement>(null)

  const statusAnterior = useRef<Record<string, string>>({})
  const avisoAnterior = useRef<Record<string, number>>({})
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioLiberadoRef = useRef(false)
useEffect(() => {
  audioLiberadoRef.current = audioLiberado
}, [audioLiberado])
useEffect(() => {
  if (typeof window === "undefined") return

  const audioAtivado =
    window.localStorage.getItem("display-audio")

  if (audioAtivado === "1") {
    audioLiberadoRef.current = true

    setTimeout(() => {
      setAudioLiberado(true)
    }, 0)
  }
}, [])
  // 🔥 config dinâmica
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "config", "display"), (docSnap) => {
      if (docSnap.exists()) {
        setLimiteProntos(docSnap.data().limiteProntos || 20)
      }
    })
    return () => unsubscribe()
  }, [])

  // 🔊 áudio
useEffect(() => {
  const audio = new Audio("/sounds/pronto2.wav")

  audio.volume = 1
  audio.preload = "auto"

  audioRef.current = audio
}, [])

  function ativarAlerta(id: string) {
    setHighlightId(id)
    setTimeout(() => setHighlightId(null), 20000)

    if (audioRef.current && audioLiberadoRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
  }

  // 🔥 realtime pedidos
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
const avisoAtual =
  pedido.avisoAt?.seconds || 0

const avisoAnteriorPedido =
  avisoAnterior.current[pedido.id] || 0
        if (
          anterior &&
          anterior !== "finalizado" &&
          pedido.status === "finalizado"
        ) {
          ativarAlerta(pedido.id)
        }
        if (
  avisoAtual > 0 &&
  avisoAtual !== avisoAnteriorPedido
) {
  ativarAlerta(pedido.id)
}

avisoAnterior.current[pedido.id] = avisoAtual

        statusAnterior.current[pedido.id] = pedido.status
      })

      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

  // 🔥 EM PREPARO
const emPreparo = pedidos.filter(
  (p) =>
    p.precisaPreparo === true &&
    (
      p.status === "pendente" ||
      p.status === "em_preparo"
    )
)

  // 🔥 PRONTOS
const prontos = pedidos
  .filter(
    (p) =>
      p.precisaPreparo === true &&
      p.status === "finalizado"
  )
  .slice(0, limiteProntos)

  // 🔥 scroll EM PREPARO
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

  // 🔥 scroll PRONTOS (NOVO)
useEffect(() => {
  const check = () => {
    if (containerProntosRef.current && contentProntosRef.current) {
      const containerHeight =
        containerProntosRef.current.offsetHeight

      const contentHeight =
        contentProntosRef.current.scrollHeight

      console.log({
      prontos: prontos.length,
      containerHeight,
      contentHeight,
      scroll: contentHeight > containerHeight,
    })

      setPrecisaScrollProntos(
        contentHeight > containerHeight
      )
    }
  }

  const timeout = setTimeout(() => {
    check()
  }, 100)

  const observer = new ResizeObserver(() => {
    check()
  })

  if (contentProntosRef.current) {
    observer.observe(contentProntosRef.current)
  }

  if (containerProntosRef.current) {
    observer.observe(containerProntosRef.current)
  }

  return () => {
    clearTimeout(timeout)
    observer.disconnect()
  }
}, [prontos, limiteProntos])

  return (
    <div className="h-screen bg-gray-900 text-white overflow-hidden">

      <div className="p-4 flex flex-col h-full">

        <div className="mb-6">
          <DisplayHeader />
        </div>

        {!audioLiberado && (
          <button
onClick={() => {
  audioRef.current?.play().catch(() => {})

  setAudioLiberado(true)
  audioLiberadoRef.current = true

  localStorage.setItem(
    "display-audio",
    "1"
  )
}}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 px-4 py-2 rounded-lg z-50"
          >
            🔊 Ativar som
          </button>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden min-h-0">

          {/* 🟡 EM PREPARO */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
              🟡 Em preparo
            </h2>

            <div ref={containerRef} className="flex-1 overflow-hidden">
              <div
                ref={contentRef}
                className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
                  precisaScroll ? "animate-scroll" : ""
                }`}
              >
                {(
  precisaScroll
    ? [...emPreparo, ...emPreparo]
    : emPreparo
).map(
                  (pedido, index) => (
                    <div
                      key={`${pedido.id}-${index}`}
                      className="bg-yellow-400 text-black rounded-xl p-6 flex items-center justify-center"
                    >
                      <span className="text-6xl lg:text-7xl font-bold">
                        {pedido.codigo}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* 🟢 PRONTOS */}
          <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-4 flex flex-col overflow-hidden">
            <h2 className="text-2xl font-bold text-green-400 mb-4 text-center">
              🟢 Prontos
            </h2>

            <div ref={containerProntosRef} className="flex-1 overflow-hidden">
              <div
                ref={contentProntosRef}
                className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {prontos.map(
                  (pedido, index) => {
                    const isHighlight = pedido.id === highlightId

                    return (
                      <div
                        key={`${pedido.id}-${index}`}
                        className={`rounded-xl p-6 flex items-center justify-center transition-all duration-300 ${
                          isHighlight
                            ? "bg-lime-400 text-black animate-pulse shadow-[0_0_30px_#84cc16]"
                            : "bg-green-600"
                        }`}
                      >
                        <span className="text-6xl lg:text-7xl font-bold">
                          {pedido.codigo}
                        </span>
                      </div>
                    )
                  }
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}