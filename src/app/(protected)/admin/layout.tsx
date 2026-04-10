"use client"

import { useAdminGuard } from "@/hooks/useAdminGuard"
import Footer from "@/components/Footer"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAdminGuard()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Verificando acesso...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">

      {/* CONTEÚDO */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* FOOTER */}
      <Footer />

    </div>
  )
}