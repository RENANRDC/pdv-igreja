"use client"

import { useAdminGuard } from "@/hooks/useAdminGuard"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { loading } = useAdminGuard()

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900 text-white">
        Verificando acesso...
      </div>
    )
  }

  return <>{children}</>
}