"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCachedUser } from "@/hooks/useAdminGuard"
import { Folder, Package, DollarSign, Lock } from "lucide-react"

import Card3D from "@/components/ui/Card3D"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    const user = getCachedUser()

    if (!user) return router.replace("/login")
    if (user.role !== "admin") return router.replace("/")
  }, [])

  return (
    <PageContainer>

      {/* 🔥 HEADER IGUAL DA HOME */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />

          <div>
            <h1 className="text-base font-bold">
              Admin
            </h1>
            <p className="text-xs text-gray-400">
              Configurações
            </p>
          </div>
        </div>

        {/* 👇 ÚNICA DIFERENÇA */}
        <BackButton href="/" />

      </div>

      <div className="grid gap-4">

        <Card3D
          href="/admin/categorias"
          icon={<Folder size={22} />}
          title="Categorias"
          description="Gerenciar categorias"
        />

        <Card3D
          href="/admin/produtos"
          icon={<Package size={22} />}
          title="Produtos"
          description="Gerenciar produtos"
        />

        <Card3D
          href="/admin/financeiro"
          icon={<DollarSign size={22} />}
          title="Financeiro"
          description="Relatórios e vendas"
        />

        <Card3D
          href="/admin/credenciais"
          icon={<Lock size={22} />}
          title="Credenciais"
          description="Alterar acesso"
        />

      </div>

    </PageContainer>
  )
}