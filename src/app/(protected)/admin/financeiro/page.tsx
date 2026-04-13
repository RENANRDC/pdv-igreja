"use client"

import BackButton from "@/components/BackButton"
import { useEffect, useState } from "react"
import {
  collection,
  onSnapshot,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/services/firebase"
import { cache } from "@/lib/cache"
import * as XLSX from "xlsx"

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

  const key = "financeiro-pedidos"

  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [limite, setLimite] = useState(50)
  const [exportado, setExportado] = useState(false)

  const [confirmModal, setConfirmModal] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [erroModal, setErroModal] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const local = localStorage.getItem(key)
    if (local) setPedidos(JSON.parse(local))
    else if (cache[key]) setPedidos(cache[key] as Pedido[])
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Pedido[]

      cache[key] = lista
      localStorage.setItem(key, JSON.stringify(lista))
      setPedidos(lista)
    })

    return () => unsubscribe()
  }, [])

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

  // 📦 PRODUTOS
  const produtos: Record<string, { qtd: number; total: number }> = {}

  ativos.forEach(p => {
    p.itens?.forEach(item => {
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

  // 🔥 EXPORTAR
function exportarExcel() {
  const hoje = new Date()
  const dataFormatada = hoje
    .toLocaleDateString("pt-BR")
    .replace(/\//g, "-")

  // 📋 PEDIDOS
const pedidosData = ativosOrdenados.map(p => ({
  Pedido: p.codigo,
  Cliente: p.nomeCliente || "",
  Pagamento: p.formaPagamento || "outros",
  Total: getTotal(p),
  Data: p.createdAt?.toDate?.().toLocaleString("pt-BR"),
}))

  // 📦 ITENS (DETALHADO)
type ItemExport = {
  Pedido?: string
  Produto: string
  Quantidade: number
  Preco: number
  Total: number
}

const itensData: ItemExport[] = []

ativosOrdenados.forEach(p => {
  p.itens?.forEach(item => {
    itensData.push({
      Pedido: p.codigo,
      Produto: item.nome,
      Quantidade: item.quantidade,
      Preco: item.preco || 0,
      Total: (item.preco || 0) * item.quantidade,
    })
  })
})

  // 🧾 PRODUTOS (RESUMO)
  const produtosData = rankingProdutos.map(p => ({
    Produto: p.nome,
    Quantidade: p.qtd,
    Total: p.total,
  }))

  // 📊 CRIA PLANILHA
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(pedidosData),
    "Pedidos"
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(itensData),
    "Itens"
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(produtosData),
    "Produtos"
  )

  // 📥 DOWNLOAD
  XLSX.writeFile(wb, `financeiro-${dataFormatada}.xlsx`)

  setExportado(true)
}

  // 🔥 FECHAMENTO
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
    <div className="min-h-[100dvh] bg-gray-900 text-white p-6">

      {/* HEADER */}
      <div className="grid grid-cols-3 items-center mb-6">
        <BackButton href="/admin" />
        <h1 className="text-center text-2xl font-bold">Financeiro</h1>
        <div />
      </div>

      {/* RESUMO */}
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

      {/* EXPORTAR */}
      <button
        onClick={exportarExcel}
        className="w-full bg-blue-600 hover:bg-blue-700 transition p-4 rounded-xl font-bold mb-4"
      >
        Exportar Relatório Completo
      </button>

      {/* 🔥 PRODUTOS (COLE AQUI) */}
<div className="bg-gray-800 p-4 rounded-xl mb-6">
  <h2 className="mb-3 font-semibold">Produtos</h2>

  {rankingProdutos.map((p, i) => (
    <div
      key={p.nome}
      className="flex justify-between border-b border-gray-700 py-2"
    >
      <span>#{i + 1} {p.nome}</span>

      <span>
        Qtd: {p.qtd} | R$ {p.total.toFixed(2)}
      </span>
    </div>
  ))}
</div>

      {/* PEDIDOS */}
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

      {/* FECHAR */}
      <button
        onClick={() => {
          if (!exportado) return setErroModal(true)
          setConfirmModal(true)
        }}
        className="w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl font-bold"
      >
        Fechar Caixa
      </button>

      {/* MODAL ERRO */}
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

      {/* MODAL CONFIRM */}
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

      {/* MODAL SUCESSO */}
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

    </div>
  )
}