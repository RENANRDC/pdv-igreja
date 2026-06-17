"use client"

import { useState } from "react"
import { db } from "@/services/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"
import { useCategorias } from "@/hooks/useCategorias"
import { useProdutos } from "@/hooks/useProdutos"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"
import UserInfo from "@/components/ui/UserInfo"
import { Search } from "lucide-react"

type Produto = {
  id: string
  nome: string
  preco: number
  categoriaId: string
  ativo: boolean
  estoque?: number
  precisaPreparo?: boolean
}

export default function ProdutosPage() {
  const [nome, setNome] = useState("")
  const [precoFormatado, setPrecoFormatado] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [estoque, setEstoque] = useState("")
  const [precisaPreparo, setPrecisaPreparo] = useState(true)
  const { categorias } = useCategorias()
  const { produtos } = useProdutos()
  const [busca, setBusca] = useState("")
  const [statusFiltro, setStatusFiltro] = useState("todos")
  const [confirmacao, setConfirmacao] = useState<{
  titulo: string
  descricao: string
  acao: () => Promise<void>
} | null>(null)
  function formatarReal(valor: string) {
    const numero = valor.replace(/\D/g, "")
    return (Number(numero) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  function parsePreco() {
    return Number(precoFormatado.replace(/\D/g, "")) / 100
  }

function limparFormulario() {
  setNome("")
  setPrecoFormatado("")
  setCategoriaId("")
  setEstoque("")
  setPrecisaPreparo(true)
  setEditandoId(null)
}

async function handleAdd() {
  if (!nome || !precoFormatado || !categoriaId) return

  const preco = parsePreco()

  if (editandoId) {
await updateDoc(doc(db, "produtos", editandoId), {
  nome,
  preco,
  categoriaId,
  estoque: Number(estoque || 0),
  precisaPreparo,
})

    

  } else {

await addDoc(collection(db, "produtos"), {
  nome,
  preco,
  categoriaId,
  ativo: true,
  estoque: Number(estoque || 0),
  precisaPreparo,
})

  }

limparFormulario()
}

function handleEdit(prod: Produto) {
  setNome(prod.nome)

  setPrecoFormatado(
    prod.preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  )

setCategoriaId(prod.categoriaId)
setEstoque(String(prod.estoque ?? 0))
setPrecisaPreparo(prod.precisaPreparo ?? true)
setEditandoId(prod.id)
}

function handleDelete(prod: Produto) {
  setConfirmacao({
    titulo: "Excluir produto",
    descricao: `Deseja excluir "${prod.nome}"?`,
    acao: async () => {
      await deleteDoc(doc(db, "produtos", prod.id))
    }
  })
}

function toggleProduto(prod: Produto) {
  setConfirmacao({
    titulo: prod.ativo
      ? "Desativar produto"
      : "Ativar produto",

    descricao: prod.ativo
      ? `Deseja desativar "${prod.nome}"?`
      : `Deseja ativar "${prod.nome}"?`,

    acao: async () => {
      await updateDoc(doc(db, "produtos", prod.id), {
        ativo: !prod.ativo,
      })
    }
  })
}

  function getCategoriaNome(id: string) {
    return categorias.find((c) => c.id === id)?.nome || "Sem categoria"
  }

const produtosFiltrados = produtos.filter((p: Produto) => {
  const categoriaOk =
    !categoriaFiltro || p.categoriaId === categoriaFiltro

  const buscaOk =
    p.nome.toLowerCase().includes(busca.toLowerCase())

  const statusOk =
    statusFiltro === "todos" ||
    (statusFiltro === "ativos" && p.ativo) ||
    (statusFiltro === "inativos" && !p.ativo)

  return categoriaOk && buscaOk && statusOk
})

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
              Produtos
            </p>
            <UserInfo />
          </div>
        </div>

        <BackButton href="/admin" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gray-800 p-4 rounded-xl space-y-3 self-start sticky top-6">

          <h2 className="font-semibold text-lg">
            {editandoId ? "Editar Produto" : "Novo Produto"}
          </h2>

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome do produto"
            className="w-full p-3 rounded bg-gray-700 outline-none"
          />

          <input
            value={precoFormatado}
            onChange={(e) => setPrecoFormatado(formatarReal(e.target.value))}
            placeholder="R$ 0,00"
            className="w-full p-3 rounded bg-gray-700 outline-none"
          />
<input
  type="number"
  min="0"
  value={estoque}
  onChange={(e) => setEstoque(e.target.value)}
  placeholder="Quantidade em estoque"
  className="w-full p-3 rounded bg-gray-700 outline-none"
/>

<label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={precisaPreparo}
    onChange={(e) => setPrecisaPreparo(e.target.checked)}
  />
  Precisa preparo na cozinha
</label>
          <select
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            className="w-full p-3 rounded bg-gray-700"
          >
            <option value="">Selecione a categoria</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (!nome || !precoFormatado || !categoriaId) {
                return
              }

              setConfirmacao({
                titulo: editandoId
                  ? "Salvar alterações"
                  : "Adicionar produto",

                descricao: editandoId
                  ? `Salvar alterações de "${nome}"?`
                  : `Adicionar "${nome}" ao catálogo?`,

                acao: async () => {
                  await handleAdd()
                }
              })
            }}
            className="bg-green-600 w-full p-3 rounded font-semibold"
          >
            {editandoId ? "Salvar Alterações" : "Adicionar"}
          </button>

            {editandoId && (
              <button
                onClick={limparFormulario}
                className="bg-gray-600 w-full p-3 rounded font-semibold"
              >
                Cancelar edição
              </button>
            )}

        </div>

 <div className="md:col-span-2 space-y-4">

  <div className="flex gap-2 mb-2">

    <div className="relative flex-1">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        placeholder="Buscar produto..."
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
      value={categoriaFiltro}
      onChange={(e) => setCategoriaFiltro(e.target.value)}
      className="p-3 rounded bg-gray-800"
    >
      <option value="">Todas categorias</option>
      {categorias.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.nome}
        </option>
      ))}
    </select>

    <select
      value={statusFiltro}
      onChange={(e) => setStatusFiltro(e.target.value)}
      className="p-3 rounded bg-gray-800"
    >
      <option value="todos">Todos os status</option>
      <option value="ativos">Ativos</option>
      <option value="inativos">Inativos</option>
    </select>

  </div>

          <div className="space-y-2">
            {produtosFiltrados.map((prod: Produto) => (
              <div
                key={prod.id}
                className="bg-gray-800 p-4 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{prod.nome}</p>
                  <p className="text-sm text-gray-400">
                    {getCategoriaNome(prod.categoriaId)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {prod.ativo ? "Ativo" : "Inativo"}
                  </p>
                  <p className="text-sm text-yellow-400 font-semibold">
                    Estoque: {prod.estoque ?? 0}
                  </p>
                </div>

                <div className="text-right space-y-2">
                  <p className="font-bold">
                    R$ {prod.preco.toFixed(2)}
                  </p>

                  <div className="flex gap-2 justify-end">

                    <button
                      onClick={() => handleEdit(prod)}
                      className="px-3 py-1 rounded bg-blue-600 text-sm"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => toggleProduto(prod)}
                      className={`px-3 py-1 rounded text-sm ${
                        prod.ativo ? "bg-red-600" : "bg-green-600"
                      }`}
                    >
                      {prod.ativo ? "Off" : "On"}
                    </button>

                    <button
                      onClick={() => handleDelete(prod)}
                      className="px-3 py-1 rounded bg-gray-600 text-sm"
                    >
                      Excluir
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {confirmacao && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

    <div className="bg-gray-900 w-[420px] max-w-[95vw] rounded-2xl p-6 border border-gray-700">

      <h2 className="text-xl font-bold mb-2">
        {confirmacao.titulo}
      </h2>

      <p className="text-gray-400 mb-6">
        {confirmacao.descricao}
      </p>

      <div className="flex gap-3">

        <button
          onClick={() => setConfirmacao(null)}
          className="flex-1 h-11 rounded-xl bg-gray-700 font-semibold"
        >
          Cancelar
        </button>

        <button
          onClick={async () => {
            await confirmacao.acao()
            setConfirmacao(null)
          }}
          className={`flex-1 h-11 rounded-xl font-semibold ${
            confirmacao.titulo.includes("Excluir")
              ? "bg-red-600"
              : "bg-green-600"
          }`}
        >
          Confirmar
        </button>

      </div>

    </div>

  </div>
)}
    </PageContainer>
  )
}