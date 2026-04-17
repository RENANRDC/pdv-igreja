"use client"

import { useEffect, useState } from "react"
import BackButton from "@/components/ui/BackButton"
import { db } from "@/services/firebase"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { cache, clearCacheKey } from "@/lib/cache"
import PageContainer from "@/components/ui/PageContainer"

export default function ConfigDisplayPage() {
  const key = "config-display"

  const valorInicial =
    typeof cache[key] === "number" ? cache[key] : 20

  const [limite, setLimite] = useState<number>(valorInicial)

  const [printerIp, setPrinterIp] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("printer_ip") || "http://localhost:3001"
    }
    return "http://localhost:3001"
  })

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // 🔥 NOVO: TOAST
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    const ref = doc(db, "config", "display")

    const unsub = onSnapshot(ref, (snap) => {
      const valor = snap.exists()
        ? snap.data().limiteProntos || 20
        : 20

      cache[key] = valor
      setLimite(valor)
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    const ref = doc(db, "config", "printer")

    const unsub = onSnapshot(ref, (snap) => {
      const valor = snap.exists()
        ? snap.data().url || "http://localhost:3001"
        : "http://localhost:3001"

      setPrinterIp(valor)
      localStorage.setItem("printer_ip", valor)
    })

    return () => unsub()
  }, [])

  async function confirmarSalvar() {
    try {
      setSaving(true)

      await Promise.all([
        setDoc(doc(db, "config", "display"), {
          limiteProntos: limite,
        }),
        setDoc(doc(db, "config", "printer"), {
          url: printerIp,
        }),
      ])

      localStorage.setItem("printer_ip", printerIp)
      clearCacheKey(key)

setShowModal(false)

setTimeout(() => {
  showToast("Ajustes aplicados", "success")
}, 100)

    } catch (err) {
      showToast("Erro ao salvar configurações", "error")
    } finally {
      setSaving(false)
    }
  }

  return (
    <PageContainer>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />
          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>
            <p className="text-xs text-gray-400">
              Ajustes
            </p>
          </div>
        </div>

        <BackButton href="/admin" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-gray-800 p-4 rounded-xl space-y-4 self-start">

          <h2 className="font-semibold text-lg">
            Configuração
          </h2>

          <div>
            <p className="text-sm text-gray-400 mb-1">
              Limite de pedidos prontos
            </p>
            <input
              type="number"
              value={limite}
              onChange={(e) => setLimite(Number(e.target.value))}
              className="w-full p-3 rounded bg-gray-700 outline-none"
            />
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-1">
              IP da Impressora
            </p>
            <input
              value={printerIp}
              onChange={(e) => setPrinterIp(e.target.value)}
              placeholder="http://192.168.1.7:3001"
              className="w-full p-3 rounded bg-gray-700 outline-none"
            />
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 w-full p-3 rounded font-semibold"
          >
            Salvar
          </button>

        </div>

        <div className="md:col-span-2 space-y-2">

          <div className="bg-gray-800 p-4 rounded">
            <p className="font-semibold">Display</p>
            <p className="text-sm text-gray-400 mt-1">
              Define quantos pedidos PRONTOS serão exibidos no painel ao vivo.
            </p>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <p className="font-semibold">Impressora</p>
            <p className="text-sm text-gray-400 mt-1">
              Informe o IP do computador que está rodando o serviço de impressão.
            </p>
          </div>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">

            <h2 className="text-lg font-bold">
              Confirmar alteração
            </h2>

            <p className="text-sm text-gray-400">
              Limite: <strong>{limite}</strong><br />
              Impressora: <strong>{printerIp}</strong>
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

      {/* 🔥 TOAST */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[9999] px-4 py-2 rounded-lg shadow-lg text-sm
          ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

    </PageContainer>
  )
}