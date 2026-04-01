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

type Categoria = {
  id: string
  nome: string
  ativo: boolean
}

export default function CategoriasPage() {
  const [nome, setNome] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const { categorias } = useCategorias()

  // ➕ criar / editar
  async function handleAdd() {
    if (!nome.trim()) return

    if (editandoId) {
      await updateDoc(doc(db, "categorias", editandoId), {
        nome,
      })
      setEditandoId(null)
    } else {
      await addDoc(collection(db, "categorias"), {
        nome,
        ativo: true,
      })
    }

    setNome("")
  }

  // ✏️ editar
  function handleEdit(cat: Categoria) {
    setNome(cat.nome)
    setEditandoId(cat.id)
  }

  // ❌ excluir
  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta categoria?")) return
    await deleteDoc(doc(db, "categorias", id))
  }

  // 🔄 toggle ativo
  async function toggleCategoria(cat: Categoria) {
    await updateDoc(doc(db, "categorias", cat.id), {
      ativo: !cat.ativo,
    })
  }

  // ❌ cancelar edição
  function handleCancel() {
    setNome("")
    setEditandoId(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

<div className="grid grid-cols-3 items-center mb-6">

  {/* ESQUERDA */}
  <div className="flex justify-start">
    <BackButton href="/admin" />
  </div>

  {/* CENTRO */}
  <div className="flex justify-center">
    <h1 className="text-2xl font-bold">Categorias</h1>
  </div>

  {/* DIREITA (reserva futura) */}
  <div />

</div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* 🧾 CADASTRO */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-3 self-start">

          <h2 className="font-semibold text-lg">
            {editandoId ? "Editar Categoria" : "Nova Categoria"}
          </h2>

          <input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da categoria"
            className="w-full p-3 rounded bg-gray-700 outline-none"
          />

          <div className="flex gap-2">

            <button
              onClick={handleAdd}
              className="bg-green-600 w-full p-3 rounded font-semibold"
            >
              {editandoId ? "Salvar" : "Adicionar"}
            </button>

            {editandoId && (
              <button
                onClick={handleCancel}
                className="bg-gray-600 w-full p-3 rounded font-semibold"
              >
                Cancelar
              </button>
            )}

          </div>
        </div>

        {/* 📋 LISTA */}
        <div className="md:col-span-2 space-y-2">

          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="bg-gray-800 p-4 rounded flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{cat.nome}</p>
                <p className="text-sm text-gray-400">
                  {cat.ativo ? "Ativo" : "Inativo"}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  onClick={() => handleEdit(cat)}
                  className="px-3 py-1 rounded bg-blue-600 text-sm"
                >
                  Editar
                </button>

                <button
                  onClick={() => toggleCategoria(cat)}
                  className={`px-3 py-1 rounded text-sm ${
                    cat.ativo ? "bg-red-600" : "bg-green-600"
                  }`}
                >
                  {cat.ativo ? "Off" : "On"}
                </button>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-3 py-1 rounded bg-gray-600 text-sm"
                >
                  Excluir
                </button>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  )
}