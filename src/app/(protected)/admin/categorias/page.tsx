"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/services/firebase"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore"
import { useCategorias } from "@/hooks/useCategorias"

import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"

type Categoria = {
  id: string
  nome: string
  ativo: boolean
}

export default function CategoriasPage() {

  const router = useRouter()

  const [nome, setNome] = useState("")
  const [editandoId, setEditandoId] = useState<string | null>(null)

  const { categorias } = useCategorias()

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

  function handleEdit(cat: Categoria) {
    setNome(cat.nome)
    setEditandoId(cat.id)
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja excluir esta categoria?")) return
    await deleteDoc(doc(db, "categorias", id))
  }

  async function toggleCategoria(cat: Categoria) {
    await updateDoc(doc(db, "categorias", cat.id), {
      ativo: !cat.ativo,
    })
  }

  function handleCancel() {
    setNome("")
    setEditandoId(null)
  }

  return (
    <PageContainer>

      {/* ✅ HEADER IGUAL HOME */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />
          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>
            <p className="text-xs text-gray-400">
              Categorias
            </p>
          </div>
        </div>

<BackButton href="/admin" />

      </div>

      {/* ✅ CONTEÚDO ORIGINAL (INALTERADO) */}
      <div className="grid md:grid-cols-3 gap-6">

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

    </PageContainer>
  )
}