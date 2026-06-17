"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSessionRefresh } from "@/hooks/useSessionRefresh"
import {
  clearUserCache,
  getCachedUser,
  User,
} from "@/hooks/useAdminGuard"
import { clearVendaMode } from "@/hooks/useVendaMode"
import {
  Receipt,
  ChefHat,
  Shield,
  Tv,
  Clipboard
} from "lucide-react"

import Card3D from "@/components/ui/Card3D"
import PageContainer from "@/components/ui/PageContainer"
import Button from "@/components/ui/Button"
import UserInfo from "@/components/ui/UserInfo"
import { LogOut } from "lucide-react"

export default function MenuPage() {
  const router = useRouter()
  useSessionRefresh()

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const cached = getCachedUser()
    Promise.resolve().then(() => {
      setUser(
  cached || {
    role: "user",
    username: null,
    caixa: "caixa01"
  }
)
    })
  }, [])

  if (!user) return null

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    })

    clearUserCache()
    clearVendaMode()

    router.push("/login")
  }

  return (
    <PageContainer>

      {/* HEADER (mantido igual) */}
      <div className="flex items-center justify-between mb-6">

        <div className="flex items-center gap-3">
          <img src="/logo.png" className="h-10 w-10" />
          <div>
            <h1 className="text-base font-bold">
              Central Gourmet
            </h1>
            <p className="text-xs text-gray-400">
              Painel
            </p>
            <UserInfo />
          </div>
        </div>

        {/* 🔥 BOTÃO PADRONIZADO */}
<Button onClick={handleLogout}>
  <div className="flex items-center gap-2">
    <LogOut size={16} />
    Sair
  </div>
</Button>

      </div>

      <div className="grid gap-4">

        <Card3D
          href="/pdv"
          icon={<Receipt size={22} />}
          title="Caixa"
          description="Realizar pedidos"
        />

        <Card3D
          href="/pedidos"
          icon={<Clipboard size={22} />}
          title="Registros"
          description="Gerenciar pedidos"
        />

        {user.role === "admin" && (
          <Card3D
            href="/admin"
            icon={<Shield  size={22} />}
            title="Admin"
            description="Configurações"
          />
        )}

      </div>

    </PageContainer>
  )
}