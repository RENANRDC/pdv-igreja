"use client"

import { useState } from "react"
import BackButton from "@/components/BackButton"
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

type Produto = {
  id: string
  nome: string
  preco: number
  categoriaId: string
  ativo: boolean
}

export default function ProdutosPage() {
  const [nome, setNome] = useState("")
  const [precoFormatado, setPrecoFormatado] = useState("")
  const [categoriaId, setCategoriaId] = useState("")
  const [categoriaFiltro, setCategoriaFiltro] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const { categorias } = useCategorias()
  const { produtos } = useProdutos()

  // 💰 formatar real
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

  // ➕ criar / editar
  async function handleAdd() {
    if (!nome || !precoFormatado || !categoriaId) return

    const preco = parsePreco()

    if (editandoId) {
      await updateDoc(doc(db, "produtos", editandoId), {
        nome,
        preco,
        categoriaId,
      })
      setEditandoId(null)
    } else {
      await addDoc(collection(db, "produtos"), {
        nome,
        preco,
        categoriaId,
        ativo: true,
      })
    }

    setNome("")
    setPrecoFormatado("")
    setCategoriaId("")
  }

  // ✏️ editar
  function handleEdit(prod: Produto) {
    setNome(prod.nome)
    setPrecoFormatado(
      prod.preco.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    )
    setCategoriaId(prod.categoriaId)
    setEditandoId(prod.id)
  }

  // ❌ excluir
  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir este produto?")) return
    await deleteDoc(doc(db, "produtos", id))
  }

  // 🔄 toggle ativo
  async function toggleProduto(prod: Produto) {
    await updateDoc(doc(db, "produtos", prod.id), {
      ativo: !prod.ativo,
    })
  }

  function getCategoriaNome(id: string) {
    return categorias.find((c) => c.id === id)?.nome || "Sem categoria"
  }

  const produtosFiltrados = categoriaFiltro
    ? produtos.filter((p) => p.categoriaId === categoriaFiltro)
    : produtos

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

<div className="grid grid-cols-3 items-center mb-6">

  {/* ESQUERDA */}
  <div className="flex justify-start">
    <BackButton href="/admin" />
  </div>

  {/* CENTRO */}
  <div className="flex justify-center">
    <h1 className="text-2xl font-bold">Produtos</h1>
  </div>

  {/* DIREITA (reserva futura) */}
  <div />

</div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* 🧾 CADASTRO */}
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
            onClick={handleAdd}
            className="bg-green-600 w-full p-3 rounded font-semibold"
          >
            {editandoId ? "Salvar Alterações" : "Adicionar"}
          </button>
        </div>

        {/* 📋 LISTA */}
        <div className="md:col-span-2 space-y-4">

          {/* 🔍 FILTRO */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="p-3 rounded bg-gray-800 w-full"
          >
            <option value="">Todas categorias</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nome}
              </option>
            ))}
          </select>

          {/* 📦 LISTA */}
          <div className="space-y-2">
            {produtosFiltrados.map((prod) => (
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
                      onClick={() => handleDelete(prod.id)}
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
    </div>
  )
}