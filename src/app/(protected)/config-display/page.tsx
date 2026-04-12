"use client"

import { useEffect, useState } from "react"
import BackButton from "@/components/BackButton"
import { db } from "@/services/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { cache, clearCacheKey } from "@/lib/cache"
export default function ConfigDisplayPage() {
  const [limite, setLimite] = useState(20)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // 🔥 carregar config

useEffect(() => {
  async function load() {
    const key = "config-display"

if (typeof cache[key] === "number") {
  setLimite(cache[key])
  setLoading(false)
  return
}

    const ref = doc(db, "config", "display")
    const snap = await getDoc(ref)

    let valor = 20

    if (snap.exists()) {
      valor = snap.data().limiteProntos || 20
    }

    cache[key] = valor

    setLimite(valor)
    setLoading(false)
  }

  load()
}, [])

  // 💾 salvar
  async function confirmarSalvar() {
    setSaving(true)

await setDoc(doc(db, "config", "display"), {
  limiteProntos: limite,
})

clearCacheKey("config-display")

    setSaving(false)
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      {/* HEADER */}
      <div className="grid grid-cols-3 items-center mb-6">
        <div className="flex justify-start">
          <BackButton href="/" />
        </div>

        <div className="flex justify-center">
          <h1 className="text-2xl font-bold">Display</h1>
        </div>

        <div />
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {/* CONFIG */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-3 self-start">

          <h2 className="font-semibold text-lg">
            Configuração
          </h2>

          {loading ? (
            <div className="animate-pulse h-10 bg-gray-700 rounded" />
          ) : (
            <>
              <label className="text-sm text-gray-400">
                Quantidade de pedidos prontos
              </label>

              <input
                type="number"
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                className="w-full p-3 rounded bg-gray-700 outline-none"
              />

              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 w-full p-3 rounded font-semibold"
              >
                Salvar
              </button>
            </>
          )}
        </div>

        {/* INFO */}
        <div className="md:col-span-2 space-y-2">
          <div className="bg-gray-800 p-4 rounded">
            <p className="font-semibold">Como funciona</p>
            <p className="text-sm text-gray-400 mt-1">
              Define quantos pedidos aparecem na tela de Prontos.
            </p>
          </div>
        </div>

      </div>

      {/* 🔥 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">

            <h2 className="text-lg font-bold">
              Confirmar alteração
            </h2>

            <p className="text-sm text-gray-400">
              Deseja salvar o limite de <strong>{limite}</strong> pedidos?
            </p>

            <div className="flex gap-2 pt-2">

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-600 p-3 rounded font-semibold"
                disabled={saving}
              >
                Cancelar
              </button>

              <button
                onClick={confirmarSalvar}
                className="w-full bg-green-600 p-3 rounded font-semibold"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Confirmar"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  )
}