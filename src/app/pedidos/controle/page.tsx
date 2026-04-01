"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"
import { db } from "@/services/firebase"
import BackButton from "@/components/BackButton"

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "finalizado"
  total: number
  itens?: Item[]
}

export default function ControlePedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [aba, setAba] = useState<"pendente" | "finalizado">("pendente")
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  useEffect(() => {
    const q = query(
      collection(db, "pedidos"),
      orderBy("createdAt", "desc")
    )

    const unsub = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Pedido[]

      setPedidos(lista)
    })

    return () => unsub()
  }, [])

  const pendentes = pedidos.filter(p => p.status === "pendente")
  const finalizados = pedidos.filter(p => p.status === "finalizado")

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

      {/* HEADER */}
      <div className="grid grid-cols-3 items-center mb-6">

        <div className="flex justify-start">
          <BackButton href="/pdv" />
        </div>

        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">
            Pedidos
          </h1>
        </div>

        <div />
      </div>

      {/* ABAS */}
      <div className="flex gap-2 mb-5">

        <button
          onClick={() => setAba("pendente")}
          className={`flex-1 h-10 rounded-lg font-semibold transition ${
            aba === "pendente"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          🟡 Pendentes ({pendentes.length})
        </button>

        <button
          onClick={() => setAba("finalizado")}
          className={`flex-1 h-10 rounded-lg font-semibold transition ${
            aba === "finalizado"
              ? "bg-green-600"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
        >
          🟢 Prontos ({finalizados.length})
        </button>

      </div>

{/* LISTA com altura TOTAL fixa */}
<div 
  className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 content-start"
  style={{ 
    minHeight: '600px'
  }}
>
  {/* Renderiza MÁXIMO 8 cards (4 por linha em mobile, 8 em desktop) */}
  {Array.from({ length: 8 }).map((_, index) => {
    const itensVisiveis = aba === "pendente" ? pendentes : finalizados
    const pedido = itensVisiveis[index]
    
    if (!pedido) {
      // Skeleton para preencher espaço
      return (
        <div 
          key={`skeleton-${index}-${aba}`}
          className="bg-gray-800 p-4 rounded-xl animate-pulse h-28 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="w-16 h-4 bg-gray-600 rounded"></div>
            <div className="w-12 h-4 bg-gray-600 rounded"></div>
          </div>
          <div className="w-24 h-4 bg-gray-600 rounded mb-2"></div>
          <div className="flex justify-between items-center">
            <div className="w-16 h-4 bg-gray-600 rounded"></div>
            <div className="w-16 h-8 bg-gray-600 rounded"></div>
          </div>
        </div>
      )
    }

    return (
<div
  key={`pedido-${pedido.id}-${aba}-${index}`}
  className="bg-gray-800 border border-gray-700 p-4 rounded-2xl 
             hover:bg-gray-750 hover:border-gray-600 
             transition-all duration-200 h-28 flex flex-col justify-between gap-1"
>

  {/* TOPO */}
  <div className="flex justify-between items-center mb-1">
    <span className="font-bold text-white text-sm tracking-wide">
      #{pedido.codigo}
    </span>

    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
      pedido.status === "pendente"
        ? "bg-yellow-500/90 text-black"
        : "bg-green-600/90 text-white"
    }`}>
      {pedido.status}
    </span>
  </div>

  {/* CLIENTE */}
  <div className="text-sm text-gray-300 leading-tight line-clamp-2">
    {pedido.nomeCliente}
  </div>

  {/* RODAPÉ */}
  <div className="flex justify-between items-center">

    <span className="font-bold text-green-400 text-sm">
      R$ {pedido.total.toFixed(2)}
    </span>

    <button
      onClick={() => setPedidoSelecionado(pedido)}
      className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
    >
      Detalhes
    </button>

  </div>
</div>
    )
  })}
</div>

      {/* MODAL */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">

          <div className="bg-white text-black p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-3">
              Pedido #{pedidoSelecionado.codigo}
            </h2>

            <p className="mb-2">
              Cliente: {pedidoSelecionado.nomeCliente}
            </p>

            <div className="mb-4">
              {pedidoSelecionado.itens?.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span>{item.nome} x{item.quantidade}</span>
                  <span>
                    R$ {((item.preco || 0) * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="font-bold mb-4">
              Total: R$ {pedidoSelecionado.total.toFixed(2)}
            </div>

            <button
              onClick={() => setPedidoSelecionado(null)}
              className="w-full bg-gray-700 text-white p-2 rounded"
            >
              Fechar
            </button>

          </div>

        </div>
      )}

    </div>
  )
}