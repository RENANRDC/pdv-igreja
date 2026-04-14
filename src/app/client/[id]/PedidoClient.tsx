"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "@/services/firebase"
import { Volume2, VolumeX } from "lucide-react"

type Item = {
  nome: string
  preco: number
  quantidade: number
}

type Pedido = {
  nomeCliente: string
  codigo: string
  status: "pendente" | "finalizado"
  itens: Item[]
  total: number
}

const pedidoCache: Record<string, Pedido> = {}

export default function PedidoPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)

  const [destacar, setDestacar] = useState(false)
  const [somAtivo, setSomAtivo] = useState(false)

  const statusAnterior = useRef<string | null>(null)
  const somRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio("/sounds/pronto.wav")
    audio.preload = "auto"
    somRef.current = audio
  }, [])

  const tocarSom = useCallback(() => {
    if (!somAtivo) return
    const audio = somRef.current
    if (!audio) return

    try {
      audio.pause()
      audio.currentTime = 0
      audio.play()
    } catch {}
  }, [somAtivo])

  const ativarCelebracao = useCallback(() => {
    setDestacar(true)
    tocarSom()

    setTimeout(() => setDestacar(false), 4000)

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }, [tocarSom])

  useEffect(() => {
    if (!id) return

    queueMicrotask(() => {
      if (pedidoCache[id]) {
        setPedido(pedidoCache[id])
        setLoading(false)
      } else {
        const local = localStorage.getItem(`pedido-${id}`)
        if (local) {
          const parsed = JSON.parse(local)
          pedidoCache[id] = parsed
          setPedido(parsed)
          setLoading(false)
        }
      }
    })

    const ref = doc(db, "pedidos", id)

    const unsub = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        setPedido(null)
        setLoading(false)
        return
      }

      const data = snapshot.data() as Pedido

      pedidoCache[id] = data
      localStorage.setItem(`pedido-${id}`, JSON.stringify(data))

      if (
        statusAnterior.current &&
        statusAnterior.current !== "finalizado" &&
        data.status === "finalizado"
      ) {
        ativarCelebracao()
      }

      statusAnterior.current = data.status
      setPedido(data)
      setLoading(false)
    })

    return () => unsub()
  }, [id, ativarCelebracao])

  function toggleSom() {
    const audio = somRef.current
    if (!audio) return

    if (!somAtivo) {
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 0
        setSomAtivo(true)
      }).catch(() => {})
    } else {
      setSomAtivo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse text-lg opacity-80">
          Carregando pedido...
        </p>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-900 text-red-400">
        Pedido não encontrado
      </div>
    )
  }

  const isPronto = pedido.status === "finalizado"

  return (
    <div className="min-h-[100dvh] bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">

        {/* SOM */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/5 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
          <button
            onClick={toggleSom}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
              somAtivo
                ? "bg-green-600"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {somAtivo ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {somAtivo ? "Som ativo" : "Ativar som"}
          </button>
        </div>

        {/* CÓDIGO */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">Pedido</p>
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-widest drop-shadow-lg">
            {pedido.codigo}
          </h1>
        </div>

        {/* STATUS */}
        <div
          className={`w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl transition-all duration-300 ${
            isPronto
              ? destacar
                ? "bg-gradient-to-r from-green-400 to-green-600 scale-105"
                : "bg-gradient-to-r from-green-500 to-green-700"
              : "bg-gradient-to-r from-yellow-400 to-yellow-600 animate-pulse"
          }`}
        >
          <p className="text-lg font-semibold">
            {isPronto ? "🟢 Pronto para retirada" : "🟡 Em Preparo"}
          </p>
        </div>

        {/* CLIENTE */}
        <p className="mt-6 text-gray-300">
          Cliente: <span className="font-semibold">{pedido.nomeCliente}</span>
        </p>

        {/* ITENS */}
        <div className="mt-6 w-full max-w-sm bg-gray-800/80 backdrop-blur rounded-2xl p-4 border border-gray-700">
          <h3 className="font-bold mb-3 text-gray-300">Itens</h3>

          {pedido.itens.map((item, i) => (
            <div key={i} className="flex justify-between mb-2">
              <span>{item.nome} x{item.quantidade}</span>
              <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t border-gray-700 mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span>R$ {pedido.total.toFixed(2)}</span>
          </div>
        </div>

        {/* MENSAGEM */}
        {!isPronto ? (
          <p className="mt-6 text-sm text-gray-400 text-center animate-pulse">
            Aguarde... seu pedido está sendo preparado
          </p>
        ) : (
          <p className="mt-6 text-sm text-green-300 text-center font-semibold">
            Dirija-se ao balcão para retirar seu pedido
          </p>
        )}

      </div>
    </div>
  )
}