"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/services/firebase"
import * as XLSX from "xlsx"
import { usePedidos } from "@/hooks/usePedidos"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"

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

  const [limite, setLimite] = useState(50)
  const [exportado, setExportado] = useState(false)

  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [erroModal, setErroModal] = useState(false)
  const [loading, setLoading] = useState(false)

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

  function exportarExcel() {
    const hoje = new Date()
    const dataFormatada = hoje.toLocaleDateString("pt-BR").replace(/\//g, "-")

    const pedidosData = ativosOrdenados.map(p => ({
      Pedido: p.codigo,
      Cliente: p.nomeCliente || "",
      Pagamento: p.formaPagamento || "outros",
      Total: getTotal(p),
      Data: p.createdAt?.toDate?.().toLocaleString("pt-BR"),
    }))

    type ItemExport = {
  Pedido?: string
  Produto: string
  Quantidade: number
  Preco: number
  Total: number
}

const itensData: ItemExport[] = []

    ativosOrdenados.forEach(p => {
      p.itens?.forEach((item: Item) => {
        itensData.push({
          Pedido: p.codigo,
          Produto: item.nome,
          Quantidade: item.quantidade,
          Preco: item.preco || 0,
          Total: (item.preco || 0) * item.quantidade,
        })
      })
    })

    const produtosData = rankingProdutos.map(p => ({
      Produto: p.nome,
      Quantidade: p.qtd,
      Total: p.total,
    }))

    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pedidosData), "Pedidos")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itensData), "Itens")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(produtosData), "Produtos")

    XLSX.writeFile(wb, `financeiro-${dataFormatada}.xlsx`)

    setExportado(true)
  }

  async function handleFechamento() {
    setLoading(true)

    try {
      await addDoc(collection(db, "fechamentos"), {
        totalPedidos,
        totalGeral,
        createdAt: serverTimestamp(),
      })

      const snapshot = await getDocs(collection(db, "pedidos"))

      const updates = snapshot.docs.map(docSnap =>
        updateDoc(doc(db, "pedidos", docSnap.id), {
          status: "fechado",
        })
      )

      await Promise.all(updates)

      setConfirmModal(false)
      setSuccessModal(true)
      setExportado(false)

    } catch {
      setErroModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>

      {/* HEADER PADRÃO */}
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

      <button
        onClick={exportarExcel}
        className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-bold mb-4"
      >
        Exportar Relatório Completo
      </button>

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
            <div className="flex justify-between">
              <span>#{p.codigo} • {p.nomeCliente || "Cliente"}</span>
              <span className="text-green-400">
                R$ {getTotal(p).toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-400">
              {p.formaPagamento}
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
        onClick={() => {
          if (!exportado) return setErroModal(true)
          setConfirmModal(true)
        }}
        className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold"
      >
        Fechar Caixa
      </button>

      {/* MODAIS (inalterados) */}

      {erroModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
            <p className="mb-4">Exporte o relatório antes de fechar</p>
            <button
              onClick={() => setErroModal(false)}
              className="w-full bg-gray-700 p-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {confirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center">
            <p className="mb-4 font-bold">Confirmar fechamento?</p>

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
                className="flex-1 bg-green-600 p-2 rounded"
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

    </PageContainer>
  )
}