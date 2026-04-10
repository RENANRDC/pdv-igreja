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
  const itensVisiveis = aba === "pendente" ? pendentes : finalizados

  return (
    <div className="min-h-screen w-screen bg-gray-900 flex flex-col text-white">
      
      {/* HEADER - 60px EXATOS */}
      <header style={{ height: '60px' }} className="flex-shrink-0 flex items-center px-4 border-b border-gray-800">
        <div className="w-full grid grid-cols-3 items-center gap-4">
          <BackButton href="/pdv" />
          <h1 style={{ fontSize: '20px' }} className="font-bold text-center mx-auto">Pedidos</h1>
          <div />
        </div>
      </header>

      {/* ABAS - 44px EXATOS */}
      <div style={{ height: '44px' }} className="flex-shrink-0 flex items-center px-4">
        <div className="w-full flex gap-2">
          <button
            onClick={() => setAba("pendente")}
            style={{ height: '36px' }}
            className={`flex-1 rounded-lg font-semibold transition-all duration-200 ${
              aba === "pendente"
                ? "bg-yellow-500 text-black shadow-lg"
                : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            <span className="text-xs">🟡 Pendentes ({pendentes.length})</span>
          </button>
          <button
            onClick={() => setAba("finalizado")}
            style={{ height: '36px' }}
            className={`flex-1 rounded-lg font-semibold transition-all duration-200 ${
              aba === "finalizado"
                ? "bg-green-600 shadow-lg"
                : "bg-gray-800 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            <span className="text-xs">🟢 Prontos ({finalizados.length})</span>
          </button>
        </div>
      </div>

      {/* CARDS - 100% DO RESTANTE */}
      <main className="flex-1 overflow-hidden">
        <div className="h-full w-full overflow-auto p-2 grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
          
          {Array.from({ length: 20 }).map((_, index) => {
            const pedido = itensVisiveis[index]
            
            if (!pedido) {
              return (
                <div 
                  key={`skeleton-${index}`}
                  style={{ height: '80px' }}
                  className="bg-gray-800/50 rounded-lg border border-gray-700 p-2 flex flex-col justify-between animate-pulse shadow-sm"
                />
              )
            }

            return (
              <div
                key={`pedido-${pedido.id}`}
                style={{ height: '80px' }}
                className="bg-gray-800/70 hover:bg-gray-700 border border-gray-700/50 
                           rounded-lg p-2 flex flex-col justify-between shadow-sm 
                           hover:shadow-md hover:border-blue-500/50 transition-all duration-200 cursor-pointer"
                onClick={() => setPedidoSelecionado(pedido)}
              >
                <div className="flex justify-between items-start gap-1 mb-1">
                  <span style={{ fontSize: '11px' }} className="font-bold tracking-tight">
                    #{pedido.codigo}
                  </span>
                  <span style={{ fontSize: '9px', padding: '2px 6px' }} 
                        className={`rounded-full font-semibold ${
                          pedido.status === "pendente"
                            ? "bg-yellow-500/90 text-black"
                            : "bg-green-500/90 text-black"
                        }`}>
                    {pedido.status}
                  </span>
                </div>

                <div style={{ fontSize: '12px', lineHeight: '1.2' }} 
                     className="text-gray-300 line-clamp-2 flex-1 min-h-0">
                  {pedido.nomeCliente}
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span style={{ fontSize: '14px' }} className="font-bold text-green-400">
                    R${pedido.total.toFixed(2)}
                  </span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* MODAL */}
      {pedidoSelecionado && (
        <>
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPedidoSelecionado(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white/95 backdrop-blur-xl text-black rounded-2xl w-full max-w-sm max-h-[90vh] overflow-auto shadow-2xl border-4 border-white/30 pointer-events-auto max-w-md mx-4" style={{ maxHeight: '90vh' }}>
              <div className="sticky top-0 bg-white/80 backdrop-blur-sm p-4 border-b-2 border-gray-200 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h2 style={{ fontSize: '22px' }} className="font-black">Pedido #{pedidoSelecionado.codigo}</h2>
                  <button
                    onClick={() => setPedidoSelecionado(null)}
                    className="text-xl font-black text-gray-500 hover:text-black p-1 rounded-full hover:bg-gray-200 transition"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-sm text-gray-600 block mb-1">👤 Cliente</span>
                  <span className="font-bold text-lg block">{pedidoSelecionado.nomeCliente}</span>
                </div>
                
                <div>
                  <span className="text-sm text-gray-600 block mb-2 font-medium">📋 Itens</span>
                  <div className="space-y-2 max-h-40 overflow-auto">
                    {pedidoSelecionado.itens?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-gray-50/50 rounded-xl border border-gray-200">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{item.nome}</p>
                          <p className="text-xs text-gray-500">×{item.quantidade}</p>
                        </div>
                        <span className="font-bold text-green-600 text-sm">
                          R${((item.preco || 0) * item.quantidade).toFixed(2)}
                        </span>
                      </div>
                    )) || (
                      <div className="text-center py-6 text-gray-500">
                        <div className="text-3xl mb-1">📭</div>
                        <p className="text-sm">Nenhum item</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-gray-200">
                  <div className="text-2xl font-black text-right text-green-600 tracking-wide">
                    R${pedidoSelecionado.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-2xl">
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  className="w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black 
                             hover:from-black hover:to-gray-900 text-white py-4 rounded-xl 
                             font-black text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-300/50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}