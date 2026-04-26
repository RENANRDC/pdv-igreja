"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/services/firebase"
import { usePedidos } from "@/hooks/usePedidos"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"
import { useRouter } from "next/navigation"
import { FolderOpen, Trash2 } from "lucide-react"

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  id: string
  codigo?: string
  nomeCliente?: string
  total?: number
  valor?: number
  formaPagamento?: string
  status: "pendente" | "em_preparo" | "finalizado" | "fechado"
  itens?: Item[]
  createdAt?: { toDate: () => Date }
}

export default function FinanceiroPage() {
  const { pedidos } = usePedidos()

  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const [limite, setLimite] = useState(50)

  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pedidoExcluir, setPedidoExcluir] = useState<Pedido | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const getTotal = (p: Pedido) => p.total ?? p.valor ?? 0

  const ativos = pedidos.filter(p => p.status !== "fechado")

  const ativosOrdenados = [...ativos].sort((a, b) => {
    const ta = a.createdAt?.toDate?.()?.getTime() || 0
    const tb = b.createdAt?.toDate?.()?.getTime() || 0
    return tb - ta
  })

  const totalPedidos = ativos.length
  const totalGeral = ativos.reduce((acc, p) => acc + getTotal(p), 0)
  const ticketMedio = totalGeral / (totalPedidos || 1)

  const produtos: Record<string, { qtd: number; total: number }> = {}

  ativos.forEach(p => {
    p.itens?.forEach((item: Item) => {
      if (!produtos[item.nome]) {
        produtos[item.nome] = { qtd: 0, total: 0 }
      }

      produtos[item.nome].qtd += item.quantidade
      produtos[item.nome].total += (item.preco || 0) * item.quantidade
    })
  })

  const rankingProdutos = Object.entries(produtos)
    .map(([nome, data]) => ({ nome, ...data }))
    .sort((a, b) => b.qtd - a.qtd)

async function confirmarExclusaoPedido() {
  if (!pedidoExcluir) return

  try {
    await deleteDoc(doc(db, "pedidos", pedidoExcluir.id))
    setPedidoExcluir(null)
  } catch (err) {
    console.error(err)
  }
}

  async function handleFechamento() {
    setLoading(true)

    try {
      // 🔥 SALVA HISTÓRICO
      await addDoc(collection(db, "fechamentos"), {
        totalPedidos,
        totalGeral,
        createdAt: serverTimestamp(),
        itens: ativos,
      })

      // 🔥 APAGA PEDIDOS
      const pedidosSnap = await getDocs(collection(db, "pedidos"))

      await Promise.all(
        pedidosSnap.docs.map(d =>
          deleteDoc(doc(db, "pedidos", d.id))
        )
      )

      // 🔥 APAGA FILA DE IMPRESSÃO (GARANTIDO)
      const filaSnap = await getDocs(collection(db, "fila_impressao"))

      await Promise.all(
        filaSnap.docs.map(d =>
          deleteDoc(doc(db, "fila_impressao", d.id))
        )
      )

      setConfirmModal(false)
      setSuccessModal(true)

    } catch (err) {
      console.error("ERRO NO FECHAMENTO:", err)
    } finally {
      setLoading(false)
    }
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
              Financeiro
            </p>
          </div>
        </div>

        <BackButton href="/admin" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gray-800 p-4 rounded-xl">
          <p>Pedidos</p>
          <p className="text-2xl">{totalPedidos}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <p>Total</p>
          <p className="text-2xl text-green-400">R$ {totalGeral.toFixed(2)}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <p>Ticket médio</p>
          <p className="text-2xl">R$ {ticketMedio.toFixed(2)}</p>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => router.push("/admin/financeiro/relatorios")}
          className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
        >
          <FolderOpen size={18} />
          Relatórios
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-xl mb-6">
        <h2 className="mb-3 font-semibold">Produtos</h2>

        {rankingProdutos.map((p, i) => (
          <div key={p.nome} className="flex justify-between border-b border-gray-700 py-2">
            <span>#{i + 1} {p.nome}</span>
            <span>Qtd: {p.qtd} | R$ {p.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-xl mb-6 max-h-[400px] overflow-y-auto">
        <h2 className="mb-3 font-semibold">Relatório de Pedidos</h2>

        {ativosOrdenados.slice(0, limite).map(p => (
          <div key={p.id} className="border-b border-gray-700 py-2">
<div className="flex justify-between items-center">
  <span>
    #{p.codigo} • {p.nomeCliente || "Cliente"}
  </span>

  <div className="flex items-center gap-3">
    <span className="text-green-400">
      R$ {getTotal(p).toFixed(2)}
    </span>

    <button
      onClick={() => setPedidoExcluir(p)}
      className="text-red-500 hover:text-red-400"
    >
      <Trash2 size={16} />
    </button>
  </div>
</div>
<div className="text-xs text-gray-400 flex justify-between">
  <span>{p.formaPagamento}</span>

  <span>
    {p.createdAt?.toDate?.()?.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }) || "--:--"}
  </span>
</div>
          </div>
        ))}

        {limite < ativosOrdenados.length && (
          <button
            onClick={() => setLimite(l => l + 50)}
            className="w-full mt-3 bg-gray-700 p-2 rounded"
          >
            Carregar mais
          </button>
        )}
      </div>

      <button
        onClick={() => setConfirmModal(true)}
        className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold"
      >
        Fechar Caixa
      </button>

      {confirmModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center border border-red-600">
            <p className="text-red-500 font-bold text-lg mb-3">
              ⚠️ ATENÇÃO CRÍTICA
            </p>

            <p className="text-sm text-gray-300 mb-4">
              Esta ação irá <strong>APAGAR TODOS OS PEDIDOS</strong> e não poderá ser desfeita.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmModal(false)}
                className="flex-1 bg-gray-700 p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={handleFechamento}
                disabled={loading}
                className="flex-1 bg-red-600 p-2 rounded"
              >
                {loading ? "Fechando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {successModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
            <p className="mb-4">Caixa fechado com sucesso</p>
            <button
              onClick={() => setSuccessModal(false)}
              className="w-full bg-green-600 p-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

{pedidoExcluir && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="bg-gray-900 p-6 rounded-xl w-80 border border-red-600">

      <h2 className="text-lg font-bold text-red-500 mb-3">
        Confirmar exclusão
      </h2>

      <p className="text-sm text-gray-300 mb-4">
        Deseja excluir o pedido #{pedidoExcluir.codigo}?
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setPedidoExcluir(null)}
          className="flex-1 bg-gray-700 p-2 rounded"
        >
          Cancelar
        </button>

        <button
          onClick={confirmarExclusaoPedido}
          className="flex-1 bg-red-600 p-2 rounded"
        >
          Excluir
        </button>
      </div>

    </div>
  </div>
)}

    </PageContainer>
  )
}
