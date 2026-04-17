"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCachedUser } from "@/hooks/useAdminGuard"
import { Folder, Package, DollarSign, Lock, Settings } from "lucide-react"

import Card3D from "@/components/ui/Card3D"
import PageContainer from "@/components/ui/PageContainer"
import BackButton from "@/components/ui/BackButton"

export default function AdminPage() {
  const router = useRouter()

  const user = getCachedUser()

  useEffect(() => {
    if (!user) {
      router.replace("/login")
      return
    }

    if (user.role !== "admin") {
      router.replace("/")
      return
    }
  }, [user, router])

  if (!user || user.role !== "admin") return null

  return (
    <PageContainer>

      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />

          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>
            <p className="text-xs text-gray-400">
              Configurações
            </p>
          </div>
        </div>

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
          href="/admin/ajustes"
          icon={<Settings size={22} />}
          title="Ajustes"
          description="Ajustes do sistema"
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