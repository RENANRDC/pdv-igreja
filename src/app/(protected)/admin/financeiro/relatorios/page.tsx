"use client"

import { useEffect, useState } from "react"
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp
} from "firebase/firestore"
import { db } from "@/services/firebase"

import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"
import * as XLSX from "xlsx"
import { cache, persistCache } from "@/lib/cache"

/* ================= TYPES ================= */

type FirestoreDate =
  | Timestamp
  | { seconds: number; nanoseconds: number }
  | string
  | number

type Item = {
  nome: string
  quantidade: number
  preco?: number
}

type Pedido = {
  codigo?: string
  nomeCliente?: string
  total?: number
  valor?: number
  formaPagamento?: string
  itens?: Item[]
  createdAt?: FirestoreDate
}

type Fechamento = {
  id: string
  totalPedidos: number
  totalGeral: number
  createdAt?: FirestoreDate
  itens?: Pedido[]
}

type ItemExport = {
  Pedido?: string
  Produto: string
  Quantidade: number
  Preco: number
  Total: number
}

/* ================= UTILS ================= */

function formatarData(data?: FirestoreDate) {
  if (!data) return "-"

  if (typeof (data as Timestamp).toDate === "function") {
    return (data as Timestamp).toDate().toLocaleString("pt-BR")
  }

  if (typeof data === "object" && "seconds" in data) {
    return new Date(data.seconds * 1000).toLocaleString("pt-BR")
  }

  return new Date(data).toLocaleString("pt-BR")
}

function getTime(data?: FirestoreDate) {
  if (!data) return 0

  if (typeof (data as Timestamp).toDate === "function") {
    return (data as Timestamp).toDate().getTime()
  }

  if (typeof data === "object" && "seconds" in data) {
    return data.seconds * 1000
  }

  return new Date(data).getTime()
}

/* ================= PAGE ================= */

export default function RelatoriosPage() {

  const [dados, setDados] = useState<Fechamento[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Fechamento | null>(null)

  const [produtos, setProdutos] = useState<Record<string, { qtd: number; total: number }>>({})

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  /* ================= LOAD ================= */

  async function load() {
    const key = "financeiro-fechamentos"

    const cached = cache[key] as Fechamento[] | undefined

    if (cached && cached.length > 0) {
      setDados(cached)
    }

    try {
      const snap = await getDocs(collection(db, "fechamentos"))

      let lista: Fechamento[] = snap.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Fechamento, "id">)
      }))

      lista = lista.sort((a, b) => getTime(b.createdAt) - getTime(a.createdAt))

      cache[key] = lista
      persistCache()

      setDados(lista)

    } catch (err) {
      console.error("Erro ao carregar fechamentos:", err)
    }

    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      await load()
    }
    init()
  }, [])

  /* ================= ABRIR ================= */

  function abrirRelatorio(f: Fechamento) {
    setSelected(f)

    const map: Record<string, { qtd: number; total: number }> = {}

    const lista = f.itens || []

    lista.forEach(p => {
      p.itens?.forEach(i => {
        if (!map[i.nome]) {
          map[i.nome] = { qtd: 0, total: 0 }
        }

        map[i.nome].qtd += i.quantidade
        map[i.nome].total += (i.preco || 0) * i.quantidade
      })
    })

    setProdutos(map)
  }

  /* ================= EXPORT ================= */

  function exportarCompleto() {
    if (!selected) return

    const lista = selected.itens || []

    const hoje = new Date()
    const dataFormatada = hoje.toLocaleDateString("pt-BR").replace(/\//g, "-")

    const pedidosData = lista.map(p => ({
      Pedido: p.codigo,
      Cliente: p.nomeCliente || "",
      Pagamento: p.formaPagamento || "",
      Total: p.total || p.valor || 0,
      Data: formatarData(p.createdAt),
    }))

    const itensData: ItemExport[] = []

    lista.forEach(p => {
      p.itens?.forEach(i => {
        itensData.push({
          Pedido: p.codigo,
          Produto: i.nome,
          Quantidade: i.quantidade,
          Preco: i.preco || 0,
          Total: (i.preco || 0) * i.quantidade,
        })
      })
    })

    const produtosMap: Record<string, { qtd: number; total: number }> = {}

    lista.forEach(p => {
      p.itens?.forEach(i => {
        if (!produtosMap[i.nome]) {
          produtosMap[i.nome] = { qtd: 0, total: 0 }
        }

        produtosMap[i.nome].qtd += i.quantidade
        produtosMap[i.nome].total += (i.preco || 0) * i.quantidade
      })
    })

    const produtosData = Object.entries(produtosMap).map(([nome, d]) => ({
      Produto: nome,
      Quantidade: d.qtd,
      Total: d.total,
    }))

    const wb = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pedidosData), "Pedidos")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itensData), "Itens")
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(produtosData), "Produtos")

    XLSX.writeFile(wb, `relatorio-${dataFormatada}.xlsx`)
  }

  /* ================= LIMPAR ================= */

  async function limparRelatorios() {
    setDeleting(true)

    const snap = await getDocs(collection(db, "fechamentos"))

    for (const d of snap.docs) {
      await deleteDoc(doc(db, "fechamentos", d.id))
    }

    cache["financeiro-fechamentos"] = []
    persistCache()

    setConfirmDelete(false)
    setDados([])
    setDeleting(false)
  }

  /* ================= UI ================= */

  return (
    <PageContainer>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />
          <div>
            <h1 className="text-base font-bold">Central Gourmet</h1>
            <p className="text-xs text-gray-400">Relatórios</p>
          </div>
        </div>

        <BackButton href="/admin/financeiro" />
      </div>

      <button
        onClick={() => setConfirmDelete(true)}
        className="w-full bg-red-600 hover:bg-red-700 p-3 rounded-xl font-bold mb-4"
      >
        Limpar Relatórios
      </button>

      {loading ? (
        <p className="text-center text-gray-400">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {dados.map(f => (
            <div
              key={f.id}
              onClick={() => abrirRelatorio(f)}
              className="bg-gray-800 p-4 rounded-xl cursor-pointer hover:bg-gray-700 transition"
            >
              <p className="font-semibold">
                {formatarData(f.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-xl w-[400px]">

            <h2 className="text-lg font-bold mb-4">Relatório</h2>

            {Object.entries(produtos).map(([nome, d]) => (
              <div key={nome} className="flex justify-between text-sm">
                <span>{nome}</span>
                <span>{d.qtd}</span>
              </div>
            ))}

            <div className="mt-4 text-green-400 font-bold">
              Total: R$ {selected.totalGeral.toFixed(2)}
            </div>

            <div className="mt-2 text-sm text-gray-400">
              Ticket médio: R$ {(selected.totalGeral / (selected.totalPedidos || 1)).toFixed(2)}
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setSelected(null)} className="flex-1 bg-gray-700 p-2 rounded">
                Fechar
              </button>

              <button onClick={exportarCompleto} className="flex-1 bg-blue-600 p-2 rounded">
                Exportar
              </button>
            </div>

          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center">

          <div className="bg-gray-900 p-6 rounded-xl w-80 text-center border border-red-600">

            <p className="text-red-500 font-bold text-lg mb-3">
              ⚠️ ATENÇÃO CRÍTICA
            </p>

            <p className="text-sm text-gray-300 mb-4">
              Isso irá <strong>APAGAR TODOS OS RELATÓRIOS</strong> permanentemente.
            </p>

            <div className="flex gap-2">

              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 bg-gray-700 p-2 rounded"
              >
                Cancelar
              </button>

              <button
                onClick={limparRelatorios}
                disabled={deleting}
                className="flex-1 bg-red-600 p-2 rounded"
              >
                {deleting ? "Limpando..." : "Confirmar"}
              </button>

            </div>

          </div>

        </div>
      )}

    </PageContainer>
  )
}