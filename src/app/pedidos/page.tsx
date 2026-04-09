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
import { db } from "@/services/firebase"
import BackButton from "@/components/BackButton"
import { useAuthGuard } from "@/hooks/useAuthGuard"

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
  itens: {
    nome: string
    quantidade: number
  }[]
}

export default function Cozinha() {

  useAuthGuard()

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)

  const somNovoRef = useRef<HTMLAudioElement | null>(null)
  const idsRef = useRef<string[]>([])

  useEffect(() => {
    somNovoRef.current = new Audio("/sounds/novo.wav")
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

      if (idsRef.current.length > 0) {
        const temNovo = novosIds.some(id => !idsRef.current.includes(id))
        if (temNovo) somNovoRef.current?.play().catch(() => {})
      }

      idsRef.current = novosIds
      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

  async function assumirPedido(id: string) {
    await updateDoc(doc(db, "pedidos", id), {
      status: "em_preparo",
    })
  }

  async function voltarParaPendente(id: string) {
    await updateDoc(doc(db, "pedidos", id), {
      status: "pendente",
    })
  }

  async function confirmarFinalizar() {
    if (!pedidoSelecionado) return

    await updateDoc(doc(db, "pedidos", pedidoSelecionado.id), {
      status: "finalizado",
    })

    setPedidoSelecionado(null)
  }

async function voltarParaPreparo(id: string) {
  await updateDoc(doc(db, "pedidos", id), {
    status: "em_preparo",
  })
}

  const pendentes = pedidos.filter(p => p.status === "pendente")
  const emPreparo = pedidos.filter(p => p.status === "em_preparo")
  const finalizados = pedidos.filter(p => p.status === "finalizado")

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">

      {/* HEADER */}
      <div className="grid grid-cols-3 items-center mb-6">
        <div className="flex justify-start">
          <BackButton href="/" />
        </div>

        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">
            Cozinha
          </h1>
        </div>

        <div />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* 🟡 PENDENTES */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-xl">
          <h2 className="text-yellow-400 font-semibold mb-3">
            Pendentes ({pendentes.length})
          </h2>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {pendentes.map((pedido) => (
              <div key={pedido.id} className="bg-gray-800 p-3 rounded-xl">

              <div className="flex justify-between items-center w-full">

                <span className="text-sm font-semibold">
                  #{pedido.codigo}
                </span>

                <span className="text-xs text-gray-200 truncate max-w-25">
                  {pedido.nomeCliente}
                </span>

              </div>

                <button
                  onClick={() => assumirPedido(pedido.id)}
                  className="w-full bg-yellow-500 text-black p-2 rounded text-sm font-semibold"
                >
                  Assumir
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* 🔵 EM PREPARO */}
        <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl">
          <h2 className="text-blue-400 font-semibold mb-3">
            Em preparo ({emPreparo.length})
          </h2>

          <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {emPreparo.map((pedido) => (
              <div key={pedido.id} className="bg-blue-900/40 p-3 rounded-xl">

                <div className="flex justify-between mb-2">
                  <span className="font-bold">#{pedido.codigo}</span>
                  <span className="text-xs text-gray-200 truncate max-w-25">
                    {pedido.nomeCliente}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setPedidoSelecionado(pedido)}
                    className="flex-1 bg-blue-600 p-2 rounded text-xs"
                  >
                    Ver
                  </button>

                  <button
                    onClick={() => setPedidoSelecionado(pedido)}
                    className="flex-1 bg-green-600 p-2 rounded text-xs"
                  >
                    Finalizar
                  </button>
                </div>

                {/* 🔥 NOVO BOTÃO VOLTAR */}
                <button
                  onClick={() => voltarParaPendente(pedido.id)}
                  className="w-full mt-2 bg-gray-700 p-2 rounded text-xs"
                >
                  Voltar
                </button>

              </div>
            ))}
          </div>
        </div>

        {/* 🟢 FINALIZADOS */}
        <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-xl">
          <h2 className="text-green-400 font-semibold mb-3">
            Prontos ({finalizados.length})
          </h2>

          <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-1">
            {finalizados.map((pedido) => (
            <div
              key={pedido.id}
              className="bg-green-900/60 p-2 rounded flex justify-between items-center gap-2"
            >

              <div className="flex justify-between items-center w-full">

                <span className="text-sm font-semibold">
                  #{pedido.codigo}
                </span>

                <span className="text-xs text-gray-200 truncate max-w-25">
                  {pedido.nomeCliente}
                </span>

              </div>

                <button
                  onClick={() => voltarParaPreparo(pedido.id)}
                  className="bg-yellow-500 text-black px-2 py-1 rounded text-xs"
                >
                  Desfazer
                </button>

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
              {pedidoSelecionado.itens.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.nome}</span>
                  <span>x{item.quantidade}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                Fechar
              </button>

              <button
                onClick={confirmarFinalizar}
                className="w-full bg-green-600 p-2 rounded"
              >
                Finalizar
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  )
}