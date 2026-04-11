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

  const lista = aba === "pendente" ? pendentes : finalizados

  return (
    <div className="bg-gray-900 text-white p-4 min-h-[100vh]">

      {/* HEADER (PADRÃO COZINHA) */}
      <div className="grid grid-cols-3 items-center mb-6">
        <div className="flex justify-start">
          <BackButton href="/" />
        </div>

        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">
            Pedidos
          </h1>
        </div>

        <div />
      </div>

      {/* ABAS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAba("pendente")}
          className={`flex-1 p-2 rounded font-semibold text-sm ${
            aba === "pendente"
              ? "bg-yellow-500 text-black"
              : "bg-gray-800"
          }`}
        >
          Pendentes ({pendentes.length})
        </button>

        <button
          onClick={() => setAba("finalizado")}
          className={`flex-1 p-2 rounded font-semibold text-sm ${
            aba === "finalizado"
              ? "bg-green-600"
              : "bg-gray-800"
          }`}
        >
          Prontos ({finalizados.length})
        </button>
      </div>

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {lista.map((pedido) => (
          <div
            key={pedido.id}
            onClick={() => setPedidoSelecionado(pedido)}
            className="bg-gray-800 p-4 rounded-xl flex flex-col justify-between min-h-[120px] cursor-pointer hover:bg-gray-700 transition"
          >

            {/* TOPO */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold">
                #{pedido.codigo}
              </span>

              <span className="text-xs text-gray-300 truncate max-w-[120px]">
                {pedido.nomeCliente}
              </span>
            </div>

            {/* RODAPÉ DO CARD */}
            <div className="flex justify-between items-center mt-auto">
              <span className="text-sm font-bold text-green-400">
                R${pedido.total.toFixed(2)}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  pedido.status === "pendente"
                    ? "bg-yellow-500 text-black"
                    : "bg-green-600"
                }`}
              >
                {pedido.status}
              </span>
            </div>

          </div>
        ))}

      </div>

      {/* MODAL */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-gray-900 p-6 rounded-xl w-80">

            <h2 className="text-xl font-bold mb-3">
              Pedido #{pedidoSelecionado.codigo}
            </h2>

            <p className="text-sm text-gray-400 mb-3">
              {pedidoSelecionado.nomeCliente}
            </p>

            <div className="mb-4 space-y-1">
              {pedidoSelecionado.itens?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.nome}</span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
            </div>

            <div className="text-right mb-4">
              <span className="text-lg font-bold text-green-400">
                R${pedidoSelecionado.total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => setPedidoSelecionado(null)}
              className="w-full bg-gray-700 p-2 rounded"
            >
              Fechar
            </button>

          </div>

        </div>
      )}

    </div>
  )
}