"use client"

import { useState } from "react"

import {
  collection,
  addDoc,
} from "firebase/firestore"

import { formatarCaixa } from "@/utils/caixa"
import { db } from "@/services/firebase"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"
import UserInfo from "@/components/ui/UserInfo"
import { getCachedUser } from "@/hooks/useAdminGuard"
import { usePedidos, type Pedido } from "@/hooks/usePedidos"
import {
  Printer,
  Search,
} from "lucide-react"

export default function ControlePedidos() {
  const { pedidos } = usePedidos()
  const [busca, setBusca] = useState("")
  const [filtroCaixa, setFiltroCaixa] = useState("todos")
  const [pedidoSelecionado, setPedidoSelecionado] =
    useState<Pedido | null>(null)

  const [imprimindo, setImprimindo] = useState(false)

const pedidosFiltrados = pedidos.filter((pedido) => {
  const termo = busca.toLowerCase()

  const buscaOk =
    (pedido.codigo || "")
      .toLowerCase()
      .includes(termo) ||
    (pedido.nomeCliente || "")
      .toLowerCase()
      .includes(termo)

  const caixaOk =
    filtroCaixa === "todos" ||
    (pedido.caixa || "").trim().toLowerCase() ===
    filtroCaixa.trim().toLowerCase()


  return buscaOk && caixaOk
})

  function getTotal(pedido: Pedido) {
    return pedido.total ?? pedido.valor ?? 0
  }

  function getHora(pedido: Pedido) {
  if (!pedido.createdAt?.toDate) return "--:--"

  return pedido.createdAt
    .toDate()
    .toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })
}

  async function handlePrint(pedido: Pedido) {
    try {
      setImprimindo(true)
const user = getCachedUser()

const fila =
  user?.caixa === "caixa02"
    ? "fila_impressao_caixa02"
    : "fila_impressao_caixa01"

      const total = (pedido.itens || []).reduce(
        (acc, item) =>
          acc + (item.preco || 0) * item.quantidade,
        0
      )

      const link = `${window.location.origin}/client/${pedido.id}`

await addDoc(collection(db, fila), {
  codigo: pedido.codigo,
  nome: pedido.nomeCliente,
  itens: pedido.itens || [],
  total: total.toFixed(2),

  pagamento:
    pedido.formaPagamento?.toUpperCase() || "PIX",

  valorPago: total,
  troco: 0,

  caixa: user?.caixa || "caixa01",

  link,

  status: "pendente",

  createdAt: Date.now(),
})

      setTimeout(() => {
        setImprimindo(false)
        setPedidoSelecionado(null)
      }, 800)
    } catch (err) {
      console.error(err)
      setImprimindo(false)
    }
  }

  return (
    <PageContainer>
      {/* HEADER PADRÃO */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            className="h-10 w-10"
          />

          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>

            <p className="text-xs text-gray-400">
              Registros
            </p>
            <UserInfo />
          </div>
        </div>

        <BackButton href="/" />
      </div>

      {/* BUSCA */}
 {/* BUSCA */}
<div className="flex gap-2 mb-5">

  <div className="relative flex-1">
    <Search
      size={18}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
    />

    <input
      type="text"
      placeholder="Buscar por código ou consumidor..."
      value={busca}
      onChange={(e) => setBusca(e.target.value)}
      className="
        w-full
        pl-10
        pr-3
        py-3
        bg-gray-800
        border
        border-gray-700
        rounded-xl
        outline-none
        focus:border-green-500
      "
    />
  </div>

  <select
    value={filtroCaixa}
    onChange={(e) =>
      setFiltroCaixa(e.target.value)
    }
    className="
      px-3
      min-w-[120px]
      bg-gray-800
      border
      border-gray-700
      rounded-xl
      outline-none
      text-sm
    "
  >
    <option value="todos">
      Todos
    </option>

    <option value="caixa01">
      Caixa 1
    </option>

    <option value="caixa02">
      Caixa 2
    </option>
  </select>

</div>

      {/* LISTA */}
      {pedidosFiltrados.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          Nenhum registro encontrado
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
          {pedidosFiltrados.map((pedido) => (
            <button
              key={pedido.id}
              onClick={() =>
                setPedidoSelecionado(pedido)
              }
className="
  min-h-[95px]
  bg-gray-800
  border
  border-gray-700
  hover:bg-gray-700
  transition
  rounded-xl
  p-3
  text-left
"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">
                    #{pedido.codigo}
                  </p>

                  <p className="text-xs text-gray-400 truncate">
                    {pedido.nomeCliente}
                  </p>
                </div>

                <span className="font-bold text-green-400 shrink-0">
                  R$ {getTotal(pedido).toFixed(2)}
                </span>
              </div>

<div className="mt-1 text-[11px] text-gray-500">
  {pedido.formaPagamento?.toUpperCase() || "PIX"}
</div>

<div className="text-[11px] text-blue-400 font-semibold">
  {formatarCaixa(pedido.caixa)} • {getHora(pedido)}
</div>
            </button>
          ))}
        </div>
      )}

      {/* MODAL */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4">

            <h2 className="text-2xl font-bold mb-1">
              Pedido #{pedidoSelecionado.codigo}
            </h2>

<p className="text-sm text-blue-400 font-semibold mb-4">
  {formatarCaixa(pedidoSelecionado.caixa)} • {getHora(pedidoSelecionado)}
</p>

<p className="text-gray-400">
  Consumidor: <span className="text-white font-medium">
    {pedidoSelecionado.nomeCliente}
  </span>
</p>


            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-3">
                Itens
              </h3>

              <div className="space-y-2">
                {pedidoSelecionado.itens?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span>
                        {item.quantidade}x {item.nome}
                      </span>

                      <span>
                        R$
                        {(
                          (item.preco || 0) *
                          item.quantidade
                        ).toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="border-t border-gray-700 mt-4 pt-4">
              <p className="text-sm text-gray-400">
                Forma de pagamento
              </p>

              <p className="font-semibold">
                {pedidoSelecionado.formaPagamento?.toUpperCase() ||
                  "PIX"}
              </p>

              <p className="text-green-400 font-bold text-xl mt-3">
                Total: R${" "}
                {getTotal(
                  pedidoSelecionado
                ).toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={() =>
                  handlePrint(pedidoSelecionado)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  transition
                  font-bold
                  flex
                  items-center
                  justify-center
                  gap-2
                "
              >
                <Printer size={18} />

                {imprimindo
                  ? "Enviando..."
                  : "Reimprimir"}
              </button>

              <button
                onClick={() =>
                  setPedidoSelecionado(null)
                }
                className="
                  w-full
                  p-3
                  rounded-xl
                  bg-gray-700
                  hover:bg-gray-600
                  transition
                  font-bold
                "
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}