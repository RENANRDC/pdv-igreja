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

import DisplayHeader from "@/components/display/DisplayHeader"
import DisplayColumn from "@/components/display/DisplayColumn"

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
    <div className="h-screen flex flex-col bg-gray-900 text-white overflow-hidden">

      <DisplayHeader />

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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden min-h-0">

        <DisplayColumn
          title="🟡 Em preparo"
          color="yellow"
          pedidos={
            precisaScroll ? [...emPreparo, ...emPreparo] : emPreparo
          }
          scroll={precisaScroll}
          containerRef={containerRef}
          contentRef={contentRef}
        />

        <DisplayColumn
          title="🟢 Prontos"
          color="green"
          pedidos={prontos}
          highlightId={highlightId}
        />

      </div>

    </div>
  )
}