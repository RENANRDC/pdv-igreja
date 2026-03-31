"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"
import { db } from "../../../services/firebase"

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

  const listaAtual =
    aba === "pendente" ? pendentes : finalizados

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

      {/* 🔥 TOPO */}
      <div className="flex justify-between items-center mb-4">
        <Link
          href="/pdv"
          className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition"
        >
          ⬅️ Voltar ao PDV
        </Link>

        <h1 className="text-2xl font-bold">📋 Controle de Pedidos</h1>
      </div>

      {/* 🔥 ABAS */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAba("pendente")}
          className={`px-3 py-2 rounded ${
            aba === "pendente" ? "bg-yellow-500" : "bg-gray-700"
          }`}
        >
          🟡 Pendentes ({pendentes.length})
        </button>

        <button
          onClick={() => setAba("finalizado")}
          className={`px-3 py-2 rounded ${
            aba === "finalizado" ? "bg-green-600" : "bg-gray-700"
          }`}
        >
          🟢 Prontos ({finalizados.length})
        </button>
      </div>

      {/* 🔥 LISTA */}
      <div className="grid gap-3">
        {listaAtual.map((p) => (
          <div key={p.id} className="bg-gray-800 p-4 rounded-xl">

            <div className="flex justify-between mb-2">
              <span className="font-bold">#{p.codigo}</span>
              <span className="text-sm">{p.status}</span>
            </div>

            <div className="text-sm text-gray-300 mb-2">
              {p.nomeCliente}
            </div>

            <div className="flex justify-between items-center">
              <span className="font-bold text-green-400">
                R$ {p.total.toFixed(2)}
              </span>

              <button
                onClick={() => setPedidoSelecionado(p)}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                Detalhes
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* 🔥 MODAL DETALHES */}
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