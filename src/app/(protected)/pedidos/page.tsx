"use client"

import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore"
import { db } from "@/services/firebase"
import BackButton from "@/components/ui/BackButton"
import { cache } from "@/lib/cache"
import PageContainer from "@/components/ui/PageContainer"
import { Timestamp } from "firebase/firestore"
import { addDoc } from "firebase/firestore"

type Pedido = {
  id: string
  nomeCliente: string
  codigo: string
  status: "pendente" | "em_preparo" | "finalizado"
  precisaPreparo?: boolean
  avisoAt?: Timestamp
  itens: {
    nome: string
    quantidade: number
  }[]
  finalizadoAt?: Timestamp
}

export default function Cozinha() {

  const key = "cozinha-pedidos"

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [aba, setAba] = useState<"pendente" | "em_preparo" | "finalizado">("pendente")
const [busca, setBusca] = useState("")
  useEffect(() => {
    const load = () => {
      const local = localStorage.getItem(key)

      if (local) {
        setPedidos(JSON.parse(local) as Pedido[])
      } else if (cache[key]) {
        setPedidos(cache[key] as Pedido[])
      }
    }

    queueMicrotask(load)
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

      cache[key] = lista
      localStorage.setItem(key, JSON.stringify(lista))

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
  finalizadoAt: new Date(), // 🔥 ESSENCIAL
})

    setPedidoSelecionado(null)
  }

  async function voltarParaPreparo(id: string) {
    await updateDoc(doc(db, "pedidos", id), {
      status: "em_preparo",
    })
  }

  async function reenviarAviso(id: string) {
  await updateDoc(doc(db, "pedidos", id), {
    avisoAt: new Date(),
  })
}

async function reimprimirComanda(pedido: Pedido) {
  await addDoc(collection(db, "fila_cozinha"), {
    codigo: pedido.codigo,
    nome: pedido.nomeCliente,
    itens: pedido.itens,
    status: "pendente",
    createdAt: Date.now(),
  })
}

const pendentes = pedidos.filter(
  p => p.precisaPreparo && p.status === "pendente"
)

const emPreparo = pedidos.filter(
  p => p.precisaPreparo && p.status === "em_preparo"
)

const finalizados = pedidos
  .filter(
    p => p.precisaPreparo &&
    p.status === "finalizado"
  )

const filtrar = (lista: Pedido[]) =>
  lista.filter((pedido) =>
    pedido.codigo?.toString().includes(busca) ||
    pedido.nomeCliente?.toLowerCase().includes(busca.toLowerCase())
  )

const listaBase =
  aba === "pendente"
    ? pendentes
    : aba === "em_preparo"
    ? emPreparo
    : finalizados

const lista = listaBase.filter((pedido) =>
  pedido.codigo?.toString().includes(busca) ||
  pedido.nomeCliente?.toLowerCase().includes(busca.toLowerCase())
)

  const btnBase = "w-full h-12 rounded-lg text-sm font-semibold flex items-center justify-center"

  return (
    <PageContainer>

<div className="flex items-center justify-between mb-6">
  <div className="flex items-center gap-3">
    <img src="/logo.png" className="h-12 w-10" />
    <div>
      <h1 className="text-base font-bold">Central Gourmet</h1>
      <p className="text-xs text-gray-400">Cozinha</p>
    </div>
  </div>

  <BackButton href="/" />
</div>

<div className="mb-4">
  <input
    type="text"
    placeholder="Buscar por pedido ou cliente..."
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    className="w-full h-11 px-4 rounded-xl bg-gray-800 border border-gray-700 text-white outline-none"
  />
</div>


      {/* MOBILE */}
      <div className="flex gap-2 mb-4 lg:hidden">
        <button onClick={() => setAba("pendente")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "pendente" ? "bg-yellow-500 text-black" : "bg-gray-800"}`}>
          Pendentes ({pendentes.length})
        </button>

        <button onClick={() => setAba("em_preparo")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "em_preparo" ? "bg-blue-600" : "bg-gray-800"}`}>
          Preparo ({emPreparo.length})
        </button>

        <button onClick={() => setAba("finalizado")} className={`flex-1 p-2 rounded text-sm font-semibold ${aba === "finalizado" ? "bg-green-600" : "bg-gray-800"}`}>
          Prontos ({finalizados.length})
        </button>
      </div>

      {/* LISTA */}
      <div className="space-y-3 lg:hidden">
        {lista.map((pedido) => (
          <div key={pedido.id} className="bg-gray-800 px-4 min-h-[90px] py-3 rounded-xl flex flex-col justify-center">

            <span className="font-bold mb-2">
              #{pedido.codigo} • {pedido.nomeCliente}
            </span>

{pedido.status === "pendente" && (
  <button
    onClick={() => setPedidoSelecionado(pedido)}
    className={`${btnBase} bg-yellow-500 text-black`}
  >
    Detalhes
  </button>
)}

            {pedido.status === "em_preparo" && (
              <button
                onClick={() => setPedidoSelecionado(pedido)}
                className={`${btnBase} bg-blue-600`}
              >
                Detalhes
              </button>
            )}

{pedido.status === "finalizado" && (
  <button
    onClick={() => setPedidoSelecionado(pedido)}
    className={`${btnBase} bg-green-600 text-white`}
  >
    Detalhes
  </button>
)}

          </div>
        ))}
      </div>

      {/* DESKTOP */}
      <div className="hidden lg:grid grid-cols-3 gap-4">

        {[
{ lista: filtrar(pendentes), cor: "yellow", titulo: "Pendentes" },
{ lista: filtrar(emPreparo), cor: "blue", titulo: "Em preparo" },
{ lista: filtrar(finalizados), cor: "green", titulo: "Prontos" },
        ].map((col, i) => (
          <div key={i} className={`bg-${col.cor}-500/10 border border-${col.cor}-500/30 p-3 rounded-xl`}>
            <h2 className={`text-${col.cor}-400 font-semibold mb-3`}>
              {col.titulo} ({col.lista.length})
            </h2>

            <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              {col.lista.map((pedido) => (
                <div key={pedido.id} className="bg-gray-800 px-4 min-h-[90px] py-3 rounded-xl flex flex-col justify-center">

                  <span className="font-semibold mb-2">
                    #{pedido.codigo} • {pedido.nomeCliente}
                  </span>

{pedido.status === "pendente" && (
  <button
    onClick={() => setPedidoSelecionado(pedido)}
    className={`${btnBase} bg-yellow-500 text-black`}
  >
    Detalhes
  </button>
)}

                  {pedido.status === "em_preparo" && (
                    <button onClick={() => setPedidoSelecionado(pedido)} className={`${btnBase} bg-blue-600`}>
                      Detalhes
                    </button>
                  )}

{pedido.status === "finalizado" && (
  <button
    onClick={() => setPedidoSelecionado(pedido)}
    className={`${btnBase} bg-green-600 text-white`}
  >
    Detalhes
  </button>
)}

                </div>
              ))}
            </div>
          </div>
        ))}

      </div>

{/* MODAL */}
{pedidoSelecionado && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl w-[650px] max-w-[95vw]">

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

{pedidoSelecionado.status === "pendente" ? (
  <div className="grid grid-cols-4 gap-2">
    <button
      onClick={() => setPedidoSelecionado(null)}
      className="bg-gray-700 h-12 rounded-lg text-sm flex items-center justify-center"
    >
      Fechar
    </button>

    <button
      onClick={async () => {
        await assumirPedido(pedidoSelecionado.id)
        setPedidoSelecionado(null)
      }}
      className="bg-yellow-500 text-black h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
    >
      Assumir
    </button>

<button
  onClick={() => reimprimirComanda(pedidoSelecionado)}
  className="bg-blue-600 text-white h-12 rounded-lg text-sm font-semibold"
>
  Imprimir
</button>

<button
  onClick={confirmarFinalizar}
  className="bg-green-600 h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
>
  Finalizar
</button>

  </div>
) : pedidoSelecionado.status === "em_preparo" ? (
  <div className="grid grid-cols-4 gap-2">
    <button
      onClick={() => setPedidoSelecionado(null)}
      className="bg-gray-700 h-12 rounded-lg text-sm flex items-center justify-center"
    >
      Fechar
    </button>

    <button
      onClick={async () => {
        await voltarParaPendente(pedidoSelecionado.id)
        setPedidoSelecionado(null)
      }}
      className="bg-yellow-500 text-black h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
    >
      Voltar
    </button>

<button
  onClick={() => reimprimirComanda(pedidoSelecionado)}
  className="bg-blue-600 text-white h-12 rounded-lg text-sm font-semibold"
>
  Imprimir
</button>

    <button
      onClick={confirmarFinalizar}
      className="bg-green-600 h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
    >
      Finalizar
    </button>
  </div>
) : (
  <div className="grid grid-cols-4 gap-2">

    <button
      onClick={() => setPedidoSelecionado(null)}
      className="bg-gray-700 h-12 rounded-lg text-sm flex items-center justify-center"
    >
      Fechar
    </button>

    <button
      onClick={async () => {
        await voltarParaPreparo(pedidoSelecionado.id)
        setPedidoSelecionado(null)
      }}
      className="bg-red-600 text-white h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
    >
      Desfazer
    </button>

<button
  onClick={() => reimprimirComanda(pedidoSelecionado)}
  className="bg-blue-600 text-white h-12 rounded-lg text-sm font-semibold"
>
  Imprimir
</button>

    <button
      onClick={async () => {
        await reenviarAviso(pedidoSelecionado.id)
      }}
      className="bg-green-600 text-white h-12 rounded-lg text-sm font-semibold flex items-center justify-center"
    >
      Reavisar
    </button>

  </div>
)

}
    </div>
  </div>
)}
    </PageContainer>
  )
}