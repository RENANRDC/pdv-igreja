"use client"

import BackButton from "@/components/BackButton"
import { useAdminGuard } from "@/hooks/useAdminGuard"

export default function CredenciaisPage() {

  useAdminGuard()

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

<div className="grid grid-cols-3 items-center mb-6">

  {/* ESQUERDA */}
  <div className="flex justify-start">
    <BackButton href="/admin" />
  </div>

  {/* CENTRO */}
  <div className="flex justify-center">
    <h1 className="text-2xl font-bold">Credenciais</h1>
  </div>

  {/* DIREITA (reserva futura) */}
  <div />

</div>
      <p className="text-gray-400 mt-2">Em breve...</p>

    </div>
  )
}