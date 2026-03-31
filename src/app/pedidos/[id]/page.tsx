"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { doc, onSnapshot } from "firebase/firestore"
import { db } from "../../../services/firebase"

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

export default function PedidoPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [destacar, setDestacar] = useState(false)
  const [somAtivo, setSomAtivo] = useState(false)

  const statusAnterior = useRef<string | null>(null)
  const somRef = useRef<HTMLAudioElement | null>(null)

  // 🔊 Inicializa áudio
  useEffect(() => {
    const audio = new Audio("/sounds/pronto.wav")
    audio.preload = "auto"
    somRef.current = audio
  }, [])

  // 🔊 tocar som (com controle)
    const tocarSom = useCallback(() => {
      if (!somAtivo) return

      const audio = somRef.current
      if (!audio) return

      try {
        audio.pause()

        if (audio.readyState >= 1) {
          audio.currentTime = 0
        }

        audio.play()
      } catch {}
    }, [somAtivo])

  // 🎉 celebração (corrigido com useCallback)
  const ativarCelebracao = useCallback(() => {
    setDestacar(true)

    tocarSom()

    setTimeout(() => {
      setDestacar(false)
    }, 4000)

    if (typeof window !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }, [tocarSom])

  // 🔥 realtime
  useEffect(() => {
    if (!id) return

    const ref = doc(db, "pedidos", id)

    const unsub = onSnapshot(ref, (snapshot) => {
      if (!snapshot.exists()) {
        setPedido(null)
        setLoading(false)
        return
      }

      const data = snapshot.data() as Pedido

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

  // 🔓 ativar som manualmente
  function ativarSomManual() {
    const audio = somRef.current
    if (!audio) return

    audio.play()
      .then(() => {
        audio.pause()

        if (audio.readyState >= 1) {
          audio.currentTime = 0
        }

        setSomAtivo(true)
      })
      .catch(() => {})
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="animate-pulse text-lg">Carregando pedido...</p>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        Pedido não encontrado
      </div>
    )
  }

  const isPronto = pedido.status === "finalizado"

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">

      {/* 🔊 BOTÃO SOM */}
      <button
        onClick={ativarSomManual}
        className={`absolute top-4 right-4 px-3 py-1 rounded text-sm ${
          somAtivo ? "bg-green-600" : "bg-blue-600"
        }`}
      >
        {somAtivo ? "🔊 Som ativo" : "🔇 Ativar som"}
      </button>

      {/* Código */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm">Pedido</p>
        <h1 className="text-6xl font-bold tracking-widest">
          {pedido.codigo}
        </h1>
      </div>

      {/* STATUS */}
      <div
        className={`w-full max-w-sm rounded-2xl p-6 text-center shadow-xl transition-all duration-500 ${
          isPronto
            ? destacar
              ? "bg-green-500 scale-110 animate-bounce"
              : "bg-green-600"
            : "bg-yellow-500 animate-pulse"
        }`}
      >
        <p className="text-lg font-semibold">
          {isPronto ? "🟢 Pronto para retirada" : "🟡 Em preparo"}
        </p>
      </div>

      {/* Nome */}
      <p className="mt-6 text-gray-300">
        Cliente:{" "}
        <span className="font-semibold">
          {pedido.nomeCliente}
        </span>
      </p>

      {/* Itens */}
      <div className="mt-6 w-full max-w-sm bg-gray-800 rounded-xl p-4">
        <h3 className="font-bold mb-3 text-gray-300">Itens</h3>

        {pedido.itens.map((item, i) => (
          <div key={i} className="flex justify-between mb-2">
            <span>
              {item.nome} x{item.quantidade}
            </span>
            <span>
              R$ {(item.preco * item.quantidade).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="border-t border-gray-700 mt-3 pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span>R$ {pedido.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Mensagem */}
      {!isPronto ? (
        <p className="mt-6 text-sm text-gray-400 text-center animate-pulse">
          Aguarde... seu pedido está sendo preparado 🍕
        </p>
      ) : (
        <p className="mt-6 text-sm text-green-300 text-center font-semibold">
          Dirija-se ao balcão para retirar seu pedido 🙌
        </p>
      )}
    </div>
  )
}