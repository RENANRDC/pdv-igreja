"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore"
import { db } from "@/services/firebase"
import BackButton from "@/components/ui/BackButton"
import PageContainer from "@/components/ui/PageContainer"

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
  total?: number
  valor?: number
  itens?: Item[]
}

export default function ControlePedidos() {

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [aba, setAba] = useState<"pendente" | "em_preparo" | "finalizado">("pendente")

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
  const emPreparo = pedidos.filter(p => p.status === "em_preparo")
  const finalizados = pedidos.filter(p => p.status === "finalizado")

  const lista =
    aba === "pendente"
      ? pendentes
      : aba === "em_preparo"
      ? emPreparo
      : finalizados

  const getTotal = (pedido: Pedido) => {
    return (pedido.total ?? pedido.valor ?? 0)
  }

  return (
    <PageContainer>

<div className="flex items-center justify-between mb-6">

  <div className="flex items-center gap-3">
    <img src="/logo.png" className="h-10 w-10" />
    <div>
      <h1 className="text-base font-bold">
        Central Gourmet
      </h1>
      <p className="text-xs text-gray-400">
        Pedidos
      </p>
    </div>
  </div>

  <BackButton href="/pdv" />

</div>

      {/* MOBILE - ABAS */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <button
          onClick={() => setAba("pendente")}
          className={`flex-1 p-2 rounded text-sm font-semibold ${
            aba === "pendente" ? "bg-yellow-500 text-black" : "bg-gray-800"
          }`}
        >
          Pendentes ({pendentes.length})
        </button>

        <button
          onClick={() => setAba("em_preparo")}
          className={`flex-1 p-2 rounded text-sm font-semibold ${
            aba === "em_preparo" ? "bg-blue-600" : "bg-gray-800"
          }`}
        >
          Preparo ({emPreparo.length})
        </button>

        <button
          onClick={() => setAba("finalizado")}
          className={`flex-1 p-2 rounded text-sm font-semibold ${
            aba === "finalizado" ? "bg-green-600" : "bg-gray-800"
          }`}
        >
          Prontos ({finalizados.length})
        </button>
      </div>

      {/* MOBILE LISTA */}
      <div className="space-y-3 lg:hidden">
        {lista.map((pedido) => (
          <div
  key={pedido.id}
  onClick={() => setPedidoSelecionado(pedido)}
  className="bg-gray-800 p-3 rounded-xl cursor-pointer"
>

            <div className="flex justify-between mb-2">
              <span className="font-bold">
  #{pedido.codigo} • {pedido.nomeCliente}
</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-green-400">
                R${getTotal(pedido).toFixed(2)}
              </span>

              <span className={`text-xs px-2 py-1 rounded ${
                pedido.status === "pendente"
                  ? "bg-yellow-500 text-black"
                  : pedido.status === "em_preparo"
                  ? "bg-blue-600"
                  : "bg-green-600"
              }`}>
                {pedido.status === "pendente"
                  ? "Pendente"
                  : pedido.status === "em_preparo"
                  ? "Em preparo"
                  : "Pronto"}
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* DESKTOP - COLUNAS IGUAL COZINHA */}
      <div className="hidden lg:grid grid-cols-3 gap-4">

        {/* PENDENTES */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
          <h2 className="text-yellow-400 font-semibold mb-3">
            Pendentes ({pendentes.length})
          </h2>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {pendentes.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => setPedidoSelecionado(pedido)}
                className="bg-gray-800 p-3 rounded-xl cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold">
  #{pedido.codigo} • {pedido.nomeCliente}
</span>
                </div>

                <span className="text-sm font-bold text-green-400">
                  R${getTotal(pedido).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EM PREPARO */}
        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
          <h2 className="text-blue-400 font-semibold mb-3">
            Em preparo ({emPreparo.length})
          </h2>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {emPreparo.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => setPedidoSelecionado(pedido)}
                className="bg-blue-900/40 p-3 rounded-xl cursor-pointer"
              >
                <div className="flex justify-between mb-2">
                  <span className="font-bold">
  #{pedido.codigo} • {pedido.nomeCliente}
</span>
                </div>

                <span className="text-sm font-bold text-green-400">
                  R${getTotal(pedido).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FINALIZADOS */}
        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl">
          <h2 className="text-green-400 font-semibold mb-3">
            Prontos ({finalizados.length})
          </h2>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {finalizados.map((pedido) => (
              <div
                key={pedido.id}
                onClick={() => setPedidoSelecionado(pedido)}
                className="bg-green-900/60 p-2 rounded flex justify-between items-center cursor-pointer"
              >
                <span className="font-semibold">
                  #{pedido.codigo} • {pedido.nomeCliente}
                </span>

                <span className="text-sm font-bold text-green-300">
                  R${getTotal(pedido).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

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
                R${getTotal(pedidoSelecionado).toFixed(2)}
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

</PageContainer>
  )
}