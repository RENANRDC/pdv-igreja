"use client"

import { useEffect, useRef, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore"
import { db } from "../../services/firebase"

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "finalizado"
  itens: {
    nome: string
    quantidade: number
  }[]
}

export default function Cozinha() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  // 🔊 refs corretos
  const somNovoRef = useRef<HTMLAudioElement | null>(null)
  const somFinalizadoRef = useRef<HTMLAudioElement | null>(null)
  const idsRef = useRef<string[]>([])

  // 🔥 inicializa áudio uma vez
  useEffect(() => {
    somNovoRef.current = new Audio("/sounds/novo.wav")
    somFinalizadoRef.current = new Audio("/sounds/finalizado.wav")
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, "pedidos"),
      orderBy("createdAt", "asc")
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista: Pedido[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[]

      const novosIds = snapshot.docs.map((doc) => doc.id)

      // 🔊 detectar novo pedido
      if (idsRef.current.length > 0) {
        const temNovo = novosIds.some(id => !idsRef.current.includes(id))

        if (temNovo) {
          somNovoRef.current?.play().catch(() => {
            // fallback som simples
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            osc.connect(ctx.destination)
            osc.start()
            setTimeout(() => osc.stop(), 150)
          })
        }
      }

      idsRef.current = novosIds
      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

  async function confirmarFinalizar() {
    if (!pedidoSelecionado) return

    await updateDoc(doc(db, "pedidos", pedidoSelecionado.id), {
      status: "finalizado",
    })

    // 🔊 som finalização
    somFinalizadoRef.current?.play().catch(() => {})

    setPedidoSelecionado(null)
  }

  async function desfazerPedido(id: string) {
    await updateDoc(doc(db, "pedidos", id), {
      status: "pendente",
    })
  }

  const pendentes = pedidos.filter((p) => p.status === "pendente")
  const finalizados = pedidos.filter((p) => p.status === "finalizado")

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">🍳 Cozinha</h1>

      {/* Pendentes */}
      <h2 className="text-lg font-bold mb-2 text-yellow-400">
        Pendentes
      </h2>

      <div className="grid gap-3 mb-6">
        {pendentes.length === 0 && <p>Nenhum pedido</p>}

        {pendentes.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-gray-800 p-4 rounded-xl"
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-xl">
                #{pedido.codigo}
              </span>
              <span>{pedido.nomeCliente}</span>
            </div>

            <div className="mb-3">
              {pedido.itens.map((item, i) => (
                <div key={i}>
                  {item.nome} x{item.quantidade}
                </div>
              ))}
            </div>

            <button
              onClick={() => setPedidoSelecionado(pedido)}
              className="w-full bg-green-600 p-2 rounded-lg font-bold active:scale-95"
            >
              Finalizar
            </button>
          </div>
        ))}
      </div>

      {/* Finalizados */}
      <h2 className="text-lg font-bold mb-2 text-green-400">
        Prontos
      </h2>

      <div className="grid gap-3">
        {finalizados.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-green-900 p-3 rounded-lg opacity-80"
          >
            <div className="flex justify-between items-center">
              <span>
                #{pedido.codigo} - {pedido.nomeCliente}
              </span>

              <button
                onClick={() => desfazerPedido(pedido.id)}
                className="bg-yellow-500 text-black px-2 py-1 rounded text-sm active:scale-95"
              >
                Desfazer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">

            <h2 className="text-xl font-bold mb-4">
              Finalizar pedido #{pedidoSelecionado.codigo}?
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="w-full bg-gray-600 p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={confirmarFinalizar}
                className="w-full bg-green-600 p-2 rounded font-bold"
              >
                Confirmar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}